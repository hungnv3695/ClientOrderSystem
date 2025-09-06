/**
 * API Endpoints Constants
 * Tập trung tất cả các URL endpoint được sử dụng trong frontend
 * 
 * Usage:
 * import { API_ENDPOINTS } from '@/constants/apiEndpoints'
 * const url = API_ENDPOINTS.ORDERS.GET_NUMBERS
 */

export const API_ENDPOINTS = {
    // ===== AUTHENTICATION =====
    AUTH: {
        LOGIN: 'auth/login',
    },

    // ===== ORDERS =====
    ORDERS: {
        CREATE: 'orders',
        GET_NUMBERS: 'orders/numbers',
        UPDATE_DETAILS: (orderId) => `orders/${orderId}/details`,
        UPDATE_STATUS: (orderId) => `orders/${orderId}/status`,
        GET_PAYMENT_STATUS: (orderId) => `orders/${orderId}/payment-status`,
        SEARCH: 'orders/search',
    },

    // ===== MENUS =====
    MENUS: {
        GET_BY_ID: 'menus',
    },

    // ===== RECEIPTS =====
    RECEIPTS: {
        CREATE: (orderId) => `receipts/${orderId}`,
    },

    // ===== COMPANY MANAGEMENT =====
    COMPANY: {
        SEARCH: '/company/search',
        CREATE: '/company',
        UPDATE: (id) => `/company/${id}`,
        UPDATE_STATUS: (id) => `/company/${id}/status`,
        DELETE: (id) => `/company/${id}`,
        GET_BY_ID: (id) => `/company/${id}`,
        GET_DROPDOWN: '/company/dropdown',
    },

    // ===== SHOP MANAGEMENT =====
    SHOP: {
        SEARCH: '/shop/search',
        CREATE: '/shop',
        UPDATE: (id) => `/shop/${id}`,
        UPDATE_STATUS: (id) => `/shop/${id}/status`,
        DELETE: (id) => `/shop/${id}`,
        GET_BY_ID: (id) => `/shop/${id}`,
        GET_BY_COMPANY: (companyId) => `/shop/company/${companyId}`,
        GET_DROPDOWN: '/shop/dropdown',
    },
}

// ===== API METHODS MAPPING =====
export const API_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
}

// ===== ENDPOINT DETAILS WITH METHODS =====
export const API_ENDPOINTS_WITH_METHODS = {
    // Authentication
    LOGIN: { url: API_ENDPOINTS.AUTH.LOGIN, method: API_METHODS.POST },

    // Orders
    GET_ORDERS_NUMBERS: { url: API_ENDPOINTS.ORDERS.GET_NUMBERS, method: API_METHODS.GET },
    CREATE_ORDER: { url: API_ENDPOINTS.ORDERS.CREATE, method: API_METHODS.POST },
    UPDATE_ORDER_DETAILS: { url: API_ENDPOINTS.ORDERS.UPDATE_DETAILS, method: API_METHODS.PATCH },
    UPDATE_ORDER_STATUS: { url: API_ENDPOINTS.ORDERS.UPDATE_STATUS, method: API_METHODS.PATCH },
    GET_PAYMENT_STATUS: { url: API_ENDPOINTS.ORDERS.GET_PAYMENT_STATUS, method: API_METHODS.GET },
    SEARCH_ORDERS: { url: API_ENDPOINTS.ORDERS.SEARCH, method: API_METHODS.GET },

    // Menus
    GET_MENU: { url: API_ENDPOINTS.MENUS.GET_BY_ID, method: API_METHODS.GET },

    // Receipts
    CREATE_RECEIPT: { url: API_ENDPOINTS.RECEIPTS.CREATE, method: API_METHODS.POST },

    // Company Management
    SEARCH_COMPANIES: { url: API_ENDPOINTS.COMPANY.SEARCH, method: API_METHODS.GET },
    CREATE_COMPANY: { url: API_ENDPOINTS.COMPANY.CREATE, method: API_METHODS.POST },
    UPDATE_COMPANY: { url: API_ENDPOINTS.COMPANY.UPDATE, method: API_METHODS.PUT },
    UPDATE_COMPANY_STATUS: { url: API_ENDPOINTS.COMPANY.UPDATE_STATUS, method: API_METHODS.PATCH },
    DELETE_COMPANY: { url: API_ENDPOINTS.COMPANY.DELETE, method: API_METHODS.DELETE },
    GET_COMPANY: { url: API_ENDPOINTS.COMPANY.GET_BY_ID, method: API_METHODS.GET },
    GET_COMPANIES_DROPDOWN: { url: API_ENDPOINTS.COMPANY.GET_DROPDOWN, method: API_METHODS.GET },

    // Shop Management
    SEARCH_SHOPS: { url: API_ENDPOINTS.SHOP.SEARCH, method: API_METHODS.GET },
    CREATE_SHOP: { url: API_ENDPOINTS.SHOP.CREATE, method: API_METHODS.POST },
    UPDATE_SHOP: { url: API_ENDPOINTS.SHOP.UPDATE, method: API_METHODS.PUT },
    UPDATE_SHOP_STATUS: { url: API_ENDPOINTS.SHOP.UPDATE_STATUS, method: API_METHODS.PATCH },
    DELETE_SHOP: { url: API_ENDPOINTS.SHOP.DELETE, method: API_METHODS.DELETE },
    GET_SHOP: { url: API_ENDPOINTS.SHOP.GET_BY_ID, method: API_METHODS.GET },
    GET_SHOPS_BY_COMPANY: { url: API_ENDPOINTS.SHOP.GET_BY_COMPANY, method: API_METHODS.GET },
    GET_SHOPS_DROPDOWN: { url: API_ENDPOINTS.SHOP.GET_DROPDOWN, method: API_METHODS.GET },
}

// ===== HELPER FUNCTIONS =====

/**
 * Tạo URL với tham số động
 * @param {string} template - URL template với placeholder
 * @param {Object} params - Object chứa các tham số
 * @returns {string} URL đã được thay thế tham số
 * 
 * @example
 * buildUrl('/orders/{orderId}/status', { orderId: 123 })
 * // Returns: '/orders/123/status'
 */
export function buildUrl(template, params = {}) {
    let url = template
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key])
    })
    return url
}

/**
 * Lấy endpoint với method
 * @param {string} endpointKey - Key của endpoint trong API_ENDPOINTS_WITH_METHODS
 * @returns {Object} Object chứa url và method
 */
export function getEndpoint(endpointKey) {
    return API_ENDPOINTS_WITH_METHODS[endpointKey]
}

/**
 * Validate URL có hợp lệ không
 * @param {string} url - URL cần validate
 * @returns {boolean} True nếu URL hợp lệ
 */
export function isValidUrl(url) {
    return typeof url === 'string' && url.length > 0 && !url.includes('undefined')
}
