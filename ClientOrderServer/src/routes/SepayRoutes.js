const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/SepayController');

// API Documentation: See docs/swagger/sepay.yaml

// Đăng ký các route cho Sepay
router.post('/receivePayment', sepayController.receivePayment);

module.exports = router;