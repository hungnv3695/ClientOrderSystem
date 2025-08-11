const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');

router.get('/numbers', orderController.getOrderNumbers);
router.post('/', orderController.createOrder);

module.exports = router;
