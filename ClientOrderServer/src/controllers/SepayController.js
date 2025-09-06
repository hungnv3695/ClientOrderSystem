const { Order } = require('../database');
const { savePaymentTransaction } = require('../services/PaymentTransactionService');
const { emitOrderNumbers } = require('../socket');
const { getOrdersByStatus } = require('../services/OrderService');
const { PAYMENT_STATUS } = require('../constants/order.constants');
const logger = require('../utils/logger');

exports.receivePayment = async (req, res) => {
    const payload = req.body || {};
    
    // Log payment webhook received
    logger.logPaymentEvent('sepay_webhook_received', {
        transactionContent: payload.transaction_content || payload.content || payload.transactionContent,
        amount: payload.amountIn || payload.amount,
        code: payload.code,
        hasPayload: !!payload,
        payloadKeys: Object.keys(payload),
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        // Lưu transaction
        const tx = await savePaymentTransaction(payload);
        
        logger.logPaymentEvent('payment_transaction_saved', {
            transactionId: tx.id,
            amount: tx.amountIn,
            content: tx.content || tx.transaction_content,
            ip: req.ip
        });

        // Suy luận orderNumber (có thể nằm trong payload trực tiếp hoặc trong nội dung mô tả)
        let orderNumber = payload.orderNumber || payload.code || null;
        const content = payload.transaction_content || payload.content || payload.transactionContent || '';
        if (!orderNumber) {
            const match = content.match(/(SH\w+)/i); // ví dụ pattern orderNumber bắt đầu SH...
            if (match) orderNumber = match[1];
        }

        logger.logPaymentEvent('order_number_extracted', {
            transactionId: tx.id,
            orderNumber,
            extractedFromContent: !!(orderNumber && !payload.orderNumber && !payload.code),
            content,
            ip: req.ip
        });

        // Nếu có orderNumber thì cập nhật trạng thái thanh toán
        if (orderNumber) {
            const order = await Order.findOne({ where: { orderNumber } });
            
            if (order) {
                // Xác định amountIn đã nhận từ transaction
                const amountIn = tx.amountIn ? parseFloat(tx.amountIn) : 0;
                const orderTotal = order.totalPrice || 0;
                
                logger.logPaymentEvent('payment_verification', {
                    transactionId: tx.id,
                    orderId: order.id,
                    orderNumber,
                    amountReceived: amountIn,
                    amountRequired: orderTotal,
                    sufficient: amountIn >= orderTotal,
                    ip: req.ip
                });

                if (amountIn >= orderTotal) {
                    order.paymentStatus = PAYMENT_STATUS.PAID;
                    await order.save();

                    const orders = await getOrdersByStatus();

                    // Log successful payment processing
                    logger.logPaymentEvent('payment_completed', {
                        transactionId: tx.id,
                        orderId: order.id,
                        orderNumber,
                        amountPaid: amountIn,
                        previousStatus: order.previous_paymentStatus || 'unknown',
                        newStatus: PAYMENT_STATUS.PAID,
                        ordersEmitted: orders?.length || 0,
                        ip: req.ip
                    });

                    //Cập nhật orderNumbers trong socket
                    emitOrderNumbers('SH123', orders);
                } else {
                    logger.logPaymentEvent('payment_insufficient', {
                        transactionId: tx.id,
                        orderId: order.id,
                        orderNumber,
                        amountReceived: amountIn,
                        amountRequired: orderTotal,
                        shortfall: orderTotal - amountIn,
                        ip: req.ip
                    });
                }
            } else {
                logger.logPaymentEvent('order_not_found_for_payment', {
                    transactionId: tx.id,
                    orderNumber,
                    content,
                    ip: req.ip
                });
            }
        } else {
            logger.logPaymentEvent('no_order_number_found', {
                transactionId: tx.id,
                content,
                payloadCode: payload.code,
                payloadOrderNumber: payload.orderNumber,
                ip: req.ip
            });
        }

        res.json({ success: true, data: { transactionId: tx.id, orderNumber }, message: 'Payment received' });
    } catch (e) {
        logger.logError(e, {
            action: 'receive_sepay_payment',
            payload: JSON.stringify(payload),
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};