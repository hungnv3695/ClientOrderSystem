const { createOrders, getOrders, getOrderById, getOrderNumbersForDashboard, getOrdersByStatus } = require('../services/OrderService');
const { emitOrderNumbers } = require('../socket');

exports.getOrderNumbers = async (req, res) => {
    try {
        const list = await getOrderNumbersForDashboard();
        res.json({ success: true, data: list });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

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

        const orders = await getOrdersByStatus()

        let orderNumbers = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
        }));
        // Cập nhật orderNumbers trong socket
        emitOrderNumbers('SH123', orderNumbers);

        res.json({ success: true, data: newOrder })
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


