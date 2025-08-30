// controllers/manager/CompanyController.js
const CompanyService = require('../../services/manager/CompanyService');

class CompanyController {
    /**
     * API tìm kiếm công ty với phân trang
     * GET /api/manager/companies/search
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async searchCompanies(req, res) {
        try {
            // Lấy parameters từ query string
            const {
                code,
                name,
                registration_number,
                address,
                phone,
                email,
                createdAtFrom,
                createdAtTo,
                page,
                limit,
                sortBy,
                sortOrder
            } = req.query;

            // Validate và sanitize input
            const searchParams = {
                code: code?.trim() || '',
                name: name?.trim() || '',
                registration_number: registration_number?.trim() || '',
                address: address?.trim() || '',
                phone: phone?.trim() || '',
                email: email?.trim() || '',
                createdAtFrom: createdAtFrom || '',
                createdAtTo: createdAtTo || '',
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                sortBy: sortBy || 'created_at',
                sortOrder: sortOrder || 'DESC'
            };

            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (searchParams.createdAtFrom && !dateRegex.test(searchParams.createdAtFrom)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng "Từ ngày" không hợp lệ. Sử dụng YYYY-MM-DD'
                });
            }

            if (searchParams.createdAtTo && !dateRegex.test(searchParams.createdAtTo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng "Đến ngày" không hợp lệ. Sử dụng YYYY-MM-DD'
                });
            }

            // Validate date range
            if (searchParams.createdAtFrom && searchParams.createdAtTo) {
                const fromDate = new Date(searchParams.createdAtFrom);
                const toDate = new Date(searchParams.createdAtTo);

                if (fromDate > toDate) {
                    return res.status(400).json({
                        success: false,
                        message: '"Từ ngày" không thể lớn hơn "Đến ngày"'
                    });
                }
            }

            // Validate page và limit
            if (searchParams.page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số trang phải lớn hơn 0'
                });
            }

            if (searchParams.limit < 1 || searchParams.limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Số bản ghi trên trang phải từ 1 đến 100'
                });
            }

            // Gọi service để tìm kiếm
            const result = await CompanyService.searchCompanies(searchParams);

            // Trả về kết quả
            return res.status(200).json(result);

        } catch (error) {
            console.error('CompanyController.searchCompanies error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tìm kiếm công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API lấy danh sách công ty cho dropdown
     * GET /api/manager/companies/dropdown
     * @param {Object} req - Request object  
     * @param {Object} res - Response object
     */
    async getCompaniesForDropdown(req, res) {
        try {
            const result = await CompanyService.getAllCompaniesForDropdown();
            return res.status(200).json(result);

        } catch (error) {
            console.error('CompanyController.getCompaniesForDropdown error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy danh sách công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API lấy thông tin chi tiết công ty theo ID
     * GET /api/manager/companies/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCompanyById(req, res) {
        try {
            const { id } = req.params;

            // Validate ID
            const companyId = parseInt(id);
            if (!companyId || companyId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID công ty không hợp lệ'
                });
            }

            const result = await CompanyService.getCompanyById(companyId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('CompanyController.getCompanyById error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy thông tin công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API tạo công ty mới
     * POST /api/manager/companies
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async createCompany(req, res) {
        try {
            console.log('createCompany - Request body:', JSON.stringify(req.body, null, 2));

            const { code, name, registration_number, address, phone, email, website, description } = req.body;

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

            console.log('createCompany - Extracted data:', {
                code, name, registration_number, address, phone, email, website, description
            });

            // Gọi service để tạo công ty
            const result = await CompanyService.createCompany({
                code,
                name,
                registration_number,
                address,
                phone,
                email,
                website,
                description
            });

            console.log('createCompany - Service result:', JSON.stringify(result, null, 2));

            // Nếu có lỗi validation từ service
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Trả về kết quả thành công
            return res.status(201).json(result);

        } catch (error) {
            console.error('CompanyController.createCompany error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tạo công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API cập nhật thông tin công ty
     * PUT /api/manager/companies/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateCompany(req, res) {
        try {
            // TODO: Implement update company logic
            return res.status(501).json({
                success: false,
                message: 'Chức năng cập nhật công ty chưa được triển khai'
            });

        } catch (error) {
            console.error('CompanyController.updateCompany error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi cập nhật công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API xóa công ty
     * DELETE /api/manager/companies/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async deleteCompany(req, res) {
        try {
            // TODO: Implement delete company logic
            return res.status(501).json({
                success: false,
                message: 'Chức năng xóa công ty chưa được triển khai'
            });

        } catch (error) {
            console.error('CompanyController.deleteCompany error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi xóa công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}

module.exports = new CompanyController();
