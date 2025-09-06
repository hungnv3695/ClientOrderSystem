/**
 * LocalPrintService.js - Refactored for better maintainability
 * Gọi đến ClientOrderPrint service chạy local thay thế Epson SDK
 * 
 * Service này giao tiếp với local print service qua HTTP calls
 * Không sử dụng API backend mà gọi trực tiếp đến print service
 */

import { PRINT_SERVICE_URL } from '../config/appConfig.js'

// ===== CONSTANTS =====

/** Timeout mặc định cho print operations - tăng lên cho máy in thật */
const DEFAULT_TIMEOUT = 35000

/** Print service endpoints */
const PRINT_ENDPOINTS = {
    RECEIPT: '/api/print/receipt'
}

// ===== HELPER FUNCTIONS =====

/**
 * Tạo URL với query parameters
 * @param {string} endpoint - Endpoint path
 * @param {Object} params - Query parameters
 * @returns {string} Complete URL with query string
 */
function buildPrintServiceUrl(endpoint, params = {}) {
    const url = new URL(endpoint, PRINT_SERVICE_URL)
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
            url.searchParams.append(key, params[key])
        }
    })
    return url.toString()
}

/**
 * Handle fetch response và parse JSON
 * @param {Response} response - Fetch response
 * @returns {Object} Parsed JSON response
 * @throws {Error} Nếu response không ok hoặc parse lỗi
 */
async function handleFetchResponse(response) {
    let result
    try {
        result = await response.json()
    } catch (error) {
        throw new Error('Không thể parse response từ print service')
    }

    if (!response.ok) {
        throw new Error(result.message || `HTTP Error: ${response.status}`)
    }

    return result
}

/**
 * Tạo fetch request với timeout và error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Response data
 */
async function safeFetch(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: AbortSignal.timeout(timeout)
        })

        return await handleFetchResponse(response)
    } catch (error) {
        console.error('Fetch error:', error)
        
        if (error.name === 'AbortError') {
            throw new Error('Timeout khi gọi print service')
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến print service. Vui lòng kiểm tra ClientOrderPrint service đang chạy.')
        } else {
            throw error
        }
    }
}

// ===== MAIN FUNCTIONS =====

/**
 * Kiểm tra print service có hoạt động không
 * @returns {Promise<boolean>} True nếu service hoạt động
 */
export async function checkPrintServiceHealth() {
    try {
        // Health endpoint nằm ở root, không phải /api/print/health
        const baseUrl = PRINT_SERVICE_URL.replace('/api/print', ''); // Remove /api/print suffix
        const response = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        })
        
        if (response.ok) {
            const result = await response.json()
            console.log('Print service health:', result)
            return true
        }
        return false
    } catch (error) {
        console.error('Print service health check failed:', error)
        return false
    }
}

/**
 * In hóa đơn thông qua service local (thay thế cho Epson SDK)
 * @param {string} printerIp - IP address của máy in
 * @param {string} port - Port của máy in (optional)
 * @param {string} deviceId - Device ID (optional, default: 'local_printer')
 * @param {Object} receiptData - Dữ liệu hóa đơn cần in
 * @returns {Promise<Object>} { success: boolean, message: string, data?: any }
 */
export async function printReceipt(printerIp, port = '', deviceId = 'local_printer', receiptData) {
    try {
        console.log('Printing receipt via local service:', { printerIp, deviceId })

        // Check print service health first
        const serviceHealthy = await checkPrintServiceHealth()
        if (!serviceHealthy) {
            throw new Error('Print service không hoạt động. Vui lòng kiểm tra ClientOrderPrint service.')
        }

        // Validate input data
        if (!printerIp) {
            throw new Error('Printer IP is required')
        }
        if (!receiptData) {
            throw new Error('Receipt data is required')
        }

        const requestBody = {
            printerIp,
            ...(port && { port }),
            deviceId,
            receiptData
        }

        const url = buildPrintServiceUrl(PRINT_ENDPOINTS.RECEIPT)
        const result = await safeFetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody)
        })

        console.log('Print successful:', result)
        
        return {
            success: true,
            message: result.message,
            data: result.data
        }

    } catch (error) {
        console.error('Print receipt error:', error)
        throw new Error(error.message || 'Lỗi không xác định khi in hóa đơn')
    }
}

/**
 * Helper function để tạo receipt data từ API response
 * @param {Object} receiptResponse - Response từ API createReceipt
 * @returns {Object} Formatted receipt data cho print service
 * @throws {Error} Nếu receipt data không hợp lệ
 */
export function createReceiptData(receiptResponse) {
    // Validate input
    if (!receiptResponse || !receiptResponse.receiptId) {
        throw new Error('Receipt data không hợp lệ - thiếu receiptId')
    }

    const {
        receiptId,
        receiptNumber,
        totalAmount,
        finalAmount,
        discountAmount = 0,
        paymentMethod,
        paidAt,
        created_at,
        items = []
    } = receiptResponse

    // Validate required fields
    if (!totalAmount && !finalAmount) {
        throw new Error('Receipt data không hợp lệ - thiếu amount')
    }

    const formattedData = {
        receiptNumber: receiptNumber || `HD${receiptId}`,
        items: Array.isArray(items) ? items : [],
        totalAmount: parseFloat(totalAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        finalAmount: parseFloat(finalAmount) || parseFloat(totalAmount) || 0,
        paymentMethod: paymentMethod || 'bank_transfer',
        paidAt: paidAt || created_at || new Date().toISOString()
    }

    console.log('Created receipt data:', formattedData)
    return formattedData
}

/**
 * Wrapper function giữ nguyên interface như PrinterService.js cũ
 * Để dễ dàng thay thế trong code hiện tại (Legacy support)
 * @param {string} ip - Printer IP
 * @param {string} port - Printer port
 * @param {string} deviceId - Device ID
 * @param {Object} receipt - Receipt data
 * @returns {Promise<Object>} Print result
 */
export function printReceiptLegacy(ip, port, deviceId, receipt) {
    try {
        // Convert receipt format nếu cần
        const receiptData = createReceiptData(receipt)
        
        return printReceipt(ip, port, deviceId, receiptData)
    } catch (error) {
        console.error('Print receipt legacy error:', error)
        return Promise.reject(error)
    }
}

// ===== DEFAULT EXPORT =====
export default {
    checkPrintServiceHealth,
    printReceipt,
    printReceiptLegacy,
    createReceiptData
}
