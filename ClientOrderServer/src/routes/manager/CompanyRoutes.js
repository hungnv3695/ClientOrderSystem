// routes/manager/CompanyRoutes.js
const express = require('express');
const router = express.Router();
const CompanyController = require('../../controllers/manager/CompanyController');
const { verifyToken, requireRole } = require('../../middlewares/auth');

/**
 * Company Management Routes
 * Base path: /api/manager/companies
 * Authentication: Required (JWT token)
 * Authorization: Manager role only
 */

// Apply authentication and authorization middleware to all routes
router.use(verifyToken);
router.use(requireRole('manager'));

// GET /api/manager/companies/search - Tìm kiếm công ty với phân trang
router.get('/search', CompanyController.searchCompanies);

// GET /api/manager/companies/dropdown - Lấy danh sách công ty cho dropdown
router.get('/dropdown', CompanyController.getCompaniesForDropdown);

// GET /api/manager/companies/:id - Lấy thông tin chi tiết công ty theo ID
router.get('/:id', CompanyController.getCompanyById);

// POST /api/manager/companies - Tạo công ty mới
router.post('/', CompanyController.createCompany);

// PUT /api/manager/companies/:id - Cập nhật thông tin công ty
router.put('/:id', CompanyController.updateCompany);

// DELETE /api/manager/companies/:id - Xóa công ty
router.delete('/:id', CompanyController.deleteCompany);

module.exports = router;
