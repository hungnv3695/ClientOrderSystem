<template>
    <BContainer v-if="isWelcome" fluid class="min-vh-100 d-flex align-items-center justify-content-center nature-bg">
        <BRow class="text-center">
            <BCol />
            <BCol cols="auto" align-self="stretch">

                <BButton class="pill-order-btn" size="lg" @click="openOrderScreen">Gọi món</BButton>
            </BCol>
            <BCol />
        </BRow>
    </BContainer>

    <transition name="drop">
        <BContainer v-if="!isWelcome" fluid class="min-vh-100 d-flex flex-column nature-bg">
            <BRow class="nature-bg align-items-center order-header">
                <BCol class="position-relative text-center">
                    <BButton class="header-back-btn" @click="resetToWelcome" title="Quay lại">
                        <i class="bi bi-arrow-left"></i>
                    </BButton>
                    <h1 class="h1-screen-title title m-0">Gọi món</h1>
                </BCol>
            </BRow>
            <BRow class="nature-bg flex-grow-1 h-100" style="min-height:0;">
                <BCol cols="7" class="d-flex flex-column">
                    <div class="menu-scroll menu-list-bg h-100 flex-grow-1">
                        <div class="d-flex flex-column gap-2 ">
                            <FoodCard v-for="food in menuItems" :key="food.id" :food="food" @click="addToOrder(food)" />
                        </div>
                    </div>
                </BCol>
                <BCol cols="5" class="h-100 d-flex flex-column">
                    <div class="lex-grow-1">
                        <OrderList :order-items="orderItems" @checkout="createOrder" @increase="increaseQuantity"
                            @decrease="decreaseQuantity" />
                    </div>
                </BCol>
            </BRow>
            <PaymentModal v-model:show="showPayment" :qr-image="qrImage" :amount="totalAmount" :content="orderNumber"
                :order-id="orderId" @paid="handlePaid" />
        </BContainer>

    </transition>

</template>

<script setup>


import { ref, computed, onMounted } from 'vue'
import PaymentModal from '../components/PaymentModal.vue'
import { fetchMenu, submitOrder, updateExistingOrder, createReceipt } from '../services/OrderService.js'
import { SHOP_CODE, DEVICE_CODE, buildQrImage } from '../config/appConfig.js'
import { printReceipt } from '../services/PrinterService.js'

const menuItems = ref([])


onMounted(async () => {
    menuItems.value = await fetchMenu()
})

const orderItems = ref([])
const showPayment = ref(false)
var qrImage = '' // Đường dẫn ảnh QR code demo, thay bằng ảnh thật nếu cần
var content = '' // Nội dung thanh toán
var orderNumber = '' // Mã đơn hàng
let orderId = '' // ID đơn hàng
const totalAmount = computed(() =>
    orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const isWelcome = ref(true)
let inactivityTimer = null

function resetToWelcome() {
    // Xóa timer và bỏ đăng ký sự kiện
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = null
    window.removeEventListener('click', onActivity)
    window.removeEventListener('touchstart', onActivity)

    // Đưa UI về trạng thái ban đầu
    isWelcome.value = true
    orderItems.value = []
    orderNumber = ''
    orderId = ''
    qrImage = ''
    content = ''
    showPayment.value = false
}

function onActivity() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
        resetToWelcome()
    }, 60000)
}

function openOrderScreen() {
    isWelcome.value = false
    // Đảm bảo không nhân đôi listener
    window.removeEventListener('click', onActivity)
    window.removeEventListener('touchstart', onActivity)
    window.addEventListener('click', onActivity)
    window.addEventListener('touchstart', onActivity)
    onActivity()
}

// Hàm thêm món vào giỏ hàng
/**
 * Thêm món ăn vào giỏ hàng.
 * Nếu món đã có trong giỏ, tăng số lượng lên 1 (tối đa 99).
 * Nếu món chưa có, thêm mới với số lượng 1.
 * @param {Object} food - Món ăn cần thêm vào giỏ hàng.
 */
function addToOrder(food) {
    const existing = orderItems.value.find(item => item.id === food.id)
    if (existing) {
        if (existing.quantity < 99) existing.quantity += 1
    } else {
        orderItems.value.push({ ...food, quantity: 1 })
    }
}

// Hàm tăng số lượng món
/**
 * Tăng số lượng món trong giỏ hàng.
 * Nếu món đã có, tăng số lượng lên 1 (tối đa 99).
 * @param {Object} item - Món ăn cần tăng số lượng.
 */
function increaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity < 99) found.quantity += 1
}

// Hàm giảm số lượng món
/**
 * Giảm số lượng món trong giỏ hàng.
 * Nếu món đã có và số lượng lớn hơn 1, giảm số lượng xuống 1.
 * Nếu số lượng bằng 1, xóa món khỏi giỏ hàng.
 * @param {Object} item - Món ăn cần giảm số lượng.
 */
function decreaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity > 1) found.quantity -= 1
    else if (found && found.quantity === 1) orderItems.value = orderItems.value.filter(i => i.id !== item.id)
}

function openPaymentModal(orderNo, amount, id) {
    orderNumber = orderNo
    if (id) orderId = id
    qrImage = buildQrImage(amount, orderNumber)
    showPayment.value = true
}

//{ shopCode?: string, note?: string, items: Array<{ foodId: number, quantity: number }> }
async function createOrder() {
    if (!orderItems.value.length) return

    const orderParam = {
        shopCode: SHOP_CODE,
        deviceCode: DEVICE_CODE,
        note: 'No special requests',
        items: orderItems.value.map(item => ({
            name: item.name,
            price: item.price,
            foodId: Number(item.id),
            quantity: Number(item.quantity) || 1,
        })),
    }

    // Nếu đã có mã đơn hàng, cập nhật chi tiết
    if (orderId) {
        const result = await updateExistingOrder(orderId, orderParam)
        console.log('Order update result:', result)
        if (result === 'success' || (result && result.id)) {
            openPaymentModal(result.orderNumber, result.totalPrice)
        }
    } else {
        const result = await submitOrder(orderParam)
        console.log('Order submission result:', result)
        if (result === 'success' || (result && result.id)) {
            orderId = result.id
            openPaymentModal(result.orderNumber, result.totalPrice)
        }
    }
}

async function handlePaid() {
    const receipt = await createReceipt(orderId, {
        paymentMethod: 'bank_transfer',
    })
    // In hóa đơn nếu có máy in
    if (receipt) {
        await printReceipt('192.168.11.9', '8008', 'local_printer', receipt)
    }

    setTimeout(() => {
        showPayment.value = false
        orderItems.value = []
        orderNumber = ''
        orderId = ''
        isWelcome.value = true
    }, 5000) // 5 giây sau khi thanh toán
}

</script>

<style scoped>
.menu-scroll {
    max-height: calc(100vh - 60px);
    /* trừ header và footer */
    overflow-y: auto;
    border: 13px solid var(--nature-green);
    scrollbar-width: none;
    /* Firefox */
}

.menu-scroll::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
}

/* Header height */
.order-header {
    height: 72px;
}

h1.title {
    padding-bottom: 10px;
    padding-top: 10px;
    background: var(--nature-green);
}

/* Back button placed inside the title column (absolute on the left) */
.header-back-btn {
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: var(--nature-green);
    color: #000;
    border: none;
    padding-left: 10px;
    border-radius: 0 !important;
    /* square corners */
}

.header-back-btn:hover,
.header-back-btn:active {
    background: var(--nature-green-dark);
}

.drop-enter-active {
    animation: drop-in 1s cubic-bezier(.25, 1.7, .5, 1.15);
}

@keyframes drop-in {
    0% {
        opacity: 0;
        transform: translateY(-80px) scale(0.98);
    }

    80% {
        opacity: 1;
        transform: translateY(10px) scale(1.01);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
