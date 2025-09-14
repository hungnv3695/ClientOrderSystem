import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig.js'
import { resetAllDataAndRedirect } from '../utils/authUtils.js'

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor để xử lý lỗi authentication và authorization
instance.interceptors.response.use(
    response => response,
    error => {
        // Xử lý lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Authentication/Authorization failed, redirecting to login...')
            // Reset toàn bộ localStorage và redirect về login
            resetAllDataAndRedirect()
        }
        
        return Promise.reject(error)
    }
)

export default instance
