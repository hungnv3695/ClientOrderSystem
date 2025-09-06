// services/manager/ShopService.js
import axios from '../axios'

class ShopService {
    /**
     * Tìm kiếm shop với phân trang
     * @param {Object} params - Tham số tìm kiếm
     * @param {string} params.code - Mã shop
     * @param {string} params.name - Tên shop
     * @param {string} params.address - Địa chỉ
     * @param {string} params.phone - Số điện thoại
     * @param {string} params.email - Email
     * @param {number} params.companyId - ID công ty
     * @param {string} params.createdAtFrom - Từ ngày tạo (YYYY-MM-DD)
     * @param {string} params.createdAtTo - Đến ngày tạo (YYYY-MM-DD)
     * @param {number} params.page - Trang hiện tại
     * @param {number} params.limit - Số bản ghi trên trang
     * @param {string} params.sortBy - Cột sắp xếp
     * @param {string} params.sortOrder - Thứ tự sắp xếp (ASC/DESC)
     * @returns {Promise<Object>} Kết quả tìm kiếm
     */
    async searchShops(params = {}) {
        try {
            const response = await axios.get('/shop/search', {
                params: params
            })
            return response.data
        } catch (error) {
            console.error('ShopService.searchShops error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Tạo shop mới
     * @param {Object} shopData - Dữ liệu shop
     * @param {string} shopData.code - Mã shop (bắt buộc)
     * @param {string} shopData.name - Tên shop (bắt buộc)
     * @param {string} shopData.address - Địa chỉ
     * @param {string} shopData.phone - Số điện thoại
     * @param {string} shopData.email - Email
     * @param {number} shopData.companyId - ID công ty (bắt buộc)
     * @param {string} shopData.description - Mô tả
     * @returns {Promise<Object>} Thông tin shop đã tạo
     */
    async createShop(shopData) {
        try {
            // Validate required fields
            if (!shopData.code || !shopData.code.trim()) {
                throw new Error('Mã shop là bắt buộc')
            }
            if (!shopData.name || !shopData.name.trim()) {
                throw new Error('Tên shop là bắt buộc')
            }
            if (!shopData.companyId || shopData.companyId < 1) {
                throw new Error('Công ty là bắt buộc')
            }

            // Sanitize data
            const sanitizedData = {
                code: shopData.code.trim(),
                name: shopData.name.trim(),
                address: shopData.address?.trim() || '',
                phone: shopData.phone?.trim() || '',
                email: shopData.email?.trim() || '',
                companyId: shopData.companyId,
                description: shopData.description?.trim() || ''
            }

            // Validate email format if provided
            if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
                throw new Error('Định dạng email không hợp lệ')
            }

            const response = await axios.post('/shop', sanitizedData)
            return response.data
        } catch (error) {
            console.error('ShopService.createShop error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Cập nhật thông tin shop
     * @param {number} id - ID shop
     * @param {Object} shopData - Dữ liệu cập nhật
     * @param {string} shopData.code - Mã shop (bắt buộc)
     * @param {string} shopData.name - Tên shop (bắt buộc)
     * @param {string} shopData.address - Địa chỉ
     * @param {string} shopData.phone - Số điện thoại
     * @param {string} shopData.email - Email
     * @param {number} shopData.companyId - ID công ty (bắt buộc)
     * @param {string} shopData.description - Mô tả
     * @param {string} shopData.status - Trạng thái (active/inactive)
     * @returns {Promise<Object>} Thông tin shop đã cập nhật
     */
    async updateShop(id, shopData) {
        try {
            if (!id || id < 1) {
                throw new Error('ID shop không hợp lệ')
            }

            // Validate required fields
            if (!shopData.code || !shopData.code.trim()) {
                throw new Error('Mã shop là bắt buộc')
            }
            if (!shopData.name || !shopData.name.trim()) {
                throw new Error('Tên shop là bắt buộc')
            }
            if (!shopData.companyId || shopData.companyId < 1) {
                throw new Error('Công ty là bắt buộc')
            }

            // Sanitize data
            const sanitizedData = {
                code: shopData.code.trim(),
                name: shopData.name.trim(),
                address: shopData.address?.trim() || '',
                phone: shopData.phone?.trim() || '',
                email: shopData.email?.trim() || '',
                companyId: shopData.companyId,
                description: shopData.description?.trim() || ''
            }

            // Add status if provided
            if (shopData.status) {
                if (!['active', 'inactive'].includes(shopData.status)) {
                    throw new Error('Trạng thái phải là "active" hoặc "inactive"')
                }
                sanitizedData.status = shopData.status
            }

            // Validate email format if provided
            if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
                throw new Error('Định dạng email không hợp lệ')
            }

            const response = await axios.put(`/shop/${id}`, sanitizedData)
            return response.data
        } catch (error) {
            console.error('ShopService.updateShop error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Cập nhật trạng thái shop
     * @param {number} id - ID shop
     * @param {string} status - Trạng thái mới ('active' hoặc 'inactive')
     * @returns {Promise<Object>} Kết quả cập nhật
     */
    async updateShopStatus(id, status) {
        try {
            if (!id || id < 1) {
                throw new Error('ID shop không hợp lệ')
            }

            if (!['active', 'inactive'].includes(status)) {
                throw new Error('Trạng thái phải là "active" hoặc "inactive"')
            }

            const response = await axios.patch(`/shop/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error('ShopService.updateShopStatus error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Xóa shop
     * @param {number} id - ID shop
     * @returns {Promise<Object>} Kết quả xóa
     */
    async deleteShop(id) {
        try {
            if (!id || id < 1) {
                throw new Error('ID shop không hợp lệ')
            }

            const response = await axios.delete(`/shop/${id}`)
            return response.data
        } catch (error) {
            console.error('ShopService.deleteShop error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Lấy thông tin chi tiết shop theo ID
     * @param {number} id - ID shop
     * @returns {Promise<Object>} Thông tin shop
     */
    async getShopById(id) {
        try {
            if (!id || id < 1) {
                throw new Error('ID shop không hợp lệ')
            }

            const response = await axios.get(`/shop/${id}`)
            return response.data
        } catch (error) {
            console.error('ShopService.getShopById error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Lấy danh sách shop theo công ty
     * @param {number} companyId - ID công ty
     * @returns {Promise<Object>} Danh sách shop
     */
    async getShopsByCompany(companyId) {
        try {
            if (!companyId || companyId < 1) {
                throw new Error('ID công ty không hợp lệ')
            }

            const response = await axios.get(`/shop/company/${companyId}`)
            return response.data
        } catch (error) {
            console.error('ShopService.getShopsByCompany error:', error)
            throw this.handleApiError(error)
        }
    }

    /**
     * Lấy danh sách shop cho dropdown
     * @returns {Promise<Object>} Danh sách shop
     */
    async getShopsForDropdown() {
        try {
            const response = await axios.get('/shop/dropdown')
            return response.data
        } catch (error) {
            console.error('ShopService.getShopsForDropdown error:', error)
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
                    return new Error('Không tìm thấy shop')
                case 409:
                    return new Error('Mã shop đã tồn tại')
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

export default new ShopService()