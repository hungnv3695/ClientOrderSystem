// routes/manager/ShopRoutes.js
const express = require('express');
const router = express.Router();
const ShopController = require('../../controllers/manager/ShopController');
const { verifyToken, requireRole } = require('../../middlewares/auth');

/**
 * Shop Management Routes
 * Base path: /api/shop
 * Authentication: Required (JWT token)
 * Authorization: Manager role only
 */

// Apply authentication and authorization middleware to all routes
router.use(verifyToken);
router.use(requireRole('manager'));

// GET /api/shop/search - Tìm kiếm shop với phân trang
router.get('/search', ShopController.searchShops);

// GET /api/shop/dropdown - Lấy danh sách shop cho dropdown
router.get('/dropdown', ShopController.getShopsForDropdown);

// GET /api/shop/company/:companyId - Lấy danh sách shop theo công ty
router.get('/company/:companyId', ShopController.getShopsByCompany);

// GET /api/shop/:id - Lấy thông tin chi tiết shop theo ID
router.get('/:id', ShopController.getShopById);

// POST /api/shop - Tạo shop mới
router.post('/', ShopController.createShop);

// PUT /api/shop/:id - Cập nhật thông tin shop
router.put('/:id', ShopController.updateShop);

// PATCH /api/shop/:id/status - Cập nhật trạng thái shop
router.patch('/:id/status', ShopController.updateShopStatus);

// DELETE /api/shop/:id - Xóa shop
router.delete('/:id', ShopController.deleteShop);

module.exports = router;
