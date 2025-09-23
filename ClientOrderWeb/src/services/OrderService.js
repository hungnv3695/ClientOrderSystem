/**
 * OrderService.js - Refactored to use API constants and helpers
 * Tập trung các function liên quan đến orders, menus, và receipts
 */

import { ordersApi, menusApi, receiptsApi } from '../constants/apiHelpers'

/**
 * Lấy menu theo ID
 * @param {number} menuId - ID của menu (default: 1)
 * @returns {Array} Danh sách món ăn hoặc mảng rỗng nếu lỗi
 */
export async function fetchMenu(menuId = 1) {
    try {
        const response = await menusApi.getById(menuId)
        // Trả về mảng menu hoặc [] nếu lỗi
        if (response?.success === true) {
            return response?.data?.food || []
        }
        return []
    } catch (error) {
        console.error('Failed to fetch menu:', error)
        return []
    }
}

/**
 * Tạo đơn hàng mới
 * @param {Object} orderItems - Dữ liệu đơn hàng
 * @param {string} orderItems.shopCode - Mã cửa hàng
 * @param {string} orderItems.deviceCode - Mã thiết bị
 * @param {string} orderItems.note - Ghi chú đơn hàng
 * @param {Array} orderItems.items - Danh sách món ăn
 * @returns {Object} Thông tin đơn hàng đã tạo
 * @throws {Error} Nếu tạo đơn hàng thất bại
 */
export async function submitOrder(orderItems) {
    try {
        const response = await ordersApi.create(orderItems)
        
        // Trả về kết quả thành công hay thất bại
        if (response?.success === true) {
            return response?.data
        }
        throw new Error(response?.message || 'Failed to submit order')
    } catch (error) {
        console.error('Failed to submit order:', error)
        throw error
    }
}

/**
 * Cập nhật chi tiết đơn hàng hiện tại
 * @param {string} orderId - ID đơn hàng cần cập nhật
 * @param {Object} payload - Dữ liệu cập nhật
 * @param {string} payload.note - Ghi chú đơn hàng (optional)
 * @param {Array} payload.items - Danh sách món ăn mới (optional)
 * @returns {Object} Thông tin đơn hàng đã cập nhật
 * @throws {Error} Nếu cập nhật thất bại hoặc thiếu orderId
 */
export async function updateExistingOrder(orderId, payload) {
    if (!orderId) {
        throw new Error('orderId is required')
    }
    
    try {
        const response = await ordersApi.updateDetails(orderId, payload)
        
        if (response?.success === true) {
            return response.data
        }
        throw new Error(response?.message || 'Failed to update order')
    } catch (error) {
        console.error('Failed to update order:', error)
        throw error
    }
}

/**
 * Kiểm tra trạng thái thanh toán của đơn hàng
 * @param {string} orderId - ID đơn hàng cần kiểm tra
 * @returns {boolean} True nếu đã thanh toán, False nếu chưa
 * @throws {Error} Nếu kiểm tra thất bại hoặc thiếu orderId
 */
export async function getPaymentStatus(orderId) {
    if (!orderId) {
        throw new Error('orderId is required')
    }
    
    try {
        const response = await ordersApi.getPaymentStatus(orderId)
        
        if (response?.success === true) {
            return !!response.data?.paid
        }
        throw new Error(response?.message || 'Failed to get payment status')
    } catch (error) {
        console.error('Failed to get payment status:', error)
        throw error
    }
}

/**
 * Tìm kiếm đơn hàng (dành cho manager)
 * @param {Object} query - Tham số tìm kiếm
 * @param {number} query.page - Số trang
 * @param {number} query.limit - Số item per page
 * @param {string} query.search - Từ khóa tìm kiếm
 * @param {string} query.status - Trạng thái đơn hàng
 * @returns {Object} { rows: Array, count: number }
 */
export async function searchOrders(query) {
    try {
        const response = await ordersApi.search(query)
        
        if (response?.success === true) {
            return {
                rows: response.data?.rows || [],
                count: response.data?.count || 0,
            }
        }
        return { rows: [], count: 0 }
    } catch (error) {
        console.error('Failed to search orders:', error)
        return { rows: [], count: 0 }
    }
}

/**
 * Tạo receipt (hóa đơn) cho đơn hàng
 * @param {string} orderId - ID đơn hàng cần tạo receipt
 * @param {Object} data - Dữ liệu bổ sung cho receipt
 * @param {string} data.paymentMethod - Phương thức thanh toán (default: 'bank_transfer')
 * @returns {Object} Thông tin receipt đã tạo { receipt, items }
 * @throws {Error} Nếu tạo receipt thất bại hoặc thiếu orderId
 */
export async function createReceipt(orderId, data = {}) {
    if (!orderId) {
        throw new Error('orderId is required')
    }
    
    try {
        const response = await receiptsApi.create(orderId, data)
        
        if (response?.success === true) {
            return response.data // { receipt, items }
        }
        throw new Error(response?.message || 'Failed to create receipt')
    } catch (error) {
        console.error('Failed to create receipt:', error)
        throw error
    }
}