/**
 * API Helper Functions
 * Các hàm trợ giúp để sử dụng với axios và API endpoints
 */

import axios from '../services/axios'
import { API_ENDPOINTS, API_METHODS, buildUrl, isValidUrl } from './apiEndpoints'

/**
 * Hàm gọi API chung
 * @param {string} method - Phương thức HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param {string} url - URL endpoint của API
 * @param {Object} data - Dữ liệu request (cho POST, PUT, PATCH)
 * @param {Object} config - Cấu hình axios bổ sung
 * @returns {Promise} Axios response
 */
export async function apiCall(method, url, data = null, config = {}) {
    if (!isValidUrl(url)) {
        throw new Error(`URL không hợp lệ: ${url}`)
    }

    const axiosConfig = {
        method: method.toLowerCase(),
        url,
        ...config
    }

    if (data && (method === API_METHODS.POST || 
        method === API_METHODS.PUT || 
        method === API_METHODS.PATCH)) {
        axiosConfig.data = data
    }

    if (method === API_METHODS.GET && data) {
        axiosConfig.params = data
    }

    try {
        const response = await axios(axiosConfig)
        return response
    } catch (error) {
        console.error(`Gọi API thất bại: ${method} ${url}`, error)
        throw error
    }
}

// ===== CÁC HÀM WRAPPER TIỆN LỢI =====

/**
 * Wrapper cho GET request
 * @param {string} url - API endpoint
 * @param {Object} params - Tham số query
 * @param {Object} config - Cấu hình bổ sung
 * @returns {Promise} Dữ liệu response
 */
export async function apiGet(url, params = {}, config = {}) {
    const response = await apiCall(API_METHODS.GET, url, params, config)
    return response.data
}

/**
 * Wrapper cho POST request
 * @param {string} url - API endpoint
 * @param {Object} data - Dữ liệu request payload
 * @param {Object} config - Cấu hình bổ sung
 * @returns {Promise} Dữ liệu response
 */
export async function apiPost(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.POST, url, data, config)
    return response.data
}

/**
 * Wrapper cho PUT request
 * @param {string} url - API endpoint
 * @param {Object} data - Dữ liệu request payload
 * @param {Object} config - Cấu hình bổ sung
 * @returns {Promise} Dữ liệu response
 */
export async function apiPut(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.PUT, url, data, config)
    return response.data
}

/**
 * Wrapper cho PATCH request
 * @param {string} url - API endpoint
 * @param {Object} data - Dữ liệu request payload
 * @param {Object} config - Cấu hình bổ sung
 * @returns {Promise} Dữ liệu response
 */
export async function apiPatch(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.PATCH, url, data, config)
    return response.data
}

/**
 * Wrapper cho DELETE request
 * @param {string} url - API endpoint
 * @param {Object} config - Cấu hình bổ sung
 * @returns {Promise} Dữ liệu response
 */
export async function apiDelete(url, config = {}) {
    const response = await apiCall(API_METHODS.DELETE, url, null, config)
    return response.data
}

// ===== CÁC HÀM API CỤ THỂ =====

// Đơn hàng (Orders)
export const ordersApi = {
    getNumbers: () => apiGet(API_ENDPOINTS.ORDERS.GET_NUMBERS),
    create: (data) => apiPost(API_ENDPOINTS.ORDERS.CREATE, data),
    updateDetails: (orderId, data) => apiPatch(API_ENDPOINTS.ORDERS.UPDATE_DETAILS(orderId), data),
    updateStatus: (orderId, status) => {
        const payload = { status }
        return apiPatch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), payload)
    },
    getPaymentStatus: (orderId) => apiGet(API_ENDPOINTS.ORDERS.GET_PAYMENT_STATUS(orderId)),
    search: (params) => apiGet(API_ENDPOINTS.ORDERS.SEARCH, params),
}

// Thực đơn (Menus)
export const menusApi = {
    getById: (id) => apiGet(API_ENDPOINTS.MENUS.GET_BY_ID, { id }),
}

// Biên lai (Receipts)
export const receiptsApi = {
    create: (orderId, data) => apiPost(API_ENDPOINTS.RECEIPTS.CREATE(orderId), data),
}

// Xác thực (Auth)
export const authApi = {
    login: (username, password, deviceCode = null, shopCode = null) => {
        const requestData = { username, password }
        if (deviceCode) {
            requestData.deviceCode = deviceCode
        }
        if (shopCode) {
            requestData.shopCode = shopCode
        }
        return apiPost(API_ENDPOINTS.AUTH.LOGIN, requestData)
    },
}
