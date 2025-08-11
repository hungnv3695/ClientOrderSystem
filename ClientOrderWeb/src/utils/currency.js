// src/utils/currency.js
// Các hàm định dạng tiền tệ cho ứng dụng

/**
 * Định dạng số tiền theo VND, mặc định không có phần thập phân.
 * @param {number|string} value - Số tiền cần định dạng
 * @param {Intl.NumberFormatOptions} [options] - Tùy chọn bổ sung cho Intl.NumberFormat
 * @returns {string}
 */
export const formatCurrencyVND = (value, options = {}) => {
    const amount = Number(value ?? 0) || 0
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
        ...options,
    })
    return formatter.format(amount)
}

export default {
    formatCurrencyVND,
    formatVNDNoSymbol,
}
