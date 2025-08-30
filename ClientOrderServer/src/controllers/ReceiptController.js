const { createReceiptByOrderId } = require('../services/ReceiptService');

// POST /api/receipts/:orderId
// Body: { paymentMethod?, paidAmount?, discountAmount?, taxAmount?, cashierId?, notes? }
exports.createForOrder = async (req, res) => {
    try {
        console.log('Creating receipt for order:', req.params);
        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ success: false, message: 'Missing orderId' });

        const { paymentMethod, paidAmount, discountAmount, taxAmount, cashierId, notes } = req.body || {};

        const result = await createReceiptByOrderId(Number(orderId), {
            paymentMethod,
            paidAmount,
            discountAmount,
            taxAmount,
            cashierId,
            notes,
        });

        return res.json({ success: true, data: result });
    } catch (e) {
        console.error('Create receipt failed:', e);
        return res.status(400).json({ success: false, message: e.message || 'Create receipt failed' });
    }
};
