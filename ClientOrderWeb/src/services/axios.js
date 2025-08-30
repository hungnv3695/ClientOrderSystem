import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig.js'

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

// Thêm interceptor nếu cần (ví dụ: xử lý lỗi...)
// instance.interceptors.response.use(response => { ... })

export default instance
