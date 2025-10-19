// Routes quản lý đơn hàng (OrderRoutes)
// API Documentation: See docs/swagger/orders.yaml

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// GET /api/orders/numbers - Lấy danh sách số thứ tự đơn hàng hôm nay (dashboard/caller)
router.get('/numbers', verifyToken, orderController.getOrderNumbers);

// POST /api/orders - Tạo đơn hàng mới
router.post('/', orderController.createOrder);

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn
router.patch('/:id/status', orderController.updateStatus);

// PATCH /api/orders/:id/details - Cập nhật chi tiết đơn (món ăn, ghi chú)
router.patch('/:id/details', orderController.updateDetails);

// GET /api/orders/:id/payment-status - Kiểm tra trạng thái thanh toán
router.get('/:id/payment-status', orderController.getPaymentStatus);

// GET /api/orders/search - Tìm kiếm đơn hàng (Manager only)
router.get('/search', verifyToken, requireRole('manager'), orderController.search);

module.exports = router;
