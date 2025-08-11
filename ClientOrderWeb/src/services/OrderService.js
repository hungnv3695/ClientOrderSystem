// Lấy menu mẫu (có thể thay bằng gọi API thực tế)
import axios from './axios'

// Gọi API lấy menu
export async function fetchMenu() {
    const res = await axios.get('menus', { params: { id: 1 } })
    // Trả về mảng menu hoặc [] nếu lỗi
    if (res.data?.success === true) {
        return res.data?.data.food || []
    }
    return []
}

// Gửi đơn hàng (có thể thay bằng gọi API thực tế)
export async function submitOrder(orderItems) {
    console.log('Submitting order:', orderItems)
    const res = await axios.post('orders', orderItems)
    // Trả về kết quả thành công hay thất bại
    if (res.data?.success === true) {
        return res.data?.data
    }
    throw new Error(res.data?.message || 'Failed to submit order')
}
