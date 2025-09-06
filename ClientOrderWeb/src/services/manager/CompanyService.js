// services/manager/CompanyService.js
import axios from '../axios'

class CompanyService {
    /**
     * Tìm kiếm công ty với phân trang
     * @param {Object} params - Tham số tìm kiếm
     * @param {string} params.code - Mã công ty
     * @param {string} params.name - Tên công ty
     * @param {string} params.registration_number - Số đăng ký kinh doanh
     * @param {string} params.address - Địa chỉ
     * @param {string} params.phone - Số điện thoại
     * @param {string} params.email - Email
     * @param {string} params.createdAtFrom - Từ ngày tạo (YYYY-MM-DD)
     * @param {string} params.createdAtTo - Đến ngày tạo (YYYY-MM-DD)
     * @param {number} params.page - Trang hiện tại
     * @param {number} params.limit - Số bản ghi trên trang
     * @param {string} params.sortBy - Cột sắp xếp
     * @param {string} params.sortOrder - Thứ tự sắp xếp (ASC/DESC)
     * @returns {Promise<Object>} Kết quả tìm kiếm
     */
    async searchCompanies(params = {}) {
        try {
            const response = await axios.get('/company/search', {
                params: params
            })
            return response.data
        } catch (error) {
            console.error('CompanyManagementService.searchCompanies error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Tạo công ty mới
     * @param {Object} companyData - Dữ liệu công ty
     * @param {string} companyData.code - Mã công ty (bắt buộc)
     * @param {string} companyData.name - Tên công ty (bắt buộc)
     * @param {string} companyData.registrationNumber - Số đăng ký kinh doanh
     * @param {string} companyData.address - Địa chỉ
     * @param {string} companyData.phone - Số điện thoại
     * @param {string} companyData.email - Email
     * @param {string} companyData.website - Website
     * @param {string} companyData.description - Mô tả
     * @returns {Promise<Object>} Thông tin công ty đã tạo
     */
    async createCompany(companyData) {
        try {
            // Validate required fields
            if (!companyData.code || !companyData.code.trim()) {
                throw new Error('Mã công ty là bắt buộc')
            }
            if (!companyData.name || !companyData.name.trim()) {
                throw new Error('Tên công ty là bắt buộc')
            }

            // Sanitize data
            const sanitizedData = {
                code: companyData.code.trim(),
                name: companyData.name.trim(),
                registration_number: companyData.registration_number?.trim() || '',
                address: companyData.address?.trim() || '',
                phone: companyData.phone?.trim() || '',
                email: companyData.email?.trim() || '',
                website: companyData.website?.trim() || '',
                description: companyData.description?.trim() || ''
            }

            // Validate email format if provided
            if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
                throw new Error('Định dạng email không hợp lệ')
            }

            // Validate phone format if provided
            // if (sanitizedData.phone && !this.isValidPhone(sanitizedData.phone)) {
            //     throw new Error('Định dạng số điện thoại không hợp lệ')
            // }

            const response = await axios.post('/company', sanitizedData)
            return response.data
        } catch (error) {
            console.error('CompanyService.createCompany error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Cập nhật thông tin công ty
     * @param {number} id - ID công ty
     * @param {Object} companyData - Dữ liệu cập nhật
     * @param {string} companyData.code - Mã công ty (bắt buộc)
     * @param {string} companyData.name - Tên công ty (bắt buộc)
     * @param {string} companyData.registration_number - Số đăng ký kinh doanh
     * @param {string} companyData.address - Địa chỉ
     * @param {string} companyData.phone - Số điện thoại
     * @param {string} companyData.email - Email
     * @param {string} companyData.website - Website
     * @param {string} companyData.description - Mô tả
     * @param {string} companyData.status - Trạng thái (active/inactive)
     * @returns {Promise<Object>} Thông tin công ty đã cập nhật
     */
    async updateCompany(id, companyData) {
        try {
            if (!id || id < 1) {
                throw new Error('ID công ty không hợp lệ')
            }

            // Validate required fields
            if (!companyData.code || !companyData.code.trim()) {
                throw new Error('Mã công ty là bắt buộc')
            }
            if (!companyData.name || !companyData.name.trim()) {
                throw new Error('Tên công ty là bắt buộc')
            }

            // Sanitize data
            const sanitizedData = {
                code: companyData.code.trim(),
                name: companyData.name.trim(),
                registration_number: companyData.registration_number?.trim() || '',
                address: companyData.address?.trim() || '',
                phone: companyData.phone?.trim() || '',
                email: companyData.email?.trim() || '',
                website: companyData.website?.trim() || '',
                description: companyData.description?.trim() || ''
            }

            // Add status if provided
            if (companyData.status) {
                if (!['active', 'inactive'].includes(companyData.status)) {
                    throw new Error('Trạng thái phải là "active" hoặc "inactive"')
                }
                sanitizedData.status = companyData.status
            }

            // Validate email format if provided
            if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
                throw new Error('Định dạng email không hợp lệ')
            }

            // Validate phone format if provided
            // if (sanitizedData.phone && !this.isValidPhone(sanitizedData.phone)) {
            //     throw new Error('Định dạng số điện thoại không hợp lệ')
            // }

            const response = await axios.put(`/company/${id}`, sanitizedData)
            return response.data
        } catch (error) {
            console.error('CompanyService.updateCompany error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Cập nhật trạng thái công ty
     * @param {number} id - ID công ty
     * @param {string} status - Trạng thái mới ('active' hoặc 'inactive')
     * @returns {Promise<Object>} Kết quả cập nhật
     */
    async updateCompanyStatus(id, status) {
        try {
            if (!id || id < 1) {
                throw new Error('ID công ty không hợp lệ')
            }

            if (!['active', 'inactive'].includes(status)) {
                throw new Error('Trạng thái phải là "active" hoặc "inactive"')
            }

            const response = await axios.patch(`/company/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error('CompanyService.updateCompanyStatus error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Xóa công ty
     * @param {number} id - ID công ty
     * @returns {Promise<Object>} Kết quả xóa
     */
    async deleteCompany(id) {
        try {
            if (!id || id < 1) {
                throw new Error('ID công ty không hợp lệ')
            }

            const response = await axios.delete(`/company/${id}`)
            return response.data
        } catch (error) {
            console.error('CompanyManagementService.deleteCompany error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Lấy thông tin chi tiết công ty theo ID
     * @param {number} id - ID công ty
     * @returns {Promise<Object>} Thông tin công ty
     */
    async getCompanyById(id) {
        try {
            if (!id || id < 1) {
                throw new Error('ID công ty không hợp lệ')
            }

            const response = await axios.get(`/company/${id}`)
            return response.data
        } catch (error) {
            console.error('CompanyManagementService.getCompanyById error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Lấy danh sách công ty cho dropdown
     * @returns {Promise<Object>} Danh sách công ty
     */
    async getCompaniesForDropdown() {
        try {
            const response = await axios.get('/company/dropdown')
            return response.data
        } catch (error) {
            console.error('CompanyManagementService.getCompaniesForDropdown error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    /**
     * Validate phone format (Vietnamese phone number)
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    isValidPhone(phone) {
        // Vietnamese phone number patterns
        const phoneRegex = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/
        return phoneRegex.test(phone.replace(/[\s\-\.]/g, ''))
    }

    /**
     * Handle API errors and format them consistently
     * @param {Error} error - Error object from axios
     * @returns {Error} Formatted error
     */
    handleApiError(error) {
        if (error.message && !error.response) {
            // Client-side validation error
            return new Error(error.message)
        }

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 400:
                    return new Error(data.message || 'Dữ liệu không hợp lệ')
                case 401:
                    return new Error('Bạn cần đăng nhập để thực hiện chức năng này')
                case 403:
                    return new Error('Bạn không có quyền thực hiện chức năng này')
                case 404:
                    return new Error('Không tìm thấy công ty')
                case 409:
                    return new Error('Mã công ty đã tồn tại')
                case 422:
                    return new Error(data.message || 'Dữ liệu không hợp lệ')
                case 500:
                    return new Error('Lỗi hệ thống, vui lòng thử lại sau')
                default:
                    return new Error(data.message || 'Có lỗi xảy ra')
            }
        }

        return new Error('Không thể kết nối đến server')
    }
}

export default new CompanyService()
