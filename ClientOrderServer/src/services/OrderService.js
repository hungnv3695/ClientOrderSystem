const { Order, OrderFood, Food, sequelize } = require('../database');
const { Op } = require('sequelize');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require('../constants/order.constants');
    
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
    const shopCode = orderData.shopCode;
    const deviceCode = orderData.deviceCode
    // Kiểm tra paymentStatus
    const paymentStatus = orderData.paymentStatus || PAYMENT_STATUS.UNPAID;
    // Kiểm tra paymentMethod
    const paymentMethod = orderData.paymentMethod || PAYMENT_METHOD.CASH;

    // Thử tạo đơn hàng tối đa 5 lần nếu trùng mã
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const t = await sequelize.transaction();
        try {
            // Tự sinh số đơn hàng theo rule trong transaction
            const orderNumber = await generateOrderNumber(t, shopCode, deviceCode);

            // Tạo bản ghi Order chính
            const order = await Order.create({
                orderNumber,
                note: orderData.note || null,
                totalPrice,
                status: ORDER_STATUS.RECEIVED,
                paymentStatus: paymentStatus,
                paymentMethod: paymentMethod,
                shopCode: shopCode, // Thêm shopCode vào database
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
 * @param {string} shopCode - Mã cửa hàng để lọc orders (optional)
 */
async function getOrdersByStatus(shopCode = null) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
        status: { [Op.in]: [
            ORDER_STATUS.RECEIVED, 
            ORDER_STATUS.PROCESSING, 
            ORDER_STATUS.COMPLETED, 
            ORDER_STATUS.DELIVERED] },
        paymentStatus: PAYMENT_STATUS.PAID, // Chỉ lấy đơn đã thanh toán
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
    };

    // Thêm filter theo shopCode nếu được cung cấp
    if (shopCode) {
        where.shopCode = shopCode;
    }

    const orders = await Order.findAll({
        where,
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
 * @param {string} shopCode - Mã cửa hàng để lọc orders (optional)
 * @returns {Promise<Array<{id:number, orderNumber:string, status:integer}>>}
 */
async function getOrderNumbersForDashboard(shopCode = null) {
    const orders = await getOrdersByStatus(shopCode);
    return orders;
}

/**
 * Cập nhật trạng thái đơn hàng theo orderId
 * @param {number} orderId
 * @param {'1: Received' | '2: Processing' | '3: Completed' | '4: Delivered' | '0: Cancelled'} status
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

/**
 * Tìm kiếm đơn hàng theo điều kiện.
 * Hỗ trợ: khoảng ngày tạo (fromDate/toDate), khoảng tổng tiền (minTotal/maxTotal), status, paymentStatus, phân trang và sắp xếp.
 * @param {{ fromDate?: string, toDate?: string, minTotal?: number, maxTotal?: number, status?: integer|string, paymentStatus?: string[]|string, page?: number, pageSize?: number, sortBy?: string, sortOrder?: 'ASC'|'DESC' }} filters
 * @returns {Promise<{ rows: any[], count: number, page: number, pageSize: number }>}
 */
async function searchOrders(filters = {}) {
    const where = {};

    // Ngày tạo: fromDate/toDate dạng 'yyyymmdd'
    const { fromDate, toDate } = filters;
    if (fromDate || toDate) {
        const updatedAt = {};
        const start = parseDateValue(fromDate, false);
        const end = parseDateValue(toDate, true);
        if (start) updatedAt[Op.gte] = start;
        if (end) updatedAt[Op.lte] = end;
        if (start || end) where.updatedAt = updatedAt;
    }

    // Tổng tiền: minTotal/maxTotal (chấp nhận string/number, bỏ qua chuỗi rỗng)
    const minRaw = typeof filters.minTotal === 'string' ? filters.minTotal.trim() : filters.minTotal;
    const maxRaw = typeof filters.maxTotal === 'string' ? filters.maxTotal.trim() : filters.maxTotal;
    const hasMin = minRaw !== undefined && minRaw !== null && minRaw !== '';
    const hasMax = maxRaw !== undefined && maxRaw !== null && maxRaw !== '';
    const minTotal = hasMin ? Math.trunc(Number(minRaw)) : undefined;
    const maxTotal = hasMax ? Math.trunc(Number(maxRaw)) : undefined;
    if ((hasMin && Number.isFinite(minTotal)) || (hasMax && Number.isFinite(maxTotal))) {
        const total = {};
        if (hasMin && Number.isFinite(minTotal)) total[Op.gte] = minTotal;
        if (hasMax && Number.isFinite(maxTotal)) total[Op.lte] = maxTotal;
        where.totalPrice = total;
    }

    // Trạng thái đơn hàng
    const allowedStatuses = Object.values(ORDER_STATUS);
    
    const statuses = Array.isArray(filters.status)
        ? filters.status.map(s => parseInt(s)).filter(s => !isNaN(s))
        : (typeof filters.status === 'string' ? filters.status.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)) : 
           typeof filters.status === 'number' ? [filters.status] : undefined);
    if (statuses && statuses.length) {
        const valid = statuses.filter(s => allowedStatuses.includes(s));
        if (valid.length === 1) where.status = valid[0];
        else if (valid.length > 1) where.status = { [Op.in]: valid };
    }

    // Trạng thái thanh toán
    const allowedPays = Object.values(PAYMENT_STATUS);
    const pays = Array.isArray(filters.paymentStatus)
        ? filters.paymentStatus.map(p => parseInt(p)).filter(p => !isNaN(p))
        : (typeof filters.paymentStatus === 'string' ? filters.paymentStatus.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p)) : 
           typeof filters.paymentStatus === 'number' ? [filters.paymentStatus] : undefined);
    if (pays && pays.length) {
        const valid = pays.filter(p => allowedPays.includes(p));
        if (valid.length === 1) where.paymentStatus = valid[0];
        else if (valid.length > 1) where.paymentStatus = { [Op.in]: valid };
    }

    // Phân trang + sắp xếp
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 50;
    const offset = (page - 1) * pageSize;

    const sortable = new Set(['updatedAt', 'totalPrice', 'orderNumber']);
    const sortBy = sortable.has(filters.sortBy) ? filters.sortBy : 'updatedAt';
    const sortOrder = (filters.sortOrder === 'ASC' || filters.sortOrder === 'DESC') ? filters.sortOrder : 'DESC';


    const { rows, count } = await Order.findAndCountAll({
        where,
        attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'totalPrice', 'note', 'createdAt', 'updatedAt'],
        include: [
            {
                model: Food,
                as: 'foods',
                attributes: ['id', 'name', 'price'],
                through: { attributes: ['quantity', 'unitPrice'] },
            },
        ],
        order: [[sortBy, sortOrder]],
        limit: pageSize,
        offset,
        distinct: true,
    });

    // Map về dạng gọn: items [{ name, quantity, price }]
    const mappedRows = rows.map(r => {
        const o = typeof r.get === 'function' ? r.get({ plain: true }) : r;
        const items = (o.foods || []).map(f => ({
            name: f.name,
            quantity: f?.OrderFood?.quantity ?? 0,
            price: (f?.OrderFood?.unitPrice ?? f.price ?? 0),
        }));
        delete o.foods;
        return { ...o, items };
    });

    return { rows: mappedRows, count, page, pageSize };
}

/**
 * Parse chuỗi ngày định dạng 'YYYYMMDD' về đối tượng Date ở đầu hoặc cuối ngày.
 * Chỉ chấp nhận đúng định dạng 8 chữ số. Ví dụ hợp lệ: '20250817'.
 * @param {string} value Chuỗi ngày 'YYYYMMDD'
 * @param {boolean} endOfDay true => 23:59:59.999, false => 00:00:00.000
 * @returns {Date|null}
 */
function parseDateValue(value, endOfDay = false) {
    if (typeof value !== 'string') return null;
    const s = value.trim();
    if (!/^\d{8}$/.test(s)) return null; // chỉ chấp nhận YYYYMMDD

    const yyyy = Number(s.slice(0, 4));
    const mm = Number(s.slice(4, 6)) - 1; // 0-based
    const dd = Number(s.slice(6, 8));

    const d = new Date(yyyy, mm, dd);
    // Xác thực ngày hợp lệ (tránh auto-roll sang tháng khác)
    if (
        d.getFullYear() !== yyyy ||
        d.getMonth() !== mm ||
        d.getDate() !== dd
    ) {
        return null;
    }

    if (endOfDay) d.setHours(23, 59, 59, 999); else d.setHours(0, 0, 0, 0);
    return d;
}

module.exports = {
    createOrders,
    getOrdersByStatus,
    getOrderNumbersForDashboard,
    updateOrderStatus,
    updateOrderDetails,
    isOrderPaid,
    searchOrders,
}
