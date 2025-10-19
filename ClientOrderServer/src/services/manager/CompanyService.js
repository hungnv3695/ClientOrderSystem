// services/manager/CompanyService.js
const { COMPANY_STATUS } = require('../../constants/app.constants');
const { Company } = require('../../database');
const { Op } = require('sequelize');

class CompanyService {
    /**
     * Tìm kiếm công ty với phân trang và filter
     * @param {Object} params - Tham số tìm kiếm
     * @param {string} params.code - Mã công ty
     * @param {string} params.name - Tên công ty
     * @param {string} params.registrationNumber - Số đăng ký kinh doanh
     * @param {string} params.address - Địa chỉ
     * @param {string} params.phone - Số điện thoại
     * @param {string} params.email - Email
     * @param {integer} params.status - Trạng thái (1: 'active', 0: 'inactive')
     * @param {string} params.createdAtFrom - Từ ngày tạo (YYYY-MM-DD)
     * @param {string} params.createdAtTo - Đến ngày tạo (YYYY-MM-DD)
     * @param {number} params.page - Trang hiện tại (mặc định: 1)
     * @param {number} params.limit - Số bản ghi trên trang (mặc định: 20)
     * @param {string} params.sortBy - Cột sắp xếp (mặc định: 'created_at')
     * @param {string} params.sortOrder - Thứ tự sắp xếp: 'ASC' hoặc 'DESC' (mặc định: 'DESC')
     * @returns {Object} Kết quả tìm kiếm với phân trang
     */
    async searchCompanies(params = {}) {
        try {
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
                page = 1,
                limit = 20,
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = params;            // Xây dựng điều kiện WHERE
            const whereConditions = {};

            // Tìm kiếm theo mã công ty
            if (code && code.trim()) {
                whereConditions.code = {
                    [Op.iLike]: `%${code.trim()}%`
                };
            }

            // Tìm kiếm theo tên công ty
            if (name && name.trim()) {
                whereConditions.name = {
                    [Op.iLike]: `%${name.trim()}%`
                };
            }

            // Tìm kiếm theo số đăng ký kinh doanh
            if (registration_number && registration_number.trim()) {
                whereConditions.registration_number = {
                    [Op.iLike]: `%${registration_number.trim()}%`
                };
            }            // Tìm kiếm theo địa chỉ
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

            // Tìm kiếm theo trạng thái
            if (status == COMPANY_STATUS.ACTIVE || status == COMPANY_STATUS.INACTIVE) {
                whereConditions.status = status;
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

            // Tính toán offset cho phân trang
            const pageNumber = Math.max(1, parseInt(page) || 1);
            const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Giới hạn tối đa 100 bản ghi/trang
            const offset = (pageNumber - 1) * pageSize;

            // Xây dựng order clause
            const validSortColumns = ['id', 'code', 'name', 'registration_number', 'created_at', 'updated_at'];
            const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            // Thực hiện truy vấn với phân trang
            const result = await Company.findAndCountAll({
                where: whereConditions,
                order: [[sortColumn, order]],
                limit: pageSize,
                offset: offset,
                attributes: [
                    'id',
                    'code',
                    'name',
                    'registration_number',
                    'address',
                    'phone',
                    'email',
                    'website',
                    'description',
                    'status',
                    'created_at',
                    'updated_at'
                ]
            });

            // Tính toán thông tin phân trang
            const totalRecords = result.count;
            const totalPages = Math.ceil(totalRecords / pageSize);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;
            return {
                success: true,
                data: {
                    companies: result.rows,
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
                        registration_number,
                        address,
                        phone,
                        email,
                        status,
                        createdAtFrom,
                        createdAtTo
                    },
                    sorting: {
                        sortBy: sortColumn,
                        sortOrder: order
                    }
                },
                message: `Tìm thấy ${totalRecords} công ty`
            };

        } catch (error) {
            console.error('CompanyService.searchCompanies error:', error);
            throw {
                success: false,
                message: 'Lỗi khi tìm kiếm công ty',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách tất cả công ty (không phân trang) - dùng cho dropdown
     * Chỉ lấy các công ty có trạng thái hoạt động
     * @returns {Array} Danh sách công ty đang hoạt động
     */
    async getAllCompaniesForDropdown() {
        try {
            const companies = await Company.findAll({
                where: {
                    status: COMPANY_STATUS.ACTIVE
                },
                attributes: ['id', 'code', 'name'],
                order: [['name', 'ASC']]
            });

            return {
                success: true,
                data: companies,
                message: `Lấy ${companies.length} công ty đang hoạt động thành công`
            };

        } catch (error) {
            console.error('CompanyService.getAllCompaniesForDropdown error:', error);
            throw {
                success: false,
                message: 'Lỗi khi lấy danh sách công ty',
                error: error.message
            };
        }
    }

    /**
     * Lấy thông tin chi tiết công ty theo ID
     * @param {number} id - ID công ty
     * @returns {Object} Thông tin công ty
     */
    async getCompanyById(id) {
        try {
            const company = await Company.findByPk(id);

            if (!company) {
                return {
                    success: false,
                    message: 'Không tìm thấy công ty'
                };
            }

            return {
                success: true,
                data: company,
                message: 'Lấy thông tin công ty thành công'
            };

        } catch (error) {
            console.error('CompanyService.getCompanyById error:', error);
            throw {
                success: false,
                message: 'Lỗi khi lấy thông tin công ty',
                error: error.message
            };
        }
    }

    /**
     * Tạo mới công ty
     * @param {Object} companyData - Dữ liệu công ty cần tạo
     * @param {string} companyData.code - Mã công ty (bắt buộc, unique)
     * @param {string} companyData.name - Tên công ty (bắt buộc)
     * @param {string} companyData.registrationNumber - Số đăng ký kinh doanh (bắt buộc, unique)
     * @param {string} companyData.address - Địa chỉ (tùy chọn)
     * @param {string} companyData.phone - Số điện thoại (tùy chọn)
     * @param {string} companyData.email - Email (tùy chọn)
     * @param {string} companyData.website - Website (tùy chọn)
     * @param {string} companyData.description - Mô tả (tùy chọn)
     * @param {integer} companyData.status - Trạng thái: 1 (active) hoặc 0 (inactive) (mặc định: 1)
     * @returns {Object} Thông tin công ty vừa tạo
     */
    async createCompany(companyData) {
        try {
            const { code, name, registration_number, address, phone, email, website, description, status } = companyData;

            // Validation dữ liệu đầu vào
            if (!code || !code.trim()) {
                return {
                    success: false,
                    message: 'Mã công ty là bắt buộc'
                };
            }

            if (!name || !name.trim()) {
                return {
                    success: false,
                    message: 'Tên công ty là bắt buộc'
                };
            }

            if (!registration_number || !registration_number.trim()) {
                return {
                    success: false,
                    message: 'Số đăng ký kinh doanh là bắt buộc'
                };
            }

            // Kiểm tra email format nếu có
            if (email && email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        message: 'Email không đúng định dạng'
                    };
                }
            }

            // Validate status nếu có
            if (status !== COMPANY_STATUS.ACTIVE && status !== COMPANY_STATUS.INACTIVE) {
                return {
                    success: false,
                    message: 'Trạng thái phải là "active" hoặc "inactive"'
                };
            }

            // Kiểm tra tính duy nhất của code
            const existingCompanyByCode = await Company.findOne({
                where: { code: code.trim() }
            });

            if (existingCompanyByCode) {
                return {
                    success: false,
                    message: `Mã công ty "${code.trim()}" đã tồn tại`
                };
            }

            // Kiểm tra tính duy nhất của registration_number
            const existingCompanyByRegNumber = await Company.findOne({
                where: { registration_number: registration_number.trim() }
            });

            if (existingCompanyByRegNumber) {
                return {
                    success: false,
                    message: `Số đăng ký kinh doanh "${registration_number.trim()}" đã tồn tại`
                };
            }

            // Tạo công ty mới
            console.log('CompanyService.createCompany - Creating with data:', {
                code: code.trim(),
                name: name.trim(),
                registration_number: registration_number.trim(),
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                website: website?.trim() || null,
                description: description?.trim() || null,
                status: status
            });

            const newCompany = await Company.create({
                code: code.trim(),
                name: name.trim(),
                registration_number: registration_number.trim(),
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                website: website?.trim() || null,
                description: description?.trim() || null,
                status: status
            });

            console.log('CompanyService.createCompany - Created company:', JSON.stringify(newCompany.toJSON(), null, 2));

            return {
                success: true,
                data: newCompany,
                message: 'Tạo công ty thành công'
            };

        } catch (error) {
            console.error('CompanyService.createCompany error:', error);

            // Xử lý lỗi unique constraint từ database
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0]?.path;
                if (field === 'code') {
                    return {
                        success: false,
                        message: 'Mã công ty đã tồn tại'
                    };
                } else if (field === 'registration_number') {
                    return {
                        success: false,
                        message: 'Số đăng ký kinh doanh đã tồn tại'
                    };
                }
            }

            throw {
                success: false,
                message: 'Lỗi khi tạo công ty',
                error: error.message
            };
        }
    }

    /**
     * Cập nhật thông tin công ty
     * @param {number} id - ID công ty
     * @param {Object} companyData - Dữ liệu cập nhật
     * @param {string} companyData.code - Mã công ty (bắt buộc, unique)
     * @param {string} companyData.name - Tên công ty (bắt buộc)
     * @param {string} companyData.registration_number - Số đăng ký kinh doanh (unique)
     * @param {string} companyData.address - Địa chỉ (tùy chọn)
     * @param {string} companyData.phone - Số điện thoại (tùy chọn)
     * @param {string} companyData.email - Email (tùy chọn)
     * @param {string} companyData.website - Website (tùy chọn)
     * @param {string} companyData.description - Mô tả (tùy chọn)
     * @param {integer} companyData.status - Trạng thái: 1 (active) hoặc 0 (inactive) (tùy chọn)
     * @returns {Object} Thông tin công ty đã cập nhật
     */
    async updateCompany(id, companyData) {
        try {
            const { code, name, registration_number, address, phone, email, website, description, status } = companyData;

            // Validation ID
            if (!id || id < 1) {
                return {
                    success: false,
                    message: 'ID công ty không hợp lệ'
                };
            }

            // Kiểm tra công ty có tồn tại không
            const existingCompany = await Company.findByPk(id);
            if (!existingCompany) {
                return {
                    success: false,
                    message: 'Không tìm thấy công ty'
                };
            }

            // Validation dữ liệu đầu vào
            if (!code || !code.trim()) {
                return {
                    success: false,
                    message: 'Mã công ty là bắt buộc'
                };
            }

            if (!name || !name.trim()) {
                return {
                    success: false,
                    message: 'Tên công ty là bắt buộc'
                };
            }

            if (registration_number && !registration_number.trim()) {
                return {
                    success: false,
                    message: 'Số đăng ký kinh doanh không được để trống'
                };
            }

            // Kiểm tra email format nếu có
            if (email && email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        message: 'Email không đúng định dạng'
                    };
                }
            }

            // Validate status nếu có
            if (status !== COMPANY_STATUS.ACTIVE && status !== COMPANY_STATUS.INACTIVE) {
                return {
                    success: false,
                    message: 'Trạng thái phải là "active" hoặc "inactive"'
                };
            }

            // Kiểm tra tính duy nhất của code (nếu khác với code hiện tại)
            if (code.trim() !== existingCompany.code) {
                const existingCompanyByCode = await Company.findOne({
                    where: { 
                        code: code.trim(),
                        id: { [Op.ne]: id } // Loại trừ chính nó
                    }
                });

                if (existingCompanyByCode) {
                    return {
                        success: false,
                        message: `Mã công ty "${code.trim()}" đã tồn tại`
                    };
                }
            }

            // Kiểm tra tính duy nhất của registration_number (nếu khác với registration_number hiện tại)
            if (registration_number && registration_number.trim() !== existingCompany.registration_number) {
                const existingCompanyByRegNumber = await Company.findOne({
                    where: { 
                        registration_number: registration_number.trim(),
                        id: { [Op.ne]: id } // Loại trừ chính nó
                    }
                });

                if (existingCompanyByRegNumber) {
                    return {
                        success: false,
                        message: `Số đăng ký kinh doanh "${registration_number.trim()}" đã tồn tại`
                    };
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
                code: code.trim(),
                name: name.trim(),
                registration_number: registration_number?.trim() || null,
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                website: website?.trim() || null,
                description: description?.trim() || null
            };

            // Thêm status nếu có
            if (status == COMPANY_STATUS.ACTIVE || status == COMPANY_STATUS.INACTIVE) {
                updateData.status = status;
            }

            console.log('CompanyService.updateCompany - Updating with data:', updateData);

            // Cập nhật công ty
            await existingCompany.update(updateData);

            // Lấy lại thông tin công ty đã cập nhật
            const updatedCompany = await Company.findByPk(id);

            console.log('CompanyService.updateCompany - Updated company:', JSON.stringify(updatedCompany.toJSON(), null, 2));

            return {
                success: true,
                data: updatedCompany,
                message: 'Cập nhật công ty thành công'
            };

        } catch (error) {
            console.error('CompanyService.updateCompany error:', error);

            // Xử lý lỗi unique constraint từ database
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0]?.path;
                if (field === 'code') {
                    return {
                        success: false,
                        message: 'Mã công ty đã tồn tại'
                    };
                } else if (field === 'registration_number') {
                    return {
                        success: false,
                        message: 'Số đăng ký kinh doanh đã tồn tại'
                    };
                }
            }

            throw {
                success: false,
                message: 'Lỗi khi cập nhật công ty',
                error: error.message
            };
        }
    }

    /**
     * Cập nhật trạng thái công ty
     * @param {number} id - ID công ty
     * @param {integer} status - Trạng thái mới: 1 (active) hoặc 0 (inactive)
     * @returns {Object} Kết quả cập nhật
     */
    async updateCompanyStatus(id, status) {
        try {
            // Validate status
            if (status !== COMPANY_STATUS.ACTIVE && status !== COMPANY_STATUS.INACTIVE) {
                return {
                    success: false,
                    message: 'Trạng thái phải là "active" hoặc "inactive"'
                };
            }

            // Kiểm tra công ty có tồn tại không
            const company = await Company.findByPk(id);
            if (!company) {
                return {
                    success: false,
                    message: 'Không tìm thấy công ty'
                };
            }

            // Cập nhật trạng thái
            await company.update({ status });

            return {
                success: true,
                data: company,
                message: `Cập nhật trạng thái công ty thành "${status}" thành công`
            };

        } catch (error) {
            console.error('CompanyService.updateCompanyStatus error:', error);
            throw {
                success: false,
                message: 'Lỗi khi cập nhật trạng thái công ty',
                error: error.message
            };
        }
    }


}

module.exports = new CompanyService();
