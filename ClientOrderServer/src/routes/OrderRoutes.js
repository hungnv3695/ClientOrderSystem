const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');

router.get('/numbers', orderController.getOrderNumbers);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateStatus);
router.patch('/:id/details', orderController.updateDetails);
router.get('/:id/payment-status', orderController.getPaymentStatus);

module.exports = router;
