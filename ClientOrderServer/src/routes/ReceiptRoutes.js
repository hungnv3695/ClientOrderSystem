const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/ReceiptController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// API Documentation: See docs/swagger/receipts.yaml

// POST /api/receipts/:orderId
// Tạo receipt cho 1 order. Body optional: paymentMethod, paidAmount, discountAmount, taxAmount, cashierId, notes
router.post('/:orderId', verifyToken, requireRole('staff', 'manager', 'device'), receiptController.createForOrder);

module.exports = router;
