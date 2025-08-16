const { Order, OrderFood, Food, sequelize } = require('../database');
const { Op } = require('sequelize');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constants');

// Order: model đơn hàng
// OrderFood: bảng trung gian order - food (nhiều-nhiều) có thêm quantity, unitPrice
// Food: model món ăn
// sequelize: instance để tạo transaction

// Sinh mã đơn hàng: [shopCode][yymmdd][seq4]
async function generateOrderNumber(t, shopCode, deviceCode) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;
    const prefix = `${shopCode}${deviceCode}${yymmdd}`;

    // Đếm số đơn đã tạo trong ngày cho cửa hàng này
    const countToday = await Order.count({
        where: { orderNumber: { [Op.like]: `${prefix}%` } },
        transaction: t,
        order: [['id', 'DESC']],
    });
    const seq = countToday + 1;
    const seq4 = String(seq).padStart(4, '0');
    return `${prefix}${seq4}`;
}

/**
 * Tạo đơn hàng và các dòng món hàng (order_food)
 * Server tự sinh orderNumber, không dùng từ client
 * @param {{ shopCode?: string, note?: string, items: Array<{ foodId: number, quantity: number }> }} orderData
 * @returns {Promise<import('sequelize').Model | null>} Trả về đối tượng Order vừa tạo hoặc null khi lỗi
 */
async function createOrders(orderData) {
    // Chuẩn bị dữ liệu sản phẩm, tính tổng ngoài vòng lặp (không phụ thuộc transaction)
    const foodIds = orderData.items?.map(i => i.foodId) || [];
    const foods = await Food.findAll({ where: { id: foodIds } });
    const priceMap = new Map(foods.map(f => [f.id, f.price]));
    const totalPrice = (orderData.items || []).reduce((sum, i) => sum + (priceMap.get(i.foodId) || 0) * (i.quantity || 1), 0);
    const maxAttempts = 5;

    // Thử tạo đơn hàng tối đa 5 lần nếu trùng mã
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const t = await sequelize.transaction();
        try {
            // Tự sinh số đơn hàng theo rule trong transaction
            const orderNumber = await generateOrderNumber(t, orderData.shopCode, orderData.deviceCode);

            // Tạo bản ghi Order chính
            const order = await Order.create({
                orderNumber,
                note: orderData.note || null,
                totalPrice,
                status: ORDER_STATUS.RECEIVED,
                paymentStatus: PAYMENT_STATUS.UNPAID,
            }, { transaction: t });

            // Chuẩn bị các dòng bảng trung gian order_food
            const rows = (orderData.items || []).map(i => ({
                orderId: order.id,
                foodId: i.foodId,
                quantity: i.quantity || 1,
                unitPrice: priceMap.get(i.foodId) || 0,
            }));
            // Nếu có món thì thêm vào bảng trung gian
            if (rows.length) {
                await OrderFood.bulkCreate(rows, { transaction: t });
            }

            await t.commit();
            return order;
        } catch (err) {
            await t.rollback();
            // Nếu trùng unique order_number thì retry
            const isUniqueViolation = err?.name === 'SequelizeUniqueConstraintError' || err?.parent?.code === '23505';
            if (isUniqueViolation && attempt < maxAttempts) {
                continue; // thử lại
            }
            console.error('Create order failed:', err);
            return null;
        }
    }
}

/**
 * Lấy danh sách đơn hàng trong ngày với các status chỉ định + foods dạng đơn giản [{id,name,quantity}]
 */
async function getOrdersByStatus() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
        where: {
            status: { [Op.in]: [ORDER_STATUS.RECEIVED, ORDER_STATUS.PROCESSING, ORDER_STATUS.COMPLETED, ORDER_STATUS.DELIVERED] },
            paymentStatus: PAYMENT_STATUS.PAID, // Chỉ lấy đơn đã thanh toán
            createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
        include: [
            {
                model: Food,
                as: 'foods',
                attributes: ['id', 'name'],
                through: { attributes: ['quantity'] },
            }
        ],
        order: [['id', 'ASC']],
    });

    // Map đơn giản hóa dữ liệu
    return orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        note: o.note,
        foods: (o.foods || []).map(f => ({
            id: f.id,
            name: f.name,
            quantity: f.OrderFood?.quantity || 0,
        }))
    }));
}

/**
 * Lấy danh sách order numbers cho dashboard
 * Dùng getOrdersByStatus để lấy dữ liệu rồi rút gọn field theo định dạng cần thiết
 * @returns {Promise<Array<{id:number, orderNumber:string, status:string}>>}
 */
async function getOrderNumbersForDashboard() {
    const orders = await getOrdersByStatus();
    return orders;
}

/**
 * Cập nhật trạng thái đơn hàng theo orderId
 * @param {number} orderId
 * @param {'Received' | 'Processing' | 'Completed' | 'Cancelled'} status
 */
async function updateOrderStatus(orderId, status) {
    const allowed = [ORDER_STATUS.RECEIVED, ORDER_STATUS.PROCESSING, ORDER_STATUS.COMPLETED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(status)) {
        throw new Error('Invalid status');
    }
    const order = await Order.findByPk(orderId);
    if (!order) return null;
    order.status = status;
    await order.save();
    return order;
}

/**
 * Cập nhật thông tin đơn hàng (ghi đè items mới)
 * @param {number} orderId
 * @param {{ note?: string, items?: Array<{ foodId: number, quantity: number }> }} data
 */
async function updateOrderDetails(orderId, data) {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) {
            await t.rollback();
            return null;
        }
        const items = Array.isArray(data.items) ? data.items : [];
        const foodIds = items.map(i => i.foodId);
        const foods = foodIds.length ? await Food.findAll({ where: { id: foodIds }, transaction: t }) : [];
        const priceMap = new Map(foods.map(f => [f.id, f.price]));
        const totalPrice = items.reduce((sum, i) => sum + (priceMap.get(i.foodId) || 0) * (i.quantity || 1), 0);

        // Update order fields
        order.note = data.note ?? order.note;
        if (totalPrice > 0) order.totalPrice = totalPrice; // giữ total cũ nếu không có items
        await order.save({ transaction: t });

        // Replace order items if provided
        if (items.length) {
            await OrderFood.destroy({ where: { orderId }, transaction: t });
            const rows = items.map(i => ({
                orderId,
                foodId: i.foodId,
                quantity: i.quantity || 1,
                unitPrice: priceMap.get(i.foodId) || 0,
            }));
            if (rows.length) await OrderFood.bulkCreate(rows, { transaction: t });
        }

        await t.commit();
        return order;
    } catch (e) {
        await t.rollback();
        console.error('Update order details failed:', e);
        throw e;
    }
}

/**
 * Kiểm tra đơn hàng đã được thanh toán hay chưa
 * @param {number} orderId
 * @returns {Promise<boolean>}
 */
async function isOrderPaid(orderId) {
    if (!orderId) return false;
    const order = await Order.findByPk(orderId, { attributes: ['id', 'paymentStatus'] });
    return !!(order && order.paymentStatus === PAYMENT_STATUS.PAID);
}

module.exports = {
    createOrders,
    getOrdersByStatus,
    getOrderNumbersForDashboard,
    updateOrderStatus,
    updateOrderDetails,
    isOrderPaid,
}
