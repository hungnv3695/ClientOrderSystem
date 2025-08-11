<template>
    <BContainer fluid class="dashboard-auto-size d-flex flex-column h-100 nature-bg">
        <BRow class="flex-grow-1 h-100">
            <BCol cols="7" class="h-100 d-flex flex-column">
                <h1>Đơn hàng đã nhận</h1>
                <h5>(Vui lòng đợi đến khi đơn hoàn thành)</h5>
                <div class="flex-column gap-2 pt-2 flex-grow-1 panel-box">
                    <OrderNumberTag
                        v-for="order in waitingOrders"
                        :key="order.id"
                        :number="order.orderNumber.slice(-4)"
                        :enabled="order.status === 'Waiting'"
                    />
                </div>
            </BCol>
            <BCol cols="5" class="h-100 d-flex flex-column">
                <h1>Đơn hàng đã hoàn thành</h1>
                <h5>(Vui lòng đến quầy để nhận đồ)</h5>
                <div class="flex-column gap-2 pt-2 flex-grow-1 panel-box">
                    <OrderNumberTag
                        v-for="order in completedOrders"
                        :key="order.id"
                        :number="order.orderNumber.slice(-4)"
                        :enabled="order.status === 'Waiting'"
                    />
                </div>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { io } from 'socket.io-client'
import axios from '../services/axios'

const orderNumbers = ref([])

onMounted(async () => {
    // 1) Lấy dữ liệu ban đầu qua REST
    try {
        const res = await axios.get('orders/numbers', { params: { limit: 50 } })
        orderNumbers.value = res.data?.data || []
    } catch (e) {
        console.error('fetch numbers failed', e)
    }

    // 2) Subscribe realtime qua socket
    const socket = io('http://localhost:3000', { query: { shopId: 'SH123' } })
    socket.on('orderNumbers', (data) => {
        orderNumbers.value = data
    })
})

const waitingOrders = computed(() => orderNumbers.value.filter(o => o.status === 'Waiting'))
const completedOrders = computed(() => orderNumbers.value.filter(o => o.status === 'Completed'))
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