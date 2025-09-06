// services/manager/ShopService.js
const { Shop, Company } = require('../../database');
const { Op } = require('sequelize');
const { STATUS, STATUS_VALUES, PAGINATION, MESSAGES } = require('../../constants/app.constants');

class ShopService {
    /**
     * Tìm kiếm shop với phân trang và filter
     * @param {Object} params - Tham số tìm kiếm
     * @param {string} params.code - Mã shop
     * @param {string} params.name - Tên shop
     * @param {number} params.companyId - ID công ty
     * @param {string} params.companyName - Tên công ty
     * @param {string} params.address - Địa chỉ
     * @param {string} params.phone - Số điện thoại
     * @param {string} params.email - Email
     * @param {number} params.managerId - ID quản lý
     * @param {string} params.status - Trạng thái ('active', 'inactive')
     * @param {string} params.createdAtFrom - Từ ngày tạo (YYYY-MM-DD)
     * @param {string} params.createdAtTo - Đến ngày tạo (YYYY-MM-DD)
     * @param {number} params.page - Trang hiện tại (mặc định: 1)
     * @param {number} params.limit - Số bản ghi trên trang (mặc định: 20)
     * @param {string} params.sortBy - Cột sắp xếp (mặc định: 'created_at')
     * @param {string} params.sortOrder - Thứ tự sắp xếp: 'ASC' hoặc 'DESC' (mặc định: 'DESC')
     * @returns {Object} Kết quả tìm kiếm với phân trang
     */
    async searchShops(params = {}) {
        try {
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
                page = 1,
                limit = 20,
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = params;

            // Xây dựng điều kiện WHERE cho Shop
            const whereConditions = {};

            // Tìm kiếm theo mã shop
            if (code && code.trim()) {
                whereConditions.code = {
                    [Op.iLike]: `%${code.trim()}%`
                };
            }

            // Tìm kiếm theo tên shop (cần thêm field name vào model)
            if (name && name.trim()) {
                whereConditions.name = {
                    [Op.iLike]: `%${name.trim()}%`
                };
            }

            // Tìm kiếm theo company ID
            if (companyId) {
                whereConditions.companyId = companyId;
            }

            // Tìm kiếm theo địa chỉ
            if (address && address.trim()) {
                whereConditions.address = {
                    [Op.iLike]: `%${address.trim()}%`
                };
            }

            // Tìm kiếm theo số điện thoại
            if (phone && phone.trim()) {
                whereConditions.phone = {
                    [Op.iLike]: `%${phone.trim()}%`
                };
            }

            // Tìm kiếm theo email
            if (email && email.trim()) {
                whereConditions.email = {
                    [Op.iLike]: `%${email.trim()}%`
                };
            }

            // Tìm kiếm theo manager ID
            if (managerId) {
                whereConditions.managerId = managerId;
            }

            // Tìm kiếm theo trạng thái
            if (status && status.trim() && STATUS_VALUES.includes(status.trim().toLowerCase())) {
                whereConditions.status = status.trim().toLowerCase();
            }

            // Lọc theo khoảng thời gian tạo
            if (createdAtFrom || createdAtTo) {
                whereConditions.created_at = {};

                if (createdAtFrom) {
                    whereConditions.created_at[Op.gte] = new Date(createdAtFrom + ' 00:00:00');
                }

                if (createdAtTo) {
                    whereConditions.created_at[Op.lte] = new Date(createdAtTo + ' 23:59:59');
                }
            }

            // Xây dựng điều kiện WHERE cho Company (nếu tìm theo tên công ty)
            const includeOptions = [{
                model: Company,
                as: 'company',
                attributes: ['id', 'code', 'name'],
                required: false
            }];

            if (companyName && companyName.trim()) {
                includeOptions[0].where = {
                    name: {
                        [Op.iLike]: `%${companyName.trim()}%`
                    }
                };
                includeOptions[0].required = true;
            }

            // Tính toán offset cho phân trang
            const pageNumber = Math.max(1, parseInt(page) || 1);
            const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
            const offset = (pageNumber - 1) * pageSize;

            // Xây dựng order clause
            const validSortColumns = ['id', 'code', 'name', 'created_at', 'updated_at'];
            const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            // Thực hiện truy vấn với phân trang
            const result = await Shop.findAndCountAll({
                where: whereConditions,
                include: includeOptions,
                order: [[sortColumn, order]],
                limit: pageSize,
                offset: offset,
                attributes: [
                    'id',
                    'code',
                    'name',
                    'companyId',
                    'address',
                    'phone',
                    'email',
                    'managerId',
                    'status',
                    'created_at',
                    'updated_at'
                ]
            });

            // Format dữ liệu trả về
            const shops = result.rows.map(shop => {
                const shopData = shop.toJSON();
                return {
                    ...shopData,
                    companyName: shopData.company?.name || null,
                    // Có thể thêm managerName nếu có relation với User model
                    managerName: null
                };
            });

            // Tính toán thông tin phân trang
            const totalRecords = result.count;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            return {
                success: true,
                data: {
                    rows: shops,
                    count: totalRecords,
                    pagination: {
                        currentPage: pageNumber,
                        pageSize: pageSize,
                        totalRecords: totalRecords,
                        totalPages: totalPages,
                        hasNextPage: hasNextPage,
                        hasPrevPage: hasPrevPage,
                        nextPage: hasNextPage ? pageNumber + 1 : null,
                        prevPage: hasPrevPage ? pageNumber - 1 : null
                    },
                    filters: {
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
                        createdAtTo
                    },
                    sorting: {
                        sortBy: sortColumn,
                        sortOrder: order
                    }
                },
                message: `Tìm thấy ${totalRecords} shop`
            };

        } catch (error) {
            console.error('ShopService.searchShops error:', error);
            throw {
                success: false,
                message: 'Lỗi khi tìm kiếm shop',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách tất cả shop (không phân trang) - dùng cho dropdown
     * Chỉ lấy các shop có trạng thái hoạt động
     * @returns {Array} Danh sách shop đang hoạt động
     */
    async getAllShopsForDropdown() {
        try {
            const shops = await Shop.findAll({
                where: {
                    status: 'active'
                },
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['name']
                }],
                attributes: ['id', 'code', 'name'],
                order: [['name', 'ASC']]
            });

            const formattedShops = shops.map(shop => ({
                id: shop.id,
                code: shop.code,
                name: shop.name,
                companyName: shop.company?.name || null
            }));

            return {
                success: true,
                data: formattedShops,
                message: `Lấy ${shops.length} shop đang hoạt động thành công`
            };

        } catch (error) {
            console.error('ShopService.getAllShopsForDropdown error:', error);
            throw {
                success: false,
                message: 'Lỗi khi lấy danh sách shop cho dropdown',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách shop theo công ty
     * @param {number} companyId - ID công ty
     * @returns {Object} Danh sách shop thuộc công ty
     */
    async getShopsByCompany(companyId) {
        try {
            const shops = await Shop.findAll({
                where: {
                    companyId: companyId
                },
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'code', 'name']
                }],
                order: [['name', 'ASC']]
            });

            return {
                success: true,
                data: shops,
                message: `Tìm thấy ${shops.length} shop thuộc công ty`
            };

        } catch (error) {
            console.error('ShopService.getShopsByCompany error:', error);
            throw {
                success: false,
                message: 'Lỗi khi lấy danh sách shop theo công ty',
                error: error.message
            };
        }
    }

    /**
     * Lấy thông tin chi tiết shop theo ID
     * @param {number} id - ID shop
     * @returns {Object} Thông tin shop
     */
    async getShopById(id) {
        try {
            const shop = await Shop.findByPk(id, {
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'code', 'name']
                }]
            });

            if (!shop) {
                return {
                    success: false,
                    message: 'Không tìm thấy shop'
                };
            }

            return {
                success: true,
                data: shop,
                message: 'Lấy thông tin shop thành công'
            };

        } catch (error) {
            console.error('ShopService.getShopById error:', error);
            throw {
                success: false,
                message: 'Lỗi khi lấy thông tin shop',
                error: error.message
            };
        }
    }

    /**
     * Tạo shop mới
     * @param {Object} shopData - Dữ liệu shop
     * @param {string} shopData.code - Mã shop (bắt buộc)
     * @param {string} shopData.name - Tên shop (bắt buộc)
     * @param {number} shopData.companyId - ID công ty (bắt buộc)
     * @param {string} shopData.address - Địa chỉ
     * @param {string} shopData.phone - Số điện thoại
     * @param {string} shopData.email - Email
     * @param {number} shopData.managerId - ID quản lý
     * @param {string} shopData.description - Mô tả
     * @returns {Object} Thông tin shop đã tạo
     */
    async createShop(shopData) {
        try {
            const { code, name, companyId, address, phone, email, managerId, description } = shopData;

            // Validate required fields
            if (!code || !code.trim()) {
                return {
                    success: false,
                    message: 'Mã shop là bắt buộc'
                };
            }

            if (!name || !name.trim()) {
                return {
                    success: false,
                    message: 'Tên shop là bắt buộc'
                };
            }

            if (!companyId || companyId < 1) {
                return {
                    success: false,
                    message: 'Công ty là bắt buộc'
                };
            }

            // Validate email format if provided
            if (email && email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        message: 'Định dạng email không hợp lệ'
                    };
                }
            }

            // Kiểm tra công ty có tồn tại không
            const company = await Company.findByPk(companyId);
            if (!company) {
                return {
                    success: false,
                    message: 'Công ty không tồn tại'
                };
            }

            // Kiểm tra tính duy nhất của code
            const existingShopByCode = await Shop.findOne({
                where: { code: code.trim() }
            });

            if (existingShopByCode) {
                return {
                    success: false,
                    message: `Mã shop "${code.trim()}" đã tồn tại`
                };
            }

            // Tạo shop mới
            console.log('ShopService.createShop - Creating with data:', {
                code: code.trim(),
                name: name.trim(),
                companyId: companyId,
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                managerId: managerId || null,
                status: 'active'
            });

            const newShop = await Shop.create({
                code: code.trim(),
                name: name.trim(),
                companyId: companyId,
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                managerId: managerId || null,
                status: STATUS.ACTIVE
            });

            console.log('ShopService.createShop - Created shop:', JSON.stringify(newShop.toJSON(), null, 2));

            return {
                success: true,
                data: newShop,
                message: 'Tạo shop thành công'
            };

        } catch (error) {
            console.error('ShopService.createShop error:', error);

            // Xử lý lỗi unique constraint từ database
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0]?.path;
                if (field === 'code') {
                    return {
                        success: false,
                        message: 'Mã shop đã tồn tại'
                    };
                }
            }

            throw {
                success: false,
                message: 'Lỗi khi tạo shop',
                error: error.message
            };
        }
    }

    /**
     * Cập nhật thông tin shop
     * @param {number} id - ID shop
     * @param {Object} shopData - Dữ liệu cập nhật
     * @returns {Object} Thông tin shop đã cập nhật
     */
    async updateShop(id, shopData) {
        try {
            const { code, name, companyId, address, phone, email, managerId, description, status } = shopData;

            // Tìm shop cần cập nhật
            const shop = await Shop.findByPk(id);
            if (!shop) {
                return {
                    success: false,
                    message: 'Không tìm thấy shop'
                };
            }

            // Validate required fields
            if (!code || !code.trim()) {
                return {
                    success: false,
                    message: 'Mã shop là bắt buộc'
                };
            }

            if (!name || !name.trim()) {
                return {
                    success: false,
                    message: 'Tên shop là bắt buộc'
                };
            }

            if (!companyId || companyId < 1) {
                return {
                    success: false,
                    message: 'Công ty là bắt buộc'
                };
            }

            // Validate email format if provided
            if (email && email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        message: 'Định dạng email không hợp lệ'
                    };
                }
            }

            // Validate status nếu có
            if (status && !STATUS_VALUES.includes(status)) {
                return {
                    success: false,
                    message: `Trạng thái phải là "${STATUS_VALUES.join('" hoặc "')}"`
                };
            }

            // Kiểm tra công ty có tồn tại không
            const company = await Company.findByPk(companyId);
            if (!company) {
                return {
                    success: false,
                    message: 'Công ty không tồn tại'
                };
            }

            // Kiểm tra tính duy nhất của code (trừ chính nó)
            const existingShopByCode = await Shop.findOne({
                where: { 
                    code: code.trim(),
                    id: { [Op.ne]: id }
                }
            });

            if (existingShopByCode) {
                return {
                    success: false,
                    message: `Mã shop "${code.trim()}" đã tồn tại`
                };
            }

            // Cập nhật shop
            const updateData = {
                code: code.trim(),
                name: name.trim(),
                companyId: companyId,
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                managerId: managerId || null
            };

            if (status) {
                updateData.status = status.toLowerCase();
            }

            console.log('ShopService.updateShop - Updating with data:', updateData);

            await shop.update(updateData);

            console.log('ShopService.updateShop - Updated shop:', JSON.stringify(shop.toJSON(), null, 2));

            return {
                success: true,
                data: shop,
                message: 'Cập nhật shop thành công'
            };

        } catch (error) {
            console.error('ShopService.updateShop error:', error);

            // Xử lý lỗi unique constraint từ database
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0]?.path;
                if (field === 'code') {
                    return {
                        success: false,
                        message: 'Mã shop đã tồn tại'
                    };
                }
            }

            throw {
                success: false,
                message: 'Lỗi khi cập nhật shop',
                error: error.message
            };
        }
    }

    /**
     * Cập nhật trạng thái shop
     * @param {number} id - ID shop
     * @param {string} status - Trạng thái mới ('active' hoặc 'inactive')
     * @returns {Object} Kết quả cập nhật
     */
    async updateShopStatus(id, status) {
        try {
            // Tìm shop cần cập nhật
            const shop = await Shop.findByPk(id);
            if (!shop) {
                return {
                    success: false,
                    message: 'Không tìm thấy shop'
                };
            }

            // Cập nhật trạng thái
            await shop.update({
                status: status.toLowerCase()
            });

            return {
                success: true,
                data: shop,
                message: `Cập nhật trạng thái shop thành ${status === 'active' ? 'hoạt động' : 'ngừng hoạt động'} thành công`
            };

        } catch (error) {
            console.error('ShopService.updateShopStatus error:', error);
            throw {
                success: false,
                message: 'Lỗi khi cập nhật trạng thái shop',
                error: error.message
            };
        }
    }

    /**
     * Xóa shop
     * @param {number} id - ID shop
     * @returns {Object} Kết quả xóa
     */
    async deleteShop(id) {
        try {
            // Tìm shop cần xóa
            const shop = await Shop.findByPk(id);
            if (!shop) {
                return {
                    success: false,
                    message: 'Không tìm thấy shop'
                };
            }

            // TODO: Kiểm tra xem shop có đang được sử dụng không (có orders, users, etc.)
            // Nếu có thì không cho phép xóa

            // Xóa shop
            await shop.destroy();

            return {
                success: true,
                message: 'Xóa shop thành công'
            };

        } catch (error) {
            console.error('ShopService.deleteShop error:', error);
            throw {
                success: false,
                message: 'Lỗi khi xóa shop',
                error: error.message
            };
        }
    }
}

module.exports = new ShopService();