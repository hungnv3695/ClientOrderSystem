import axios from './axios'

export async function login(username, password) {
    const res = await axios.post('auth/login', { username, password })

    // Debug log để kiểm tra response
    console.log('Login response:', { status: res.status, data: res.data })

    if (res.data?.success) {
        const { token, user } = res.data.data

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        return user
    }
    throw new Error(res.data?.message || 'Login failed')
}

export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

export function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}
