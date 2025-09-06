const { createOrders, getOrderNumbersForDashboard, getOrdersByStatus, updateOrderStatus, updateOrderDetails, isOrderPaid, searchOrders } = require('../services/OrderService');
const { emitOrderNumbers } = require('../socket');
const logger = require('../utils/logger');

exports.getOrderNumbers = async (req, res) => {
    try {
        const list = await getOrderNumbersForDashboard();
        
        // Log successful dashboard data retrieval
        logger.logOrderEvent('dashboard_data_retrieved', {
            totalOrders: list?.length || 0,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, data: list });
    } catch (e) {
        logger.logError(e, {
            action: 'get_order_numbers_dashboard',
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.createOrder = async (req, res) => {
    const orderData = req.body;
    
    // Log order creation attempt
    logger.logOrderEvent('order_creation_attempt', {
        hasOrderData: !!orderData,
        itemsCount: orderData?.items?.length || 0,
        tableNumber: orderData?.tableNumber,
        customerPhone: orderData?.customerPhone,
        totalAmount: orderData?.totalAmount,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            logger.logOrderEvent('order_creation_failed', {
                reason: 'invalid_order_data',
                orderData: orderData ? JSON.stringify(orderData) : 'null',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const newOrder = await createOrders(orderData);
        if (!newOrder) {
            logger.logOrderEvent('order_creation_failed', {
                reason: 'service_returned_null',
                orderData: JSON.stringify(orderData),
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Failed to create order' });
        }

        // Log successful order creation
        logger.logOrderEvent('order_created', {
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            tableNumber: newOrder.tableNumber,
            itemsCount: newOrder.items?.length || 0,
            totalAmount: newOrder.totalAmount,
            customerPhone: newOrder.customerPhone,
            ip: req.ip
        });

        res.json({ success: true, data: newOrder });
    } catch (e) {
        logger.logError(e, {
            action: 'create_order',
            orderData: orderData ? JSON.stringify(orderData) : 'null',
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Log status update attempt
    logger.logOrderEvent('status_update_attempt', {
        orderId: id,
        newStatus: status,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        if (!status) {
            logger.logOrderEvent('status_update_failed', {
                orderId: id,
                reason: 'missing_status',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Missing status' });
        }

        const updated = await updateOrderStatus(id, status);
        if (!updated) {
            logger.logOrderEvent('status_update_failed', {
                orderId: id,
                newStatus: status,
                reason: 'order_not_found',
                ip: req.ip
            });
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Emit lại danh sách sau cập nhật
        const orders = await getOrdersByStatus();
        
        // Log successful status update and socket emission
        logger.logOrderEvent('status_updated', {
            orderId: id,
            newStatus: status,
            oldStatus: updated.previousStatus || 'unknown',
            orderNumber: updated.orderNumber,
            totalOrdersEmitted: orders?.length || 0,
            ip: req.ip
        });

        emitOrderNumbers('SH123', orders);
        res.json({ success: true, data: updated });
    } catch (e) {
        logger.logError(e, {
            action: 'update_order_status',
            orderId: id,
            newStatus: status,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.updateDetails = async (req, res) => {
    const { id } = req.params;
    const { note, items } = req.body || {};
    
    // Log details update attempt
    logger.logOrderEvent('details_update_attempt', {
        orderId: id,
        hasNote: !!note,
        hasItems: !!items,
        itemsCount: Array.isArray(items) ? items.length : 0,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        if (!note && !Array.isArray(items)) {
            logger.logOrderEvent('details_update_failed', {
                orderId: id,
                reason: 'nothing_to_update',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }

        if (items && !Array.isArray(items)) {
            logger.logOrderEvent('details_update_failed', {
                orderId: id,
                reason: 'invalid_items_format',
                itemsType: typeof items,
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Invalid items format' });
        }

        const updated = await updateOrderDetails(id, { note, items });
        if (!updated) {
            logger.logOrderEvent('details_update_failed', {
                orderId: id,
                reason: 'order_not_found',
                ip: req.ip
            });
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Log successful details update
        logger.logOrderEvent('details_updated', {
            orderId: id,
            orderNumber: updated.orderNumber,
            noteUpdated: !!note,
            itemsUpdated: !!items,
            newItemsCount: updated.items?.length || 0,
            ip: req.ip
        });

        res.json({ success: true, data: updated });
    } catch (e) {
        logger.logError(e, {
            action: 'update_order_details',
            orderId: id,
            updateData: JSON.stringify({ note, items }),
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    const { id } = req.params;
    
    // Log payment status check attempt
    logger.logOrderEvent('payment_status_check', {
        orderId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        if (!id) {
            logger.logOrderEvent('payment_status_failed', {
                reason: 'missing_order_id',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Missing order id' });
        }

        const paid = await isOrderPaid(id);
        
        // Log payment status result
        logger.logOrderEvent('payment_status_retrieved', {
            orderId: id,
            isPaid: paid,
            ip: req.ip
        });

        res.json({ success: true, data: { paid } });
    } catch (e) {
        logger.logError(e, {
            action: 'get_payment_status',
            orderId: id,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};

exports.search = async (req, res) => {
    try {
        // Hỗ trợ nhận filter từ query string hoặc body (ưu tiên query)
        const filters = Object.keys(req.query || {}).length ? req.query : (req.body || {});
        
        // Log search attempt
        logger.logOrderEvent('order_search_attempt', {
            searchSource: Object.keys(req.query || {}).length ? 'query' : 'body',
            filterCount: Object.keys(filters).length,
            filters: JSON.stringify(filters),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        const result = await searchOrders(filters);
        
        // Log search results
        logger.logOrderEvent('order_search_completed', {
            filtersUsed: JSON.stringify(filters),
            resultsCount: result?.length || 0,
            ip: req.ip
        });

        res.json({ success: true, data: result });
    } catch (e) {
        logger.logError(e, {
            action: 'search_orders',
            filters: req.query || req.body,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: e.message || 'Internal Server Error' });
    }
};




