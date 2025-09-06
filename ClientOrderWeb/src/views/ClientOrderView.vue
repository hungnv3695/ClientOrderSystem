<template>
    <BContainer v-if="isWelcome" fluid class="min-vh-100 d-flex align-items-center justify-content-center nature-bg welcome-outdoor">
        <BRow class="w-100 justify-content-center">
            <BCol cols="12" md="9" lg="9" class="text-center">
                <div class="welcome-content-outdoor">
                    <!-- Simple branding -->
                    <div class="brand-section-outdoor mb-5">
                        <h1 class="welcome-title-outdoor mb-3">Chào mừng quý khách</h1>
                        <h2 class="brand-name-outdoor mb-4">Smart&nbsp;Order&nbsp;System</h2>
                    </div>
                    
                    <!-- Large touch-friendly button with BootstrapVue -->
                    <div class="action-section-outdoor d-flex justify-content-center">
                        <BButton 
                            variant="dark" 
                            size="lg" 
                            class="outdoor-order-btn d-flex align-items-center justify-content-center"
                            @click="openOrderScreen"
                        >
                            <i class="bi bi-play-circle-fill me-3"></i>
                            <span class="button-text">BẮT ĐẦU GỌI MÓN</span>
                        </BButton>
                    </div>
                </div>
            </BCol>
        </BRow>
    </BContainer>

    <transition name="drop">
        <BContainer v-if="!isWelcome" fluid class="min-vh-100 d-flex flex-column nature-bg order-screen">
            <BRow class="order-header-modern align-items-center">
                <BCol class="position-relative text-center">
                    <BButton class="header-back-btn-modern" @click="resetToWelcome" title="Quay lại">
                        <i class="bi bi-arrow-left"></i>
                    </BButton>
                    <div class="header-title-section">
                        <h1 class="order-title-modern m-0">THỰC ĐƠN</h1>
                        <p class="order-subtitle-modern m-0">Chọn món yêu thích của bạn</p>
                    </div>
                </BCol>
            </BRow>
            <BRow class="nature-bg flex-grow-1 h-100 pt-3 pb-3" style="min-height:0;">
                <BCol cols="7" class="d-flex flex-column h-100">
                    <div class="menu-scroll menu-list-bg flex-grow-1">
                        <div class="d-flex flex-column gap-2">
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
import { SHOP_CODE, DEVICE_CODE, buildQrImage, getPrinterConfig } from '../config/appConfig.js'

// Import print functions từ LocalPrintService
async function loadPrintService() {
    const { printReceipt, createReceiptData } = await import('../services/LocalPrintService.js')
    return { printReceipt, createReceiptData }
}

// ===== REACTIVE VARIABLES =====

/** Danh sách món ăn từ menu, load từ API */
const menuItems = ref([])

/** Danh sách món ăn trong giỏ hàng hiện tại */
const orderItems = ref([])

/** Trạng thái hiển thị modal thanh toán */
const showPayment = ref(false)

/** Trạng thái hiển thị màn hình chào mừng (true) hay màn hình đặt hàng (false) */
const isWelcome = ref(true)

// ===== NON-REACTIVE VARIABLES =====

/** Đường dẫn ảnh QR code cho thanh toán */
var qrImage = ''

/** Nội dung thanh toán (mô tả) */
var content = ''

/** Mã đơn hàng hiện tại */
var orderNumber = ''

/** ID đơn hàng hiện tại từ database */
let orderId = ''

/** Timer theo dõi thời gian không hoạt động của người dùng */
let inactivityTimer = null

// ===== COMPUTED PROPERTIES =====

/** Tổng tiền của tất cả món ăn trong giỏ hàng */
const totalAmount = computed(() =>
    orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// ===== LIFECYCLE HOOKS =====

/**
 * Khởi tạo component và load dữ liệu menu khi component được mount
 */
onMounted(async () => {
    menuItems.value = await fetchMenu()
})

// ===== FUNCTIONS =====

/**
 * Reset về màn hình chào mừng và xóa toàn bộ dữ liệu đơn hàng
 * Đồng thời xóa timer và event listeners để tránh memory leak
 */
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

/**
 * Xử lý hoạt động của người dùng (click, touch) để reset timer không hoạt động
 * Sau 60 giây không hoạt động sẽ tự động quay về màn hình chào mừng
 */
function onActivity() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
        resetToWelcome()
    }, 60000)
}

/**
 * Mở màn hình đặt hàng và khởi tạo timer theo dõi hoạt động
 * Đảm bảo không có listener trùng lặp
 */
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

/**
 * Mở modal thanh toán với thông tin đơn hàng
 * @param {string} orderNo - Mã đơn hàng
 * @param {number} amount - Số tiền cần thanh toán
 * @param {string} id - ID đơn hàng (optional)
 */
function openPaymentModal(orderNo, amount, id) {
    orderNumber = orderNo
    if (id) orderId = id
    qrImage = buildQrImage(amount, orderNumber)
    showPayment.value = true
}

//{ shopCode?: string, note?: string, items: Array<{ foodId: number, quantity: number }> }
/**
 * Tạo đơn hàng mới hoặc cập nhật đơn hàng hiện tại
 * Nếu đã có orderId thì cập nhật, ngược lại tạo mới
 * Sau khi thành công sẽ mở modal thanh toán
 */
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
        if (result === 'success' || (result && result.id)) {
            openPaymentModal(result.orderNumber, result.totalPrice)
        }
    } else {
        const result = await submitOrder(orderParam)
        if (result === 'success' || (result && result.id)) {
            orderId = result.id
            openPaymentModal(result.orderNumber, result.totalPrice)
        }
    }
}

/**
 * Xử lý khi thanh toán thành công
 * Tạo receipt, in hóa đơn (nếu có máy in), và reset về màn hình chào mừng sau 5 giây
 */
async function handlePaid() {
    try {
        const receipt = await createReceipt(orderId, {
            paymentMethod: 'bank_transfer',
        })
        
        // In hóa đơn nếu có máy in thông qua local service - không block payment
        if (receipt) {
            try {
                const { printReceipt, createReceiptData } = await loadPrintService()
                const printerConfig = getPrinterConfig(DEVICE_CODE);
                const receiptData = createReceiptData(receipt);
                await printReceipt(printerConfig.printerIp, printerConfig.port, printerConfig.deviceId, receiptData);
                console.log('Receipt printed successfully');
            } catch (printError) {
                console.warn('Print failed but payment completed:', printError.message);
                // TODO: Show notification về print error nhưng payment đã thành công
            }
        }

        setTimeout(() => {
            showPayment.value = false
            orderItems.value = []
            orderNumber = ''
            orderId = ''
            isWelcome.value = true
        }, 5000) // 5 giây sau khi thanh toán
    } catch (error) {
        console.error('Payment failed:', error)
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            orderId: orderId
        });
        // Có thể hiển thị thông báo lỗi cho người dùng
        alert('Có lỗi xảy ra khi thanh toán: ' + (error.response?.data?.message || error.message || 'Vui lòng thử lại'))
    }
}

</script>

<style scoped>
/* ===== LEGACY MENU STYLES (Updated) ===== */
.menu-scroll {
    height: 100%;
    overflow-y: auto;
    border: none;
    scrollbar-width: none;
    /* Firefox */
    padding: 20px;
    box-sizing: border-box;
}

.menu-scroll::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
}

/* Header height */
.order-header {
    height: 72px;
}

/* Menu container layout fix */
.order-screen {
    height: 100vh;
    overflow: hidden;
}

.order-screen .flex-grow-1 {
    flex: 1;
    min-height: 0;
}

/* ===== MODERN ORDER HEADER ===== */
.order-header-modern {
    height: 100px;
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%);
    border-bottom: 3px solid var(--nature-green-dark);
    box-shadow: 0 8px 24px var(--natural-shadow);
    position: relative;
    backdrop-filter: blur(10px);
}

.header-title-section {
    color: var(--earth-brown-dark);
    text-align: center;
}

.order-title-modern {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--earth-brown-dark);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 1.5px;
    line-height: 1.2;
}

.order-subtitle-modern {
    font-size: 1rem;
    color: var(--earth-brown);
    font-weight: 500;
    margin-top: 0.25rem;
    letter-spacing: 0.5px;
}

/* Modern back button - đồng bộ với nature color scheme */
.header-back-btn-modern {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    
    /* Enhanced natural style */
    background: linear-gradient(135deg, var(--nature-green-dark) 0%, var(--earth-brown) 100%) !important;
    border: 2px solid var(--nature-green-light) !important;
    color: var(--cream-white) !important;
    
    border-radius: 16px !important;
    
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    
    box-shadow: 0 6px 16px var(--natural-shadow) !important;
    transition: all 0.3s ease-out !important;
}

.header-back-btn-modern:hover {
    transform: translateY(-50%) translateY(-2px) !important;
    box-shadow: 0 8px 20px var(--natural-shadow) !important;
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--earth-brown-light) 100%) !important;
}

.header-back-btn-modern:active {
    transform: translateY(-50%) translateY(-1px) !important;
    transition: all 0.1s ease-out !important;
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

/* ===== ORDER SCREEN STYLING ===== */
.order-screen {
    background: linear-gradient(135deg, #2d5016 0%, #1a2f0a 100%);
}

/* Responsive cho order header */
@media (max-width: 768px) {
    .order-header-modern {
        height: 80px;
    }
    
    .order-title-modern {
        font-size: 1.8rem;
    }
    
    .order-subtitle-modern {
        font-size: 0.875rem;
    }
    
    .header-back-btn-modern {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        left: 15px;
    }
}

/* ===== OUTDOOR TABLET WELCOME SCREEN ===== */
.welcome-outdoor {
    /* Enhanced natural gradient for outdoor anti-glare */
    background: linear-gradient(135deg, var(--nature-green-dark) 0%, var(--earth-brown-dark) 100%);
    position: relative;
    backdrop-filter: blur(20px);
}

.welcome-content-outdoor {
    padding: 3rem 2rem;
    backdrop-filter: blur(10px);
    border-radius: 24px;
    background: rgba(245, 245, 220, 0.05);
    border: 1px solid rgba(245, 245, 220, 0.1);
}

.brand-section-outdoor {
    color: var(--cream-white);
    text-align: center;
    width: 100%;
}

.welcome-title-outdoor {
    font-size: 2.8rem;
    font-weight: 500;
    color: var(--cream-white);
    margin: 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    text-align: center;
    width: 100%;
    letter-spacing: 1px;
    line-height: 1.4;
}

.brand-name-outdoor {
    font-size: 4rem;
    font-weight: 700;
    color: var(--cream-white);
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    white-space: nowrap;
    text-align: center;
    width: 100%;
    display: block;
}

/* Button tối ưu cho tablet cảm ứng ngoài trời - Enhanced Natural Style */
.outdoor-order-btn {
    /* Kích thước lớn cho tablet */
    min-width: 400px !important;
    min-height: 120px !important;
    width: auto !important;
    
    /* Natural gradient background */
    background: linear-gradient(135deg, var(--order-pill-green) 0%, #90E085 100%) !important;
    border: 3px solid var(--nature-green-light) !important;
    color: var(--earth-brown-dark) !important;
    
    /* Enhanced border radius */
    border-radius: 24px !important;
    
    /* Natural shadow với màu earth tone */
    box-shadow: 0 12px 32px var(--natural-shadow), 
                0 4px 12px rgba(119, 194, 107, 0.3) !important;
    
    /* Smooth transition */
    transition: all 0.3s ease-out !important;
    
    /* Comfortable padding */
    padding: 1.8rem 2.5rem !important;
    
    /* Flex alignment cho icon và text */
    gap: 1.2rem !important;
}

.outdoor-order-btn i {
    font-size: 2.5rem !important;
    color: var(--earth-brown-dark) !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.outdoor-order-btn .button-text {
    font-size: 2rem !important;
    font-weight: 700 !important;
    letter-spacing: 1.2px !important;
    line-height: 1.3 !important;
    text-align: center !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    flex: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Touch feedback cho tablet - Enhanced Natural Style */
.outdoor-order-btn:hover,
.outdoor-order-btn:focus {
    background: linear-gradient(135deg, #90E085 0%, var(--order-pill-green) 100%) !important;
    border-color: var(--nature-green) !important;
    transform: translateY(-3px) !important;
    box-shadow: 0 16px 40px var(--natural-shadow), 
                0 6px 16px rgba(119, 194, 107, 0.4) !important;
}

.outdoor-order-btn:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 20px var(--natural-shadow) !important;
    background: linear-gradient(135deg, var(--order-pill-green) 0%, #70B263 100%) !important;
    transition: all 0.1s ease-out !important;
}

/* Responsive cho tablet nhỏ hơn */
@media (max-width: 768px) {
    .welcome-title-outdoor {
        font-size: 2rem;
    }
    
    .brand-name-outdoor {
        font-size: 2.8rem;
    }
    
    .outdoor-order-btn {
        min-width: 350px !important;
        min-height: 100px !important;
    }
    
    .outdoor-order-btn i {
        font-size: 1.8rem !important;
    }
    
    .outdoor-order-btn .button-text {
        font-size: 1.5rem !important;
    }
}

/* Cho màn hình rất nhỏ */
@media (max-width: 480px) {
    .outdoor-order-btn {
        min-width: 300px !important;
        min-height: 90px !important;
    }
    
    .outdoor-order-btn i {
        font-size: 1.5rem !important;
    }
    
    .outdoor-order-btn .button-text {
        font-size: 1.3rem !important;
    }
}
</style>
