const { Order, OrderFood, Food, sequelize } = require('../database');
const { Op } = require('sequelize');
// Order: model đơn hàng
// OrderFood: bảng trung gian order - food (nhiều-nhiều) có thêm quantity, unitPrice
// Food: model món ăn
// sequelize: instance để tạo transaction

// Sinh mã đơn hàng: [shopCode][yymmdd][seq4]
async function generateOrderNumber(t, shopCode) {
    const code = 'SH123'; // hardcode mã cửa hàng
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;
    const prefix = `${code}${yymmdd}`;

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
            const orderNumber = await generateOrderNumber(t, orderData.shopCode);

            // Tạo bản ghi Order chính
            const order = await Order.create({
                orderNumber,
                note: orderData.note || null,
                totalPrice,
                status: 'Waiting',
                paymentStatus: 'Paid',
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
 * Lấy chi tiết một đơn hàng theo id kèm danh sách món và thuộc tính trung gian
 * @param {number} id
 */
async function getOrderById(id) {
    return await Order.findByPk(id, {
        include: [{
            model: Food,
            as: 'foods',
            through: { attributes: ['quantity', 'unitPrice'] },
        }],
    });
}

/**
 * Lấy danh sách đơn hàng có status là 'Waiting' hoặc 'Completed'
 */
async function getOrdersByStatus() {
    return await Order.findAll({
        where: {
            status: {
                [Op.in]: ['Waiting', 'Completed']
            }
        },
        order: [['id', 'ASC']],
    });
}

/**
 * Lấy danh sách order numbers cho dashboard
 * Dùng getOrdersByStatus để lấy dữ liệu rồi rút gọn field theo định dạng cần thiết
 * @returns {Promise<Array<{id:number, orderNumber:string, status:string}>>}
 */
async function getOrderNumbersForDashboard() {
    const orders = await getOrdersByStatus();
    return orders.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status }));
}

module.exports = {
    createOrders,
    getOrderById,
    getOrdersByStatus,
    getOrderNumbersForDashboard,
}
