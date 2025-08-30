// Routes quản lý đơn hàng (OrderRoutes)
// Mục đích: định nghĩa các endpoint REST cho nghiệp vụ đơn hàng.
// Lưu ý: Nếu cần bảo vệ bởi đăng nhập/phân quyền, có thể dùng verifyToken/requireRole từ middlewares/auth.
// Ví dụ (gợi ý):
//   const { verifyToken, requireRole } = require('../middlewares/auth');
//   router.post('/', verifyToken, requireRole('staff','manager'), orderController.createOrder);

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// GET /api/orders/numbers
// Trả về danh sách số thứ tự đơn hàng hôm nay (phục vụ màn hình Dashboard/Caller)
router.get('/numbers', orderController.getOrderNumbers);

// POST /api/orders
// Tạo đơn hàng mới (gọi món). Body chứa thông tin món và shopId.
router.post('/', orderController.createOrder);

// PATCH /api/orders/:id/status
// Cập nhật trạng thái đơn (RECEIVED -> PROCESSING -> COMPLETED, ...)
router.patch('/:id/status', orderController.updateStatus);

// PATCH /api/orders/:id/details
// Cập nhật chi tiết đơn (món ăn, ghi chú, số lượng, ...)
router.patch('/:id/details', orderController.updateDetails);

// GET /api/orders/:id/payment-status
// Kiểm tra tình trạng thanh toán của đơn (PAID/UNPAID), phục vụ UI thanh toán
router.get('/:id/payment-status', orderController.getPaymentStatus);


// -------MANAGER-------

// SEARCH
// Lưu ý: fromDate/toDate chỉ nhận định dạng 'yyyymmdd' (ví dụ: 20250817)
// GET /api/orders/search?fromDate=20250801&toDate=20250817&minTotal=0&maxTotal=100000&status=Processing,Completed&paymentStatus=Paid
// Trả về danh sách đơn theo điều kiện tìm kiếm (có phân trang/sắp xếp)
router.get('/search', verifyToken, requireRole('manager'), orderController.search);

module.exports = router;
