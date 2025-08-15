<template>
    <BContainer fluid class="dashboard-auto-size d-flex flex-column h-100 nature-bg">
        <BRow class="flex-grow-1 h-100">
            <BCol cols="7" class="h-100 d-flex flex-column">
                <h1>Đơn hàng đã nhận</h1>
                <h5>(Vui lòng đợi đến khi đơn hoàn thành)</h5>
                <div class="flex-column gap-2 pt-2 flex-grow-1 panel-box">
                    <OrderNumberTag v-for="order in receivedOrders" :key="order.id"
                        :number="order.orderNumber.slice(-4)" :enabled="order.status === 'Received'" />
                </div>
            </BCol>
            <BCol cols="5" class="h-100 d-flex flex-column">
                <h1>Đơn hàng đã hoàn thành</h1>
                <h5>(Vui lòng đến quầy để nhận đồ)</h5>
                <div class="flex-column gap-2 pt-2 flex-grow-1 panel-box">
                    <OrderNumberTag v-for="order in completedOrders" :key="order.id"
                        :number="order.orderNumber.slice(-4)" :enabled="order.status === 'Received'" />
                </div>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '../services/axios.js'
import { io } from 'socket.io-client'
import { SHOP_CODE, SOCKET_URL } from '../config/appConfig.js'

const orders = ref([])

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
    })
})

const receivedOrders = computed(() => orders.value.filter(o => o.status === 'Received'))
const completedOrders = computed(() => orders.value.filter(o => o.status === 'Completed'))
</script>

<style scoped>
.dashboard-auto-size {
    min-height: 100vh;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    box-sizing: border-box;
}

.panel-box {
    border: 2px solid var(--nature-green-soft);
    border-radius: 10px;
}
</style>