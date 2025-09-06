const { createReceiptByOrderId } = require('../services/ReceiptService');
const logger = require('../utils/logger');

// POST /api/receipts/:orderId
// Body: { paymentMethod?, paidAmount?, discountAmount?, taxAmount?, cashierId?, notes? }
exports.createForOrder = async (req, res) => {
    const { orderId } = req.params;
    const { paymentMethod, paidAmount, discountAmount, taxAmount, cashierId, notes } = req.body || {};
    
    // Log receipt creation attempt
    logger.logPaymentEvent('receipt_creation_attempt', {
        orderId,
        paymentMethod,
        paidAmount,
        discountAmount,
        taxAmount,
        cashierId,
        hasNotes: !!notes,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        if (!orderId) {
            logger.logPaymentEvent('receipt_creation_failed', {
                reason: 'missing_order_id',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Missing orderId' });
        }

        const result = await createReceiptByOrderId(Number(orderId), {
            paymentMethod,
            paidAmount,
            discountAmount,
            taxAmount,
            cashierId,
            notes,
        });

        // Log successful receipt creation
        logger.logPaymentEvent('receipt_created', {
            orderId,
            receiptId: result.id,
            receiptNumber: result.receiptNumber,
            paymentMethod,
            paidAmount,
            totalAmount: result.totalAmount,
            cashierId,
            ip: req.ip
        });

        return res.json({ success: true, data: result });
    } catch (e) {
        logger.logError(e, {
            action: 'create_receipt',
            orderId,
            paymentData: JSON.stringify({ paymentMethod, paidAmount, discountAmount, taxAmount, cashierId }),
            ip: req.ip
        });
        return res.status(400).json({ success: false, message: e.message || 'Create receipt failed' });
    }
};
