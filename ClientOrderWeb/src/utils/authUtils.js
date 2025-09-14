/**
 * Authentication utilities
 * Xử lý việc reset authentication
 */

/**
 * Reset authentication data
 */
export function resetAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('deviceCode')
    console.log('Authentication data cleared')
}

/**
 * Reset authentication data và redirect về login
 */
export function resetAllDataAndRedirect() {
    resetAuthData()
    
    // Redirect về login với full page refresh
    window.location.href = '/login'
}

/**
 * Check nếu user đã authenticated
 */
export function isAuthenticated() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    return !!(token && user)
}
