const { Order } = require('../database');
const { savePaymentTransaction } = require('../services/PaymentTransactionService');
const { emitOrderNumbers } = require('../socket');
const { getOrdersByStatus } = require('../services/OrderService');
const { PAYMENT_STATUS } = require('../constants/order.constants');

exports.receivePayment = async (req, res) => {
    try {
        const payload = req.body || {};

        // Lưu transaction
        const tx = await savePaymentTransaction(payload);

        // Suy luận orderNumber (có thể nằm trong payload trực tiếp hoặc trong nội dung mô tả)
        let orderNumber = payload.orderNumber || payload.code || null;
        const content = payload.transaction_content || payload.content || payload.transactionContent || '';
        if (!orderNumber) {
            const match = content.match(/(SH\w+)/i); // ví dụ pattern orderNumber bắt đầu SH...
            if (match) orderNumber = match[1];
        }

        console.log('Payment received:', { transactionId: tx.id, orderNumber });

        // Nếu có orderNumber thì cập nhật trạng thái thanh toán
        if (orderNumber) {
            const order = await Order.findOne({ where: { orderNumber } });
            console.log('Order found:', order);
            if (order) {
                // Xác định amountIn đã nhận từ transaction
                const amountIn = tx.amountIn ? parseFloat(tx.amountIn) : 0;
                if (amountIn >= (order.totalPrice || 0)) {
                    console.log(amountIn);
                    order.paymentStatus = PAYMENT_STATUS.PAID;
                    await order.save();

                    const orders = await getOrdersByStatus()

                    //Cập nhật orderNumbers trong socket
                    emitOrderNumbers('SH123', orders);
                }
            }
        }

        res.json({ success: true, data: { transactionId: tx.id, orderNumber }, message: 'Payment received' });
    } catch (e) {
        console.error('Receive payment error:', e);
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};