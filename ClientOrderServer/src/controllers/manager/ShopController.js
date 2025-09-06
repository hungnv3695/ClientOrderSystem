// controllers/manager/ShopController.js
const ShopService = require('../../services/manager/ShopService');
const logger = require('../../utils/logger');

class ShopController {
    /**
     * API tìm kiếm shop với phân trang
     * GET /api/shop/search
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async searchShops(req, res) {
        try {
            // Lấy parameters từ query string
            const {
                code,
                name,
                companyId,
                companyName,
                address,
                phone,
                email,
                managerId,
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
                companyId: companyId ? parseInt(companyId) : null,
                companyName: companyName?.trim() || '',
                address: address?.trim() || '',
                phone: phone?.trim() || '',
                email: email?.trim() || '',
                managerId: managerId ? parseInt(managerId) : null,
                status: status?.trim() || '',
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
            const result = await ShopService.searchShops(searchParams);

            // Trả về kết quả
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'search_shops',
                searchParams: req.query,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tìm kiếm shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API lấy danh sách shop cho dropdown
     * GET /api/shop/dropdown
     * @param {Object} req - Request object  
     * @param {Object} res - Response object
     */
    async getShopsForDropdown(req, res) {
        try {
            const result = await ShopService.getAllShopsForDropdown();
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'get_shops_dropdown',
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy danh sách shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API lấy danh sách shop theo công ty
     * GET /api/shop/company/:companyId
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getShopsByCompany(req, res) {
        try {
            const { companyId } = req.params;

            // Validate companyId
            const id = parseInt(companyId);
            if (!id || id < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID công ty không hợp lệ'
                });
            }

            const result = await ShopService.getShopsByCompany(id);
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'get_shops_by_company',
                companyId: req.params.companyId,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy danh sách shop theo công ty',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API lấy thông tin chi tiết shop theo ID
     * GET /api/shop/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getShopById(req, res) {
        try {
            const { id } = req.params;

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            const result = await ShopService.getShopById(shopId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'get_shop_by_id',
                shopId: req.params.id,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi lấy thông tin shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API tạo shop mới
     * POST /api/shop
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async createShop(req, res) {
        try {
            const { code, name, companyId, address, phone, email, managerId, description } = req.body;
            
            // Log shop creation attempt
            logger.logOrderEvent('shop_creation_attempt', {
                code,
                name,
                companyId,
                managerId,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                logger.logOrderEvent('shop_creation_failed', {
                    reason: 'invalid_request_data',
                    bodyType: typeof req.body,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

            // Gọi service để tạo shop
            const result = await ShopService.createShop({
                code,
                name,
                companyId,
                address,
                phone,
                email,
                managerId,
                description
            });

            // Nếu có lỗi validation từ service
            if (!result.success) {
                logger.logOrderEvent('shop_creation_failed', {
                    reason: 'service_validation_error',
                    serviceMessage: result.message,
                    code,
                    name,
                    companyId,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful shop creation
            logger.logOrderEvent('shop_created', {
                shopId: result.data?.id,
                code,
                name,
                companyId,
                managerId,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(201).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'create_shop',
                requestBody: JSON.stringify(req.body),
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tạo shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API cập nhật thông tin shop
     * PUT /api/shop/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateShop(req, res) {
        try {
            const { id } = req.params;
            const { code, name, companyId, address, phone, email, managerId, description, status } = req.body;

            // Log shop update attempt
            logger.logOrderEvent('shop_update_attempt', {
                shopId: id,
                code,
                name,
                companyId,
                managerId,
                status,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                logger.logOrderEvent('shop_update_failed', {
                    reason: 'invalid_shop_id',
                    providedId: id,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                logger.logOrderEvent('shop_update_failed', {
                    shopId,
                    reason: 'invalid_request_data',
                    bodyType: typeof req.body,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

            // Gọi service để cập nhật shop
            const result = await ShopService.updateShop(shopId, {
                code,
                name,
                companyId,
                address,
                phone,
                email,
                managerId,
                description,
                status
            });

            // Nếu có lỗi validation từ service
            if (!result.success) {
                logger.logOrderEvent('shop_update_failed', {
                    shopId,
                    reason: 'service_validation_error',
                    serviceMessage: result.message,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful shop update
            logger.logOrderEvent('shop_updated', {
                shopId,
                code,
                name,
                companyId,
                managerId,
                status,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'update_shop',
                shopId: req.params.id,
                requestBody: JSON.stringify(req.body),
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi cập nhật shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API cập nhật trạng thái shop
     * PATCH /api/shop/:id/status
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async updateShopStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Log status update attempt
            logger.logOrderEvent('shop_status_update_attempt', {
                shopId: id,
                newStatus: status,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                logger.logOrderEvent('shop_status_update_failed', {
                    reason: 'invalid_shop_id',
                    providedId: id,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Validate status
            if (!status || !['active', 'inactive'].includes(status)) {
                logger.logOrderEvent('shop_status_update_failed', {
                    shopId,
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
            const result = await ShopService.updateShopStatus(shopId, status);

            // Nếu có lỗi từ service
            if (!result.success) {
                logger.logOrderEvent('shop_status_update_failed', {
                    shopId,
                    newStatus: status,
                    reason: 'service_error',
                    serviceMessage: result.message,
                    ip: req.ip
                });
                return res.status(400).json(result);
            }

            // Log successful status update
            logger.logOrderEvent('shop_status_updated', {
                shopId,
                newStatus: status,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'update_shop_status',
                shopId: req.params.id,
                status: req.body.status,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi cập nhật trạng thái shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * API xóa shop
     * DELETE /api/shop/:id
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async deleteShop(req, res) {
        try {
            const { id } = req.params;

            // Log delete attempt
            logger.logOrderEvent('shop_delete_attempt', {
                shopId: id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                logger.logOrderEvent('shop_delete_failed', {
                    reason: 'invalid_shop_id',
                    providedId: id,
                    ip: req.ip
                });
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Gọi service để xóa shop
            const result = await ShopService.deleteShop(shopId);

            // Nếu có lỗi từ service
            if (!result.success) {
                logger.logOrderEvent('shop_delete_failed', {
                    shopId,
                    reason: 'service_error',
                    serviceMessage: result.message,
                    ip: req.ip
                });
                return res.status(404).json(result);
            }

            // Log successful shop deletion
            logger.logOrderEvent('shop_deleted', {
                shopId,
                ip: req.ip
            });

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            logger.logError(error, {
                action: 'delete_shop',
                shopId: req.params.id,
                ip: req.ip
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi xóa shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}

module.exports = new ShopController();
