const { createOrders, getOrderNumbersForDashboard, getOrdersByStatus, updateOrderStatus, updateOrderDetails, isOrderPaid, searchOrders } = require('../services/OrderService');
const { emitOrderNumbers } = require('../socket');

exports.getOrderNumbers = async (req, res) => {
    try {
        const list = await getOrderNumbersForDashboard();
        res.json({ success: true, data: list });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body
        if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            console.log(orderData);
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }
        const newOrder = await createOrders(orderData)
        if (!newOrder) {
            return res.status(400).json({ success: false, message: 'Failed to create order' })
        }

        res.json({ success: true, data: newOrder })
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Missing status' });
        }
        const updated = await updateOrderStatus(id, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        // Emit lại danh sách sau cập nhật
        const orders = await getOrdersByStatus();
        console.log('Updated orders:', orders);
        emitOrderNumbers('SH123', orders);
        res.json({ success: true, data: updated });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.updateDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, items } = req.body || {};
        if (!note && !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }
        if (items && !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Invalid items format' });
        }
        const updated = await updateOrderDetails(id, { note, items });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: updated });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Missing order id' });
        const paid = await isOrderPaid(id);
        res.json({ success: true, data: { paid } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.search = async (req, res) => {
    try {
        // Hỗ trợ nhận filter từ query string hoặc body (ưu tiên query)
        const filters = Object.keys(req.query || {}).length ? req.query : (req.body || {});
        const result = await searchOrders(filters);
        res.json({ success: true, data: result });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};




