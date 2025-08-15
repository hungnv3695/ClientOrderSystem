<template>
    <BModal :model-value="show" @update:model-value="val => emit('update:show', val)" centered no-footer
        title="Thanh toán" title-class="text-center" size="md">
        <div class="text-center mb-3">
            <img :src="qrImage" alt="QR code" class="qr-img" />
        </div>
        <div v-if="!paid" class="text-center">
            <div class="fw-bold">Nội dung thanh toán:</div>
            <div class="fs-4 text-primary">{{ content }}</div>
        </div>
        <div v-if="!paid" class="text-center">
            <div class="fw-bold">Số tiền cần thanh toán:</div>
            <div class="fs-4 text-primary">{{ formatCurrencyVND(amount) }}</div>
        </div>
        <div v-if="!paid" class="text-center mt-3">
            <BSpinner small />
            <span class="ms-2">Đang chờ thanh toán... ({{ seconds }}s)</span>
        </div>
        <div v-else class="text-center mt-3">
            <div class="alert alert-success mb-0">Thanh toán thành công!</div>
        </div>
    </BModal>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { formatCurrencyVND } from '../utils/currency.js'
import { getPaymentStatus } from '../services/OrderService.js'

// Props:
//  show: điều khiển hiển thị modal
//  qrImage: ảnh QR hiển thị để khách quét
//  amount: số tiền cần thanh toán (hiển thị cho khách)
//  content: nội dung (thường là mã đơn hàng / mã chuyển khoản)
//  orderId: id đơn hàng để backend kiểm tra trạng thái thanh toán
const props = defineProps({
    show: { type: Boolean, required: true },
    qrImage: { type: String, required: true },
    amount: { type: Number, required: true },
    content: { type: String, default: '' },
    orderId: { type: [Number, String], default: null }
})
// Emits:
//  update:show: đồng bộ state hiển thị với parent (v-model)
//  paid: phát ra khi hệ thống xác nhận đã thanh toán
const emit = defineEmits(['update:show', 'paid'])

// paid: đã thanh toán hay chưa
// seconds: đếm thời gian (sau khi bắt đầu polling) để feedback người dùng
const paid = ref(false)
const seconds = ref(0)
// pollTimer: interval kiểm tra trạng thái mỗi 1s
let pollTimer = null

// clearTimers: dọn dẹp toàn bộ timeout/interval để tránh memory leak & poll thừa
function clearTimers() {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
}

// startPolling:
//  - Sau đó mỗi 1 giây gọi API getPaymentStatus(orderId)
//  - Khi nhận paid = true: đặt paid, emit sự kiện, dừng polling
async function startPolling() {
    if (!props.orderId) return
    // Interval 1s: tăng seconds; chỉ gọi API khi seconds > 5
    pollTimer = setInterval(async () => {
        seconds.value += 1
        if (seconds.value <= 5) return // giai đoạn chờ ban đầu
        try {
            const status = await getPaymentStatus(props.orderId)
            if (status) {
                paid.value = true
                emit('paid')
                clearTimers()
            }
        } catch (e) {
            // silent
        }
    }, 1000)
}

// Watch show:
//  - Khi mở modal: reset state + bắt đầu chu trình polling mới
//  - Khi đóng modal: dọn dẹp timers
watch(() => props.show, (val) => {
    if (val) {
        paid.value = false
        seconds.value = 0
        clearTimers()
        startPolling()
    } else {
        clearTimers()
    }
})

// Dọn dẹp khi component bị unmount
onBeforeUnmount(() => clearTimers())
</script>

<style scoped>
.qr-img {
    width: 350px;
    height: 350px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #eee;
    background: #fff;
}
</style>
