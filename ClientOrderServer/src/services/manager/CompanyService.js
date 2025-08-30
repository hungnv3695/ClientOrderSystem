// services/manager/CompanyService.js
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
     * @returns {Array} Danh sách công ty
     */
    async getAllCompaniesForDropdown() {
        try {
            const companies = await Company.findAll({
                attributes: ['id', 'code', 'name'],
                order: [['name', 'ASC']]
            });

            return {
                success: true,
                data: companies,
                message: `Lấy ${companies.length} công ty thành công`
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
     * @returns {Object} Thông tin công ty vừa tạo
     */
    async createCompany(companyData) {
        try {
            const { code, name, registration_number, address, phone, email, website, description } = companyData;

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

            // Kiểm tra số điện thoại format nếu có
            // if (phone && phone.trim()) {
            //     const phoneRegex = /^[0-9+\-\s\(\)]{10,15}$/;
            //     if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
            //         return {
            //             success: false,
            //             message: 'Số điện thoại không đúng định dạng'
            //         };
            //     }
            // }

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
                description: description?.trim() || null
            });

            const newCompany = await Company.create({
                code: code.trim(),
                name: name.trim(),
                registration_number: registration_number.trim(),
                address: address?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                website: website?.trim() || null,
                description: description?.trim() || null
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


}

module.exports = new CompanyService();
