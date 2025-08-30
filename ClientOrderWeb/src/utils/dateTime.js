/**
 * Utility functions for date/time formatting
 */

/**
 * Format datetime to Vietnamese locale format
 * @param {string|Date} dateString - ISO date string or Date object
 * @param {string} format - Format type: 'datetime', 'date', 'time'
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString, format = 'datetime') => {
    if (!dateString) return ''

    try {
        const date = new Date(dateString)

        // Check if date is valid
        if (isNaN(date.getTime())) return ''

        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        switch (format) {
            case 'date':
                return `${day}/${month}/${year}`
            case 'time':
                return `${hours}:${minutes}:${seconds}`
            case 'datetime':
            default:
                return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`
        }
    } catch (error) {
        console.error('Error formatting date:', error)
        return ''
    }
}

/**
 * Format date to dd/MM/yyyy format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    return formatDateTime(dateString, 'date')
}

/**
 * Format time to HH:mm:ss format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
    return formatDateTime(dateString, 'time')
}

/**
 * Get current datetime in ISO format
 * @returns {string} Current datetime in ISO format
 */
export const getCurrentDateTime = () => {
    return new Date().toISOString()
}

/**
 * Check if date is today
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
    if (!dateString) return false

    try {
        const date = new Date(dateString)
        const today = new Date()

        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    } catch (error) {
        return false
    }
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return ''

    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        if (diffDays === 1) return 'Hôm qua'
        if (diffDays < 7) return `${diffDays} ngày trước`

        return formatDateTime(dateString, 'date')
    } catch (error) {
        return ''
    }
}
