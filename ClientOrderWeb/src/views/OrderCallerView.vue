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
import axios from '../services/axios'
import { SHOP_CODE, SOCKET_URL } from '../config/appConfig.js'
import OrderNumberTag from '../components/OrderNumberTag.vue'
import ProcessingOrderTag from '../components/ProcessingOrderTag.vue'
import CompletedOrderTag from '../components/CompletedOrderTag.vue'

const orders = ref([])

const receivedOrders = computed(() => orders.value.filter(o => o.status === 'Received'))
const processingOrders = computed(() => orders.value.filter(o => o.status === 'Processing'))
const completedOrders = computed(() =>
    orders.value
        .filter(o => o.status === 'Completed')
        .sort((a, b) => b.orderNumber.localeCompare(a.orderNumber))
)
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'Delivered'))

onMounted(async () => {
    // 1) Lấy dữ liệu ban đầu qua REST
    try {
        const res = await axios.get('orders/numbers')
        orders.value = res.data?.data || []
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

async function processOrderClick(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return

    try {
        await axios.patch(`orders/${orderId}/status`, { status: status })
        // Optimistic update (có thể bỏ nếu tin cậy socket emit)
        //order.status = status
    } catch (e) {
        console.error('update status failed', e)
    }
}

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