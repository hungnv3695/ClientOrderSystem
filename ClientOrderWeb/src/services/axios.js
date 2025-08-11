import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://172.18.0.3:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Thêm interceptor nếu cần (ví dụ: token, xử lý lỗi...)
// instance.interceptors.request.use(config => { ... })
// instance.interceptors.response.use(response => { ... })

export default instance
