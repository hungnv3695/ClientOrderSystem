const { Order, PaymentTransaction } = require('../database');
const { savePaymentTransaction } = require('../services/PaymentTransactionService');
const { emitOrderNumbers } = require('../socket');
const { getOrdersByStatus } = require('../services/OrderService');
const { PAYMENT_STATUS } = require('../constants/order.constants');
const logger = require('../utils/logger');

exports.receivePayment = async (req, res) => {
    const payload = req.body || {};
    
    // Log payment webhook received
    logger.logPaymentEvent('sepay_webhook_received', {
        id: payload.id,
        gateway: payload.gateway,
        transactionDate: payload.transactionDate,
        accountNumber: payload.accountNumber,
        code: payload.code,
        content: payload.content,
        transferType: payload.transferType,
        transferAmount: payload.transferAmount,
        accumulated: payload.accumulated,
        subAccount: payload.subAccount,
        referenceCode: payload.referenceCode,
        description: payload.description
    });

    const referenceCode = payload.referenceCode
    const transactionContent = payload.content
    const id = payload.id

    try {
        // **IDEMPOTENCY CHECK** - Kiểm tra transaction đã tồn tại chưa
        if (id && referenceCode) {
            const { Op } = require('sequelize');
            const existingTransaction = await PaymentTransaction.findOne({
                where: { 
                    [Op.or]: [
                        // Tìm theo cả id và referenceNumber để đảm bảo không trùng lặp
                        { id: id },
                        { referenceNumber: referenceCode }
                    ]
                }   
            });
            
            // Nếu đã tồn tại, log và trả về success để Sepay không retry
            if (existingTransaction) {
                logger.logPaymentEvent('duplicate_webhook_detected', {
                    referenceCode,
                    transactionId: existingTransaction.id,
                    transactionContent,
                    message: 'Transaction already processed, skipping',
                    ip: req.ip
                });
                
                // Trả về success để Sepay không retry
                return res.json({ 
                    success: true, 
                    data: { 
                        transactionId: existingTransaction.id, 
                        duplicate: true 
                    }, 
                    message: 'Payment already processed' 
                });
            }
        }

        // Lưu transaction (chỉ khi chưa tồn tại)
        const tx = await savePaymentTransaction(payload);
        
        logger.logPaymentEvent('payment_transaction_saved', {
            transactionId: tx.id,
            amount: tx.amountIn,
            content: tx.content,
            ip: req.ip
        });

        let orderNumber = '';
        if (transactionContent) {
            orderNumber = transactionContent;
        }

        // Nếu không có orderNumber trong content thì chỉ lưu transaction
        if (!orderNumber) {
            logger.logPaymentEvent('no_order_number_found', {
                transactionId: tx.id,
                content: transactionContent,
                ip: req.ip
            });

            // Trả về success dù không có orderNumber
            return res.json({ 
                success: true, 
                data: { 
                    transactionId: tx.id
                }, 
                message: 'Payment received' 
            });
        }

        // Nếu có orderNumber thì cập nhật trạng thái thanh toán
        const order = await Order.findOne({ where: { orderNumber } });

        if (!order ) {
            logger.logPaymentEvent('order_not_found_for_payment', {
                transactionId: tx.id,
                content: transactionContent,
                orderNumber,
                ip: req.ip
            });
            // Trả về success dù không tìm thấy order
            return res.json({ 
                success: true, 
                data: { 
                    transactionId: tx.id
                }, 
                message: 'Payment received but order not found' 
            });
        }

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

            const orders = await getOrdersByStatus(order.shopCode);

            // Log successful payment processing
            logger.logPaymentEvent('payment_completed', {
                transactionId: tx.id,
                orderId: order.id,
                orderNumber,
                amountPaid: amountIn,
                status: order.paymentStatus,
                ip: req.ip
            });

            //Cập nhật orderNumbers trong socket
            emitOrderNumbers(order.shopCode, orders);
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

        res.json({ 
            success: true, 
            data: { 
                transactionId: tx.id
            }, 
            message: 'Payment received' 
        });
    } catch (e) {
        logger.logError(e, {
            action: 'receive_sepay_payment',
            payload: JSON.stringify(payload),
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};