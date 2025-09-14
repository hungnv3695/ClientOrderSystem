/**
 * AuthService.js - Refactored to use API constants and helpers
 * Quản lý authentication, login, logout và user session
 */

import { authApi } from '../constants/apiHelpers'

/**
 * Đăng nhập người dùng
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @param {string} deviceCode - Mã thiết bị (optional)
 * @returns {Object} Thông tin user đã đăng nhập
 * @throws {Error} Nếu đăng nhập thất bại
 */
export async function login(username, password, deviceCode = null) {
    try {
        const requestBody = { username, password }
        if (deviceCode) {
            requestBody.deviceCode = deviceCode
        }
        
        const response = await authApi.login(requestBody.username, requestBody.password, requestBody.deviceCode)

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
 * // UNUSED - Not used in current frontend
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
 * // UNUSED - Not used in current frontend
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
 * Lấy thông tin device hiện tại từ user
 * @returns {Object|null} Thông tin device hiện tại hoặc null nếu không có
 */
export function getCurrentDevice() {
    try {
        const user = getCurrentUser()
        if (!user || !user.currentDevice) {
            return null
        }
        return user.currentDevice
    } catch (error) {
        console.error('Error getting current device info:', error)
        return null
    }
}

/**
 * Lấy thông tin máy in từ user
 * @returns {Object|null} Thông tin máy in hoặc null nếu không có
 */
export function getPrinterDevice() {
    try {
        const user = getCurrentUser()
        if (!user || !user.printerDevice) {
            return null
        }
        return user.printerDevice
    } catch (error) {
        console.error('Error getting printer device info:', error)
        return null
    }
}

/**
 * Lấy config máy in từ device info với fallback
 * @returns {Object|null} Config máy in với ip, port, deviceId
 */
export function getPrinterConfigFromDevice() {
    try {
        const printerDevice = getPrinterDevice()
        if (printerDevice && printerDevice.type === 'PRT' && printerDevice.ip) {
            console.log('Using printer config from device info:', printerDevice)
            return {
                printerIp: printerDevice.ip,
                port: printerDevice.port || '80', // Default HTTP port cho Epson
                deviceId: printerDevice.code,
                name: printerDevice.name,
                brand: printerDevice.brand
            }
        }
        
        console.warn('No valid printer device found in user info, trying fallback config')
        return null
    } catch (error) {
        console.error('Error getting printer config from device:', error)
        return null
    }
}

/**
 * Lấy token hiện tại từ localStorage
 * @returns {string|null} Token hoặc null nếu chưa đăng nhập
 * // UNUSED - Not used in current frontend
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
 * // UNUSED - Not used in current frontend
 */
export function isAuthenticated() {
    const token = getCurrentToken()
    const user = getCurrentUser()
    return !!(token && user)
}

/**
 * Kiểm tra token có hết hạn không (basic check)
 * @returns {boolean} True nếu token có vẻ hợp lệ
 * // UNUSED - Not used in current frontend
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
 * // UNUSED - Not used in current frontend
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
