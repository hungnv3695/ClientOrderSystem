const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/SepayController');
// Đăng ký các route cho Sepay
router.post('/receivePayment', sepayController.receivePayment);

module.exports = router;