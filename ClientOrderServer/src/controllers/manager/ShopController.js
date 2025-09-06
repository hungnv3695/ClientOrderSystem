// controllers/manager/ShopController.js
const ShopService = require('../../services/manager/ShopService');

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
            console.error('ShopController.searchShops error:', error);

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
            console.error('ShopController.getShopsForDropdown error:', error);

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
            console.error('ShopController.getShopsByCompany error:', error);

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
            console.error('ShopController.getShopById error:', error);

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
            console.log('createShop - Request body:', JSON.stringify(req.body, null, 2));

            const { code, name, companyId, address, phone, email, managerId, description } = req.body;

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu request không hợp lệ'
                });
            }

            console.log('createShop - Extracted data:', {
                code, name, companyId, address, phone, email, managerId, description
            });

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

            console.log('createShop - Service result:', JSON.stringify(result, null, 2));

            // Nếu có lỗi validation từ service
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Trả về kết quả thành công
            return res.status(201).json(result);

        } catch (error) {
            console.error('ShopController.createShop error:', error);

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

            console.log('updateShop - Request params and body:', {
                id,
                body: JSON.stringify(req.body, null, 2)
            });

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Validate input
            if (!req.body || typeof req.body !== 'object') {
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

            console.log('updateShop - Service result:', JSON.stringify(result, null, 2));

            // Nếu có lỗi validation từ service
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            console.error('ShopController.updateShop error:', error);

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

            console.log('updateShopStatus - Request params and body:', {
                id,
                status
            });

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Validate status
            if (!status || !['active', 'inactive'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái phải là "active" hoặc "inactive"'
                });
            }

            // Gọi service để cập nhật trạng thái
            const result = await ShopService.updateShopStatus(shopId, status);

            console.log('updateShopStatus - Service result:', JSON.stringify(result, null, 2));

            // Nếu có lỗi từ service
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            console.error('ShopController.updateShopStatus error:', error);

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

            // Validate ID
            const shopId = parseInt(id);
            if (!shopId || shopId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID shop không hợp lệ'
                });
            }

            // Gọi service để xóa shop
            const result = await ShopService.deleteShop(shopId);

            console.log('deleteShop - Service result:', JSON.stringify(result, null, 2));

            // Nếu có lỗi từ service
            if (!result.success) {
                return res.status(404).json(result);
            }

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            console.error('ShopController.deleteShop error:', error);

            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi xóa shop',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}

module.exports = new ShopController();
