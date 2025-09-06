/**
 * Example: How to use the new logging system in controllers
 * This file demonstrates best practices for logging in ClientOrderServer
 */

const logger = require('../utils/logger');

// ===== AUTHENTICATION LOGGING =====

// In AuthController.js
exports.login = async (req, res) => {
    const { username } = req.body;
    
    try {
        logger.logAuthEvent('login_attempt', {
            username,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        const user = await User.findOne({ where: { username } });
        if (!user) {
            logger.logAuthEvent('login_failed', {
                username,
                reason: 'user_not_found',
                ip: req.ip
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            logger.logAuthEvent('login_failed', {
                username,
                reason: 'invalid_password',
                ip: req.ip
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Success
        logger.logAuthEvent('login_success', {
            userId: user.id,
            username: user.username,
            role: user.role,
            ip: req.ip
        });

        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        res.json({ success: true, data: { token, user: payload } });

    } catch (error) {
        logger.logError(error, {
            action: 'user_login',
            username,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ===== ORDER LOGGING =====

// In OrderController.js
exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        logger.logOrderEvent('creation_attempt', null, {
            shopCode: orderData.shopCode,
            deviceCode: orderData.deviceCode,
            itemCount: orderData.items?.length,
            ip: req.ip
        });

        if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            logger.warn('Invalid order data received', {
                orderData,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const newOrder = await createOrders(orderData);
        if (!newOrder) {
            logger.logOrderEvent('creation_failed', null, {
                shopCode: orderData.shopCode,
                reason: 'service_error'
            });
            return res.status(400).json({ success: false, message: 'Failed to create order' });
        }

        // Success
        logger.logOrderEvent('created', newOrder.id, {
            orderNumber: newOrder.orderNumber,
            shopCode: orderData.shopCode,
            totalPrice: newOrder.totalPrice,
            itemCount: orderData.items?.length
        });

        res.json({ success: true, data: newOrder });

    } catch (error) {
        logger.logError(error, {
            action: 'create_order',
            orderData: req.body,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        logger.logOrderEvent('status_update_attempt', id, {
            newStatus: status,
            userId: req.user?.id
        });

        const order = await Order.findByPk(id);
        if (!order) {
            logger.logOrderEvent('status_update_failed', id, {
                reason: 'order_not_found',
                attemptedStatus: status
            });
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const oldStatus = order.status;
        const updated = await updateOrderStatus(id, status);

        logger.logOrderEvent('status_updated', id, {
            oldStatus,
            newStatus: status,
            userId: req.user?.id,
            orderNumber: order.orderNumber
        });

        res.json({ success: true, data: updated });

    } catch (error) {
        logger.logError(error, {
            action: 'update_order_status',
            orderId: req.params.id,
            status: req.body.status,
            userId: req.user?.id
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ===== PAYMENT LOGGING =====

// In SepayController.js
exports.receivePayment = async (req, res) => {
    try {
        const payload = req.body;
        
        logger.logPaymentEvent('webhook_received', {
            transactionId: payload.id,
            amount: payload.amount,
            content: payload.transaction_content,
            ip: req.ip
        });

        const tx = await savePaymentTransaction(payload);
        
        logger.logPaymentEvent('transaction_saved', {
            transactionId: tx.id,
            amount: tx.amountIn,
            orderNumber: payload.orderNumber
        });

        // Update order if applicable
        if (orderNumber && order) {
            const amountIn = tx.amountIn ? parseFloat(tx.amountIn) : 0;
            if (amountIn >= (order.totalPrice || 0)) {
                order.paymentStatus = PAYMENT_STATUS.PAID;
                await order.save();

                logger.logPaymentEvent('order_paid', {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    amount: amountIn,
                    transactionId: tx.id
                });
            }
        }

        res.json({ success: true, data: { transactionId: tx.id, orderNumber } });

    } catch (error) {
        logger.logError(error, {
            action: 'process_payment',
            payload: req.body,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
};

// ===== PERFORMANCE MONITORING =====

// Track slow database operations
const trackSlowQuery = async (operation, queryFn) => {
    const startTime = Date.now();
    try {
        const result = await queryFn();
        const duration = Date.now() - startTime;
        
        if (duration > 1000) { // Log queries slower than 1 second
            logger.warn('Slow database query detected', {
                operation,
                duration: `${duration}ms`
            });
        }
        
        return result;
    } catch (error) {
        logger.logError(error, {
            operation,
            duration: `${Date.now() - startTime}ms`
        });
        throw error;
    }
};

// Usage example:
// const orders = await trackSlowQuery('getOrdersByStatus', () => getOrdersByStatus());

module.exports = {
    // This is just an example file - don't export anything
};
