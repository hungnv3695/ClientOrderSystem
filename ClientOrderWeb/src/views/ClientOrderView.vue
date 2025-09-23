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
                    <div class="flex-grow-1">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FoodCard from '../components/FoodCard.vue'
import OrderList from '../components/OrderList.vue'
import PaymentModal from '../components/PaymentModal.vue'
import { fetchMenu, submitOrder, updateExistingOrder, createReceipt } from '../services/OrderService.js'
import { buildQrImage } from '../config/appConfig.js'
import { getCurrentDevice, getCurrentShop, getPrinterConfigFromDevice } from '../services/AuthService.js'
import { isAuthenticated } from '../utils/authUtils.js'
import { API_STATUS_CODES, STRING } from '../constants/app.constants.js'
import { CLIENT_ORDER_ALERT_MESS } from '../constants/msg.constants.js'

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

// ===== CONSTANTS =====

/** URL đường dẫn trang đăng nhập */
const URL_LOGIN = '/login'

/** Phương thức thanh toán chuyển khoản ngân hàng */
const BANK_TRANSFER = 'bank_transfer'

/** Tên sự kiện touchstart cho thiết bị cảm ứng */
const TOUCH_START_EVENT = 'touchstart'

/** Tên sự kiện click cho chuột */
const CLICK_EVENT = 'click'

/** Số lượng tối đa cho mỗi món ăn trong giỏ hàng */
const MAX_QUANTITY = 99

/** Số lượng tối thiểu cho mỗi món ăn trong giỏ hàng */
const MIN_QUANTITY = 1

/** Thời gian chờ sau khi thanh toán thành công (ms) */
const WAIT_TIME_AFTER_PAID = 5000

/** Thời gian chờ sau khi vào màn hình order (ms) */
const ORDER_SCREEN_TIME_OUT = 60000

// ===== NON-REACTIVE VARIABLES =====

/** Đường dẫn ảnh QR code cho thanh toán */
var qrImage = STRING.EMPTY

/** Mã đơn hàng hiện tại */
var orderNumber = STRING.EMPTY

/** ID đơn hàng hiện tại từ database */
let orderId = STRING.EMPTY

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
    // Check authentication trước khi load data
    if (!isAuthenticated()) {
        window.location.href = URL_LOGIN
        return
    }
    
    try {
        menuItems.value = await fetchMenu()
    } catch (error) {
        console.error('Failed to load menu:', error)
        
        // Authentication error sẽ được handle bởi axios interceptor
        if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED || error.response?.status === API_STATUS_CODES.FORBIDDEN) {
            return
        }
        
        alert(CLIENT_ORDER_ALERT_MESS.MENU_LOAD_ERROR)
    }
})

/**
 * Cleanup khi component bị unmount
 */
onUnmounted(() => {
    // Clear timer khi component bị destroy
    if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        inactivityTimer = null
    }
    
    // Remove event listeners
    window.removeEventListener(CLICK_EVENT, onActivity)
    window.removeEventListener(TOUCH_START_EVENT, onActivity)
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
    window.removeEventListener(CLICK_EVENT, onActivity)
    window.removeEventListener(TOUCH_START_EVENT, onActivity)

    // Đưa UI về trạng thái ban đầu
    isWelcome.value = true
    orderItems.value = []
    orderNumber = STRING.EMPTY
    orderId = STRING.EMPTY
    qrImage = STRING.EMPTY
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
    }, ORDER_SCREEN_TIME_OUT)
}

/**
 * Mở màn hình đặt hàng và khởi tạo timer theo dõi hoạt động
 * Đảm bảo không có listener trùng lặp
 */
function openOrderScreen() {
    isWelcome.value = false
    // Đảm bảo không nhân đôi listener
    window.removeEventListener(CLICK_EVENT, onActivity)
    window.removeEventListener(TOUCH_START_EVENT, onActivity)
    window.addEventListener(CLICK_EVENT, onActivity)
    window.addEventListener(TOUCH_START_EVENT, onActivity)
    onActivity()
}

/**
 * Thêm món ăn vào giỏ hàng.
 * Nếu món đã có trong giỏ, tăng số lượng lên 1 (tối đa 99).
 * Nếu món chưa có, thêm mới với số lượng 1.
 */
function addToOrder(food) {
    const existing = orderItems.value.find(item => item.id === food.id)
    if (existing) {
        if (existing.quantity < MAX_QUANTITY) existing.quantity += MIN_QUANTITY
    } else {
        orderItems.value.push({ ...food, quantity: MIN_QUANTITY })
    }
}

/**
 * Tăng số lượng món trong giỏ hàng.
 * Nếu món đã có, tăng số lượng lên 1 (tối đa 99).
 * @param {Object} item - Món ăn cần tăng số lượng.
 */
function increaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity < MAX_QUANTITY) found.quantity += MIN_QUANTITY
}

/**
 * Giảm số lượng món trong giỏ hàng.
 * Nếu món đã có và số lượng lớn hơn 1, giảm số lượng xuống 1.
 * Nếu số lượng bằng 1, xóa món khỏi giỏ hàng.
 * @param {Object} item - Món ăn cần giảm số lượng.
 */
function decreaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity > MIN_QUANTITY) {
        found.quantity -= MIN_QUANTITY 
    }
    else if (found && found.quantity === MIN_QUANTITY) {
        orderItems.value = orderItems.value.filter(i => i.id !== item.id)
    }
}

/**
 * Tạo đơn hàng mới hoặc cập nhật đơn hàng hiện tại
 * Nếu đã có orderId thì cập nhật, ngược lại tạo mới
 * Sau khi thành công sẽ mở modal thanh toán
 */
async function createOrder() {
    if (!orderItems.value.length) return

    // Check authentication trước khi gọi API
    if (!isAuthenticated()) {
        window.location.href = URL_LOGIN
        return
    }

    try {
        // Lấy shop code và device code từ user hiện tại
        const shopCode = getCurrentShop()
        const currentDevice = getCurrentDevice()
        
        // Kiểm tra xem user có shop và device không
        if (!shopCode) {
            console.error('No shop code available for current user')
            alert(CLIENT_ORDER_ALERT_MESS.SHOP_CODE_NOT_FOUND)
            return
        }
        
        if (!currentDevice || !currentDevice.code) {
            console.error('No device code available for current user')
            alert(CLIENT_ORDER_ALERT_MESS.DEVICE_CODE_NOT_FOUND)
            return
        }

        const deviceCode = currentDevice.code

        const orderParam = {
            shopCode: shopCode,
            deviceCode: deviceCode,
            note: 'No special requests',
            items: orderItems.value.map(item => ({
                name: item.name,
                price: item.price,
                foodId: Number(item.id),
                quantity: Number(item.quantity) || MIN_QUANTITY,
            })),
        }

        let result;
        // Nếu đã có mã đơn hàng, cập nhật chi tiết
        if (orderId) {
            result = await updateExistingOrder(orderId, orderParam)
        } else {
            result = await submitOrder(orderParam)
        }
        
        if (result === 'success' || (result && result.id)) {
            if (!orderId && result.id) orderId = result.id
            // Mở payment modal
            orderNumber = result.orderNumber
            if (result.id) orderId = result.id
            qrImage = buildQrImage(result.totalPrice, result.orderNumber)
            showPayment.value = true
        }
        
    } catch (error) {
        console.error('Order creation failed:', error)
        
        // Authentication errors sẽ được handle bởi axios interceptor
        if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED || error.response?.status === API_STATUS_CODES.FORBIDDEN) {
            return
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo đơn hàng'
        alert(CLIENT_ORDER_ALERT_MESS.ORDER_CREATE_ERROR.replace('{errorMessage}', errorMessage))
    }
}

/**
 * Xử lý khi thanh toán thành công
 * Tạo receipt, in hóa đơn (nếu có máy in), và reset về màn hình chào mừng sau 5 giây
 */
async function handlePaid() {
    try {
        const receipt = await createReceipt(orderId, {
            paymentMethod: BANK_TRANSFER,
        })
        
        // In hóa đơn nếu có máy in thông qua local service - không block payment
        if (receipt) {
            try {
                const { printReceipt, createReceiptData } = await loadPrintService()
                
                // Lấy config máy in từ device info của user
                let printerConfig = getPrinterConfigFromDevice()
                
                if (printerConfig) {
                    const receiptData = createReceiptData(receipt);
                    await printReceipt(printerConfig.printerIp, printerConfig.port, printerConfig.deviceId, receiptData);
                } else {
                    console.warn('No printer config available, skipping print')
                }
            } catch (printError) {
                console.warn('Print failed but payment completed:', printError.message);
                alert(CLIENT_ORDER_ALERT_MESS.PAYMENT_SUCCESS_WITH_PRINT_ERROR.replace('{printError}', printError.message));
            }
        }

        setTimeout(() => {
            resetToWelcome()
        }, WAIT_TIME_AFTER_PAID)
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            orderId: orderId
        });
        
        // Check if it's an authentication error
        if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED || error.response?.status === API_STATUS_CODES.FORBIDDEN) {
            return
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Vui lòng thử lại'
        alert(CLIENT_ORDER_ALERT_MESS.PAYMENT_ERROR.replace('{errorMessage}', errorMessage))
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

/* Menu container layout fix */
.order-screen {
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #2d5016 0%, #1a2f0a 100%);
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
