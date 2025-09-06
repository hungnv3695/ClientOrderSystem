<template>
    <BContainer fluid class="d-flex flex-column h-100 nature-bg">
        <BRow class="flex-grow-1 h-100">
            <BCol cols="2" class="h-100 d-flex flex-column">
                <h4>Đã nhận</h4>
                <BContainer fluid class="panel-box d-flex flex-column gap-2 pt-2 flex-grow-1 overflow-auto">
                    <OrderNumberTag v-for="order in receivedOrders" :key="order.id"
                        :number="order.orderNumber.slice(-4)" :enabled="order.status === 'Received'" :clickable="true"
                        @click="processOrderClick(order.id, 'Processing')" />
                </BContainer>
            </BCol>
            <BCol cols="4" class="h-100 d-flex flex-column">
                <h4>Đang thực hiện</h4>
                <BContainer fluid class="panel-box d-flex flex-column gap-2 pt-2 flex-grow-1 overflow-auto">
                    <ProcessingOrderTag v-for="order in processingOrders" :key="order.id" :orderId="order.id"
                        :orderNumber="order.orderNumber.slice(-4)" :items="order.foods" primaryButtonText="<< Đã nhận"
                        secondaryButtonText="Hoàn thành >>" @primary="processOrderClick(order.id, 'Received')"
                        @secondary="processOrderClick(order.id, 'Completed')" />
                </BContainer>
            </BCol>
            <BCol cols="5" class="h-100 d-flex flex-column">
                <h4>Đã hoàn thành</h4>
                <BContainer fluid class="panel-box d-flex flex-column gap-2 pt-2 flex-grow-1 overflow-auto">
                    <CompletedOrderTag v-for="order in completedOrders" :key="order.id" :orderId="order.id"
                        :orderNumber="order.orderNumber.slice(-4)" :items="order.foods"
                        primaryButtonText="<< Đang thực hiện" secondaryButtonText="Đã giao >>"
                        @primary="processOrderClick(order.id, 'Processing')"
                        @secondary="processOrderClick(order.id, 'Delivered')" @announce="announceOrder(order)" />
                </BContainer>
            </BCol>
            <BCol cols="1" class="h-100 d-flex flex-column">
                <h4>Đã giao</h4>
                <BContainer fluid class="panel-box d-flex flex-column gap-2 pt-2 flex-grow-1 overflow-auto">
                    <OrderNumberTag v-for="order in deliveredOrders" :key="order.id"
                        :number="order.orderNumber.slice(-4)" :enabled="order.status === 'Delivered'" :clickable="true"
                        @click="processOrderClick(order.id, 'Completed')" />
                </BContainer>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { io } from 'socket.io-client'
import { ordersApi } from '../constants/apiHelpers.js'
import { SHOP_CODE, SOCKET_URL } from '../config/appConfig.js'
import OrderNumberTag from '../components/OrderNumberTag.vue'
import ProcessingOrderTag from '../components/ProcessingOrderTag.vue'
import CompletedOrderTag from '../components/CompletedOrderTag.vue'

// ===== REACTIVE DATA =====

/** Danh sách tất cả đơn hàng được load từ API và cập nhật realtime qua socket */
const orders = ref([])

// ===== COMPUTED PROPERTIES =====

/** 
 * Danh sách đơn hàng đã nhận (status = 'Received')
 * Hiển thị ở cột đầu tiên, có thể click để chuyển sang Processing
 */
const receivedOrders = computed(() => orders.value.filter(o => o.status === 'Received'))

/** 
 * Danh sách đơn hàng đang thực hiện (status = 'Processing')
 * Hiển thị ở cột thứ hai với chi tiết món ăn và 2 nút action
 */
const processingOrders = computed(() => orders.value.filter(o => o.status === 'Processing'))

/** 
 * Danh sách đơn hàng đã hoàn thành (status = 'Completed')
 * Hiển thị ở cột thứ ba, được sắp xếp theo orderNumber giảm dần (mới nhất trước)
 */
const completedOrders = computed(() =>
    orders.value
        .filter(o => o.status === 'Completed')
        .sort((a, b) => b.orderNumber.localeCompare(a.orderNumber))
)

/** 
 * Danh sách đơn hàng đã giao (status = 'Delivered')
 * Hiển thị ở cột cuối cùng, có thể click để chuyển về Completed
 */
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'Delivered'))

// ===== LIFECYCLE HOOKS =====

/**
 * Khởi tạo component khi mounted:
 * 1. Lấy dữ liệu đơn hàng ban đầu qua REST API
 * 2. Thiết lập kết nối Socket.IO để nhận cập nhật realtime
 */
onMounted(async () => {
    // 1) Lấy dữ liệu ban đầu qua REST
    try {
        const res = await ordersApi.getNumbers()
        orders.value = res.data || []
    } catch (e) {
        console.error('fetch numbers failed', e)
    }

    // 2) Subscribe realtime qua socket
    const socket = io(SOCKET_URL, { query: { shopId: SHOP_CODE } })
    socket.on('orders', (data) => {
        orders.value = data
        console.log('Received orders:', data) // Debugging line
    })
})

// ===== FUNCTIONS =====

/**
 * Xử lý click vào đơn hàng để thay đổi trạng thái
 * Gọi API để cập nhật status của đơn hàng
 * 
 * @param {string} orderId - ID của đơn hàng cần cập nhật
 * @param {string} status - Trạng thái mới ('Received', 'Processing', 'Completed', 'Delivered')
 */
async function processOrderClick(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return

    try {
        await ordersApi.updateStatus(orderId, status)
        // Optimistic update (có thể bỏ nếu tin cậy socket emit)
        //order.status = status
    } catch (e) {
        console.error('update status failed', e)
    }
}

/**
 * Thông báo đơn hàng đã hoàn thành (announce function)
 * Placeholder cho các action như phát âm thanh, gọi API thông báo, v.v.
 * 
 * @param {Object} order - Đối tượng đơn hàng cần thông báo
 */
function announceOrder(order) {
    // Placeholder for announce action (e.g., play audio, call API)
    // console.log('Announce order:', order)
}
</script>

<style scoped>
.panel-box {
    border: 2px solid var(--nature-green-soft);
    border-radius: 10px;
}
</style>