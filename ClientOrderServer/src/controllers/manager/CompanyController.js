// controllers/manager/CompanyController.js
const { COMPANY_STATUS } = require('../../constants/app.constants');
const CompanyService = require('../../services/manager/CompanyService');
const logger = require('../../utils/logger');

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
                status,
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
                status: parseInt(status) || -1,
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
            logger.logError(error, {
                action: 'search_companies',
                searchParams: req.query,
                ip: req.ip
            });

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
            logger.logError(error, {
                action: 'get_companies_dropdown',
                ip: req.ip
            });

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
            logger.logError(error, {
                action: 'get_company_by_id',
                companyId: req.params.id,
                ip: req.ip
            });

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
            const { code, name, registration_number, address, phone, email, website, description } = req.body;
            
            // Log company creation attempt
            logger.logOrderEvent('company_creation_attempt', {
                code,
                name,
                registration_number,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                logger.logOrderEvent('company_creation_failed', {
                    reason: 'invalid_request_data',
                    bodyType: typeof req.body,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

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

            // Nếu có lỗi validation từ service
            if (!result.success) {
                logger.logOrderEvent('company_creation_failed', {
                    reason: 'service_validation_error',
                    serviceMessage: result.message,
                    code,
                    name,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful company creation
            logger.logOrderEvent('company_created', {
                companyId: result.data?.id,
                code,
                name,
                registration_number,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(201).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'create_company',
                requestBody: JSON.stringify(req.body),
                ip: req.ip
            });

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
            const { id } = req.params;
            const { code, name, registration_number, address, phone, email, website, description, status } = req.body;

            // Log company update attempt
            logger.logOrderEvent('company_update_attempt', {
                companyId: id,
                code,
                name,
                status,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate ID
            const companyId = parseInt(id);
            if (!companyId || companyId < 1) {
                logger.logOrderEvent('company_update_failed', {
                    reason: 'invalid_company_id',
                    providedId: id,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'ID công ty không hợp lệ'
                });
            }

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                logger.logOrderEvent('company_update_failed', {
                    companyId,
                    reason: 'invalid_request_data',
                    bodyType: typeof req.body,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

            // Gọi service để cập nhật công ty
            const result = await CompanyService.updateCompany(companyId, {
                code,
                name,
                registration_number,
                address,
                phone,
                email,
                website,
                description,
                status
            });

            // Nếu có lỗi validation từ service
            if (!result.success) {
                logger.logOrderEvent('company_update_failed', {
                    companyId,
                    reason: 'service_validation_error',
                    serviceMessage: result.message,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful company update
            logger.logOrderEvent('company_updated', {
                companyId,
                code,
                name,
                status,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'update_company',
                companyId: req.params.id,
                requestBody: JSON.stringify(req.body),
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi cập nhật công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API cập nhật trạng thái công ty
     * PATCH /api/manager/companies/:id/status
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateCompanyStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Log status update attempt
            logger.logOrderEvent('company_status_update_attempt', {
                companyId: id,
                newStatus: status,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate ID
            const companyId = parseInt(id);
            if (!companyId || companyId < 1) {
                logger.logOrderEvent('company_status_update_failed', {
                    reason: 'invalid_company_id',
                    providedId: id,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'ID công ty không hợp lệ'
                });
            }

            // Validate status
            if (status !== COMPANY_STATUS.ACTIVE && status !== COMPANY_STATUS.INACTIVE) {
                logger.logOrderEvent('company_status_update_failed', {
                    companyId,
                    reason: 'invalid_status',
                    providedStatus: status,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái phải là "active" hoặc "inactive"'
                });
            }

            // Gọi service để cập nhật trạng thái
            const result = await CompanyService.updateCompanyStatus(companyId, status);

            // Nếu có lỗi từ service
            if (!result.success) {
                logger.logOrderEvent('company_status_update_failed', {
                    companyId,
                    newStatus: status,
                    reason: 'service_error',
                    serviceMessage: result.message,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful status update
            logger.logOrderEvent('company_status_updated', {
                companyId,
                newStatus: status,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'update_company_status',
                companyId: req.params.id,
                status: req.body.status,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi cập nhật trạng thái công ty',
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
            // Log delete attempt (not implemented)
            logger.logOrderEvent('company_delete_attempt', {
                companyId: req.params.id,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                implemented: false
            });

            // TODO: Implement delete company logic
            return res.status(501).json({
                success: false,
                message: 'Chức năng xóa công ty chưa được triển khai'
            });

        } catch (error) {
            logger.logError(error, {
                action: 'delete_company',
                companyId: req.params.id,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi xóa công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}

module.exports = new CompanyController();
