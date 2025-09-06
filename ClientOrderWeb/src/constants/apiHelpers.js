/**
 * API Helper Functions
 * Các helper functions để sử dụng với axios và API endpoints
 */

import axios from '../services/axios'
import { API_ENDPOINTS, API_METHODS, buildUrl, isValidUrl } from './apiEndpoints'

/**
 * Generic API call function
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request payload (for POST, PUT, PATCH)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Axios response
 */
export async function apiCall(method, url, data = null, config = {}) {
    if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`)
    }

    const axiosConfig = {
        method: method.toLowerCase(),
        url,
        ...config
    }

    if (data && (method === API_METHODS.POST || method === API_METHODS.PUT || method === API_METHODS.PATCH)) {
        axiosConfig.data = data
    }

    if (method === API_METHODS.GET && data) {
        axiosConfig.params = data
    }

    try {
        const response = await axios(axiosConfig)
        return response
    } catch (error) {
        console.error(`API call failed: ${method} ${url}`, error)
        throw error
    }
}

// ===== CONVENIENT WRAPPER FUNCTIONS =====

/**
 * GET request wrapper
 * @param {string} url - API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} config - Additional config
 * @returns {Promise} Response data
 */
export async function apiGet(url, params = {}, config = {}) {
    const response = await apiCall(API_METHODS.GET, url, params, config)
    return response.data
}

/**
 * POST request wrapper
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Additional config
 * @returns {Promise} Response data
 */
export async function apiPost(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.POST, url, data, config)
    return response.data
}

/**
 * PUT request wrapper
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Additional config
 * @returns {Promise} Response data
 */
export async function apiPut(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.PUT, url, data, config)
    return response.data
}

/**
 * PATCH request wrapper
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Additional config
 * @returns {Promise} Response data
 */
export async function apiPatch(url, data = {}, config = {}) {
    const response = await apiCall(API_METHODS.PATCH, url, data, config)
    return response.data
}

/**
 * DELETE request wrapper
 * @param {string} url - API endpoint
 * @param {Object} config - Additional config
 * @returns {Promise} Response data
 */
export async function apiDelete(url, config = {}) {
    const response = await apiCall(API_METHODS.DELETE, url, null, config)
    return response.data
}

// ===== SPECIFIC API FUNCTIONS =====

// Orders
export const ordersApi = {
    getNumbers: () => apiGet(API_ENDPOINTS.ORDERS.GET_NUMBERS),
    create: (data) => apiPost(API_ENDPOINTS.ORDERS.CREATE, data),
    updateDetails: (orderId, data) => apiPatch(API_ENDPOINTS.ORDERS.UPDATE_DETAILS(orderId), data),
    updateStatus: (orderId, status) => apiPatch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status }),
    getPaymentStatus: (orderId) => apiGet(API_ENDPOINTS.ORDERS.GET_PAYMENT_STATUS(orderId)),
    search: (params) => apiGet(API_ENDPOINTS.ORDERS.SEARCH, params),
}

// Menus
export const menusApi = {
    getById: (id) => apiGet(API_ENDPOINTS.MENUS.GET_BY_ID, { id }),
}

// Receipts
export const receiptsApi = {
    create: (orderId, data) => apiPost(API_ENDPOINTS.RECEIPTS.CREATE(orderId), data),
}

// Auth
export const authApi = {
    login: (username, password) => apiPost(API_ENDPOINTS.AUTH.LOGIN, { username, password }),
}

// Company
export const companyApi = {
    search: (params) => apiGet(API_ENDPOINTS.COMPANY.SEARCH, params),
    create: (data) => apiPost(API_ENDPOINTS.COMPANY.CREATE, data),
    update: (id, data) => apiPut(API_ENDPOINTS.COMPANY.UPDATE(id), data),
    updateStatus: (id, status) => apiPatch(API_ENDPOINTS.COMPANY.UPDATE_STATUS(id), { status }),
    delete: (id) => apiDelete(API_ENDPOINTS.COMPANY.DELETE(id)),
    getById: (id) => apiGet(API_ENDPOINTS.COMPANY.GET_BY_ID(id)),
    getDropdown: () => apiGet(API_ENDPOINTS.COMPANY.GET_DROPDOWN),
}

// Shop
export const shopApi = {
    search: (params) => apiGet(API_ENDPOINTS.SHOP.SEARCH, params),
    create: (data) => apiPost(API_ENDPOINTS.SHOP.CREATE, data),
    update: (id, data) => apiPut(API_ENDPOINTS.SHOP.UPDATE(id), data),
    updateStatus: (id, status) => apiPatch(API_ENDPOINTS.SHOP.UPDATE_STATUS(id), { status }),
    delete: (id) => apiDelete(API_ENDPOINTS.SHOP.DELETE(id)),
    getById: (id) => apiGet(API_ENDPOINTS.SHOP.GET_BY_ID(id)),
    getByCompany: (companyId) => apiGet(API_ENDPOINTS.SHOP.GET_BY_COMPANY(companyId)),
    getDropdown: () => apiGet(API_ENDPOINTS.SHOP.GET_DROPDOWN),
}
