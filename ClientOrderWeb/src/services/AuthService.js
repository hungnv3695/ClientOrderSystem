/**
 * AuthService.js - Refactored to use API constants and helpers
 * Quản lý authentication, login, logout và user session
 */

import { authApi } from '../constants/apiHelpers'

/**
 * Đăng nhập người dùng
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Object} Thông tin user đã đăng nhập
 * @throws {Error} Nếu đăng nhập thất bại
 */
export async function login(username, password) {
    try {
        const response = await authApi.login(username, password)

        // Debug log để kiểm tra response
        console.log('Login response:', { success: response?.success, data: response?.data })

        if (response?.success) {
            const { token, user } = response.data

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            
            console.log('Login successful for user:', user?.username)
            return user
        }
        
        throw new Error(response?.message || 'Login failed')
    } catch (error) {
        console.error('Login error:', error)
        throw error
    }
}

/**
 * Đăng xuất người dùng
 * Xóa token và thông tin user khỏi localStorage
 */
export function logout() {
    try {
        const currentUser = getCurrentUser()
        if (currentUser) {
            console.log('Logging out user:', currentUser?.username)
        }
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        console.log('User logged out successfully')
    } catch (error) {
        console.error('Logout error:', error)
        // Vẫn xóa localStorage dù có lỗi
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
}

/**
 * Lấy thông tin user hiện tại từ localStorage
 * @returns {Object|null} Thông tin user hoặc null nếu chưa đăng nhập
 */
export function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            return null
        }
        return JSON.parse(userStr)
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        return null
    }
}

/**
 * Lấy token hiện tại từ localStorage
 * @returns {string|null} Token hoặc null nếu chưa đăng nhập
 */
export function getCurrentToken() {
    try {
        return localStorage.getItem('token')
    } catch (error) {
        console.error('Error getting token from localStorage:', error)
        return null
    }
}

/**
 * Kiểm tra user có đang đăng nhập không
 * @returns {boolean} True nếu đã đăng nhập, False nếu chưa
 */
export function isAuthenticated() {
    const token = getCurrentToken()
    const user = getCurrentUser()
    return !!(token && user)
}

/**
 * Kiểm tra token có hết hạn không (basic check)
 * @returns {boolean} True nếu token có vẻ hợp lệ
 */
export function isTokenValid() {
    const token = getCurrentToken()
    if (!token) {
        return false
    }
    
    try {
        // Basic check - token should be a string with reasonable length
        return typeof token === 'string' && token.length > 10
    } catch (error) {
        console.error('Error validating token:', error)
        return false
    }
}

/**
 * Clear tất cả authentication data (dùng khi có lỗi authentication)
 */
export function clearAuthData() {
    try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.log('Authentication data cleared')
    } catch (error) {
        console.error('Error clearing auth data:', error)
    }
}
