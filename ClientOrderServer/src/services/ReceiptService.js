const { sequelize, Order, Food, Receipt, ReceiptItem, OrderFood, User } = require('../database');
const { Op } = require('sequelize');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../constants/order.constants');
const { formatDateTime } = require('../utils/dateTimeUtils.js');

/**
 * Sinh số biên lai duy nhất: RC[yymmdd][seq4]
 * @param {import('sequelize').Transaction} t
 */
async function generateReceiptNumber(t) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;
    const prefix = `RC${yymmdd}`;

    const countToday = await Receipt.count({
        where: { receiptNumber: { [Op.like]: `${prefix}%` } },
        transaction: t,
    });
    const seq = countToday + 1;
    const seq4 = String(seq).padStart(4, '0');
    return `${prefix}${seq4}`;
}

/**
 * Tạo biên lai thanh toán (receipt) cho một đơn hàng đã tồn tại.
 *
 * Luồng xử lý:
 * - Mở transaction DB và khóa bi quan (FOR UPDATE) bản ghi Order để an toàn cạnh tranh.
 * - Tải các dòng món từ bảng OrderFood và Food bằng các truy vấn riêng (tránh lỗi FOR UPDATE với outer join).
 * - Tính toán tiền: totalAmount, discountAmount, taxAmount, finalAmount, paidAmount, changeAmount.
 * - Sinh số biên lai duy nhất (RC[yymmdd][seq4]) ngay trong transaction.
 * - Ghi bản ghi receipt (header) và các dòng receipt_item liên quan.
 * - Commit transaction và trả về object receipt có trường items.
 *
 * Chính sách retry:
 * - Thử lại tối đa 5 lần nếu gặp lỗi trùng khóa duy nhất của receipt_number.
 *
 * @param {number} orderId Bắt buộc: ID của đơn hàng cần tạo biên lai
 * @param {{ paymentMethod?: number, paidAmount?: number, discountAmount?: number, taxAmount?: number, cashierId?: number, notes?: string }} [options]
 * @returns {Promise<{ items: Array<{ itemId:number, itemName:string, quantity:number, unitPrice:number, totalPrice:number }>, [key:string]: any }>} Trả về object receipt (các field header) kèm thuộc tính items
 * @throws Lỗi khi không tìm thấy order, hoặc lỗi DB (đã rollback)
 */
async function createReceiptByOrderId(orderId, options = {}) {
    // Kiểm tra đầu vào
    if (!orderId) throw new Error('Missing orderId');

    // Tách và chuẩn hóa tham số với giá trị mặc định hợp lý
    const {
        paymentMethod = PAYMENT_METHOD.CASH, // INTEGER: 0=cash, 1=bank_transfer
        paidAmount: paidAmountInput,
        discountAmount: discountInput = 0,
        taxAmount: taxInput = 0,
        cashierId = null,
        notes = null,
    } = options;

    // Vòng lặp retry để giảm thiểu race condition hiếm gặp về số biên lai duy nhất
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const t = await sequelize.transaction();
        try {
            // 1) Khóa bản ghi Order (không JOIN) để ngăn thay đổi đồng thời trong lúc tạo biên lai
            const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!order) {
                throw new Error('Order not found');
            }

            // 2) Tải items bằng truy vấn riêng để tránh vấn đề khóa với outer join
            const orderFoodRows = await OrderFood.findAll({ where: { orderId: order.id }, transaction: t });
            const foodIds = orderFoodRows.map(r => r.foodId);
            const foods = foodIds.length ? await Food.findAll({ where: { id: foodIds }, transaction: t }) : [];
            const nameMap = new Map(foods.map(f => [f.id, f.name]));

            // Chuyển sang cấu trúc item dùng cho tính tiền và insert receipt_item
            const items = orderFoodRows.map(r => {
                const qty = r.quantity || 0;
                const unit = r.unitPrice || 0;
                return {
                    itemId: r.foodId,
                    itemName: nameMap.get(r.foodId) || `Item ${r.foodId}`,
                    quantity: qty,
                    unitPrice: unit,
                    totalPrice: qty * unit,
                };
            });

            // 3) Tính toán tiền với ép kiểu an toàn
            const totalAmount = items.reduce((s, it) => s + it.totalPrice, 0);
            const discountAmount = Number.isFinite(+discountInput) ? +discountInput : 0;
            const taxAmount = Number.isFinite(+taxInput) ? +taxInput : 0;
            const finalAmount = totalAmount - discountAmount + taxAmount;
            const paidAmount = paidAmountInput != null ? +paidAmountInput : finalAmount; // mặc định: thanh toán đủ
            const changeAmount = Math.max(0, paidAmount - finalAmount);

            // 4) Sinh số biên lai trong transaction để tránh trùng khi có nhiều yêu cầu đồng thời
            const receiptNumber = await generateReceiptNumber(t);

            // 5) Lưu header của biên lai
            const receipt = await Receipt.create({
                orderId: order.id,
                receiptNumber,
                totalAmount,
                discountAmount,
                taxAmount,
                finalAmount,
                paidAmount,
                changeAmount,
                paymentMethod, // INTEGER: 0=cash, 1=bank_transfer
                paidAt: formatDateTime(new Date()),
                cashierId,
                status: 1, // INTEGER: 1=paid
                note: notes,
            }, { transaction: t, userId: cashierId });

            // 6) Lưu các dòng receipt_item hàng loạt
            if (items.length) {
                const itemRows = items.map(it => ({
                    receiptId: receipt.id,
                    itemId: it.itemId,
                    itemName: it.itemName,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    totalPrice: it.totalPrice,
                    createdCd: cashierId || 'SYSTEM',
                }));
                await ReceiptItem.bulkCreate(itemRows, { transaction: t });
            }

            // 7) Cập nhật paymentStatus của Order thành PAID
            order.paymentStatus = PAYMENT_STATUS.PAID;
            await order.save({ transaction: t });

            const user = await User.findByPk(cashierId);
            const userCode = user ? user.code : '';

            // 8) Commit và trả về receipt (plain) kèm items bên trong
            await t.commit();
            const plain = typeof receipt.get === 'function' ? receipt.get({ plain: true }) : receipt;
            return { ...plain, shopCode: order.shopCode, userCode, items };
        } catch (err) {
            // Chỉ rollback một lần (tránh lỗi double rollback)
            try { await t.rollback(); } catch (_) { }

            // Nếu trùng khóa unique receipt_number thì retry lần tiếp theo
            const isUniqueViolation = err?.name === 'SequelizeUniqueConstraintError' || err?.parent?.code === '23505';
            if (isUniqueViolation && attempt < maxAttempts) {
                continue;
            }
            // Các lỗi khác đẩy ra controller xử lý
            throw err;
        }
    }
    throw new Error('Failed to create receipt');
}

module.exports = {
    createReceiptByOrderId,
};
