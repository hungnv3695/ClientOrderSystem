import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig.js'

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Thêm interceptor nếu cần (ví dụ: token, xử lý lỗi...)
// instance.interceptors.request.use(config => { ... })
// instance.interceptors.response.use(response => { ... })

export default instance
