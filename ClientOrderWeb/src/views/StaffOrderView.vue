<template>
  <!-- Màn hình đặt hàng cho nhân viên -->
  <BContainer fluid class="min-vh-100 d-flex flex-column nature-bg order-screen">
    <!-- Header với nút back và title -->
    <BRow class="order-header-modern align-items-center">
      <BCol class="position-relative text-center">
        <BButton class="header-back-btn-modern" @click="navigateBack" title="Quay lại">
          <i class="bi bi-arrow-left"></i>
        </BButton>
        <div class="header-title-section">
          <h1 class="order-title-modern m-0">MENU</h1>
          <p class="order-subtitle-modern m-0">Chọn món cho khách hàng</p>
        </div>
      </BCol>
    </BRow>

    <!-- Main content area -->
    <BRow class="nature-bg flex-grow-1 h-100 pt-3 pb-3" style="min-height:0;">
      <!-- Danh sách menu -->
      <BCol cols="7" class="d-flex flex-column h-100">
        <div class="menu-scroll menu-list-bg flex-grow-1">
          <div class="d-flex flex-column gap-2">
            <FoodCard 
              v-for="food in menuItems" 
              :key="food.id" 
              :food="food" 
              @click="addToOrder(food)" 
            />
          </div>
        </div>
      </BCol>

      <!-- Danh sách món đã chọn -->
      <BCol cols="5" class="h-100 d-flex flex-column">
        <div class="flex-grow-1">
          <OrderList 
            :order-items="orderItems" 
            button-text="Xác nhận"
            button-class="confirm-btn"
            @checkout="showConfirmModal" 
            @increase="increaseQuantity"
            @decrease="decreaseQuantity" 
          />
        </div>
      </BCol>
    </BRow>

    <!-- Modal xác nhận đơn hàng -->
    <ConfirmOrderModal 
      v-model:show="showConfirm" 
      :order-items="orderItems"
      :total-amount="totalAmount"
      @payment="handlePayment" 
    />
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FoodCard from '../components/FoodCard.vue'
import OrderList from '../components/OrderList.vue'
import ConfirmOrderModal from '../components/ConfirmOrderModal.vue'
import { fetchMenu, submitOrder, createReceipt } from '../services/OrderService.js'
import { getCurrentDevice, getCurrentShop, getCurrentUser, getPrinterConfigFromDevice } from '../services/AuthService.js'
import { isAuthenticated } from '../utils/authUtils.js'
import { API_STATUS_CODES, PAYMENT_METHOD, PAYMENT_STATUS, SCREEN } from '../constants/app.constants.js'
import { CLIENT_ORDER_ALERT_MESS, STAFF_ORDER_ALERT_MESS } from '../constants/msg.constants.js'

// Import print functions từ LocalPrintService
async function loadPrintService() {
    const { printReceipt, createReceiptData } = await import('../services/LocalPrintService.js')
    return { printReceipt, createReceiptData }
}

const router = useRouter()

// ===== REACTIVE VARIABLES =====

/** Danh sách món ăn từ menu */
const menuItems = ref([])

/** Danh sách món ăn trong giỏ hàng */
const orderItems = ref([])

/** Trạng thái hiển thị modal xác nhận */
const showConfirm = ref(false)

// ===== CONSTANTS =====

/** URL đường dẫn trang đăng nhập */
const URL_LOGIN = '/login'

/** Số lượng tối đa cho mỗi món ăn */
const MAX_QUANTITY = 99

/** Số lượng tối thiểu cho mỗi món ăn */
const MIN_QUANTITY = 1

// ===== COMPUTED PROPERTIES =====

/** Tổng tiền của tất cả món ăn trong giỏ hàng */
const totalAmount = computed(() =>
    orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// ===== LIFECYCLE HOOKS =====

/**
 * Load menu khi component được mount
 * Quy trình khởi tạo:
 * 1. Kiểm tra xác thực người dùng
 * 2. Gọi API lấy danh sách menu từ server
 * 3. Xử lý lỗi và chuyển hướng nếu cần
 */
onMounted(async () => {
    // Bước 1: Kiểm tra xác thực người dùng
    if (!isAuthenticated()) {
        window.location.href = URL_LOGIN
        return
    }
    
    try {
        // Bước 2: Gọi API lấy menu từ server
        menuItems.value = await fetchMenu()
    } catch (error) {
        console.error('Failed to load menu:', error)
        
        // Bước 3: Xử lý lỗi authentication - chuyển về login
        if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED || error.response?.status === API_STATUS_CODES.FORBIDDEN) {
            return  // Để AuthService tự động chuyển hướng
        }
        
        // Hiển thị thông báo lỗi cho người dùng
        alert(CLIENT_ORDER_ALERT_MESS.MENU_LOAD_ERROR)
    }
})

// ===== FUNCTIONS =====

/**
 * Sự kiện 1: Quay lại màn hình StaffScreenView
 */
function navigateBack() {
    router.push({ name: SCREEN.STAFF_SCREEN.NAME })
}

/**
 * Sự kiện 2: Thêm món ăn vào giỏ hàng
 * - Nếu món đã tồn tại trong giỏ hàng: tăng số lượng (tối đa 99)
 * - Nếu món chưa có: thêm mới với số lượng mặc định là 1
 * @param {Object} food - Thông tin món ăn cần thêm
 */
function addToOrder(food) {
    const existing = orderItems.value.find(item => item.id === food.id)
    if (existing) {
        // Món đã có trong giỏ hàng, tăng số lượng nếu chưa đạt giới hạn
        if (existing.quantity < MAX_QUANTITY) existing.quantity += MIN_QUANTITY
    } else {
        // Món chưa có, thêm mới vào giỏ hàng
        orderItems.value.push({ ...food, quantity: MIN_QUANTITY })
    }
}

/**
 * Sự kiện 3: Tăng số lượng món
 * Tăng số lượng món trong giỏ hàng lên 1, tối đa 99
 * @param {Object} item - Món ăn cần tăng số lượng
 */
function increaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity < MAX_QUANTITY) found.quantity += MIN_QUANTITY
}

/**
 * Sự kiện 4: Giảm số lượng món
 * - Nếu số lượng > 1: giảm số lượng xuống 1
 * - Nếu số lượng = 1: xóa món khỏi giỏ hàng
 * @param {Object} item - Món ăn cần giảm số lượng
 */
function decreaseQuantity(item) {
    const found = orderItems.value.find(i => i.id === item.id)
    if (found && found.quantity > MIN_QUANTITY) {
        // Giảm số lượng nếu > 1
        found.quantity -= MIN_QUANTITY 
    } else if (found && found.quantity === MIN_QUANTITY) {
        // Xóa món khỏi giỏ hàng nếu số lượng = 1
        orderItems.value = orderItems.value.filter(i => i.id !== item.id)
    }
}

/**
 * Sự kiện 5: Hiển thị modal xác nhận
 * Kiểm tra có món trong giỏ hàng trước khi hiển thị modal xác nhận đơn hàng
 */
function showConfirmModal() {
    if (!orderItems.value.length) return  // Không có món nào thì không hiển thị modal
    showConfirm.value = true
}

/**
 * Sự kiện 6: Xử lý thanh toán và in hóa đơn
 * Quy trình xử lý:
 * 1. Kiểm tra authentication và dữ liệu hợp lệ
 * 2. Lấy thông tin shop và device từ localStorage
 * 3. Tạo đơn hàng với phương thức thanh toán chuyển khoản
 * 4. Tạo receipt (hóa đơn) cho đơn hàng
 * 5. In hóa đơn ra máy in (nếu có cấu hình)
 * 6. Reset màn hình về trạng thái ban đầu
 */
async function handlePayment() {
    if (!orderItems.value.length) return

    // Kiểm tra xác thực người dùng
    if (!isAuthenticated()) {
        window.location.href = URL_LOGIN
        return
    }

    try {
        // Bước 1: Lấy thông tin shop và device từ localStorage
        const shopCode = getCurrentShop()
        const deviceCode = getCurrentDevice()
        const cashierId = getCurrentUser()?.id

        // Validation - kiểm tra thông tin bắt buộc
        if (!cashierId) {
            alert(STAFF_ORDER_ALERT_MESS.CASHIER_NOT_FOUND)
            return
        }

        // Validation - kiểm tra thông tin bắt buộc
        if (!shopCode) {
            alert(CLIENT_ORDER_ALERT_MESS.SHOP_CODE_NOT_FOUND)
            return
        }
        
        // Validation - kiểm tra thông tin bắt buộc
        if (!deviceCode) {
            alert(CLIENT_ORDER_ALERT_MESS.DEVICE_CODE_NOT_FOUND)
            return
        }

        // Bước 2: Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            shopCode: shopCode,
            deviceCode: deviceCode,
            paymentStatus: PAYMENT_STATUS.PAID,
            paymentMethod: PAYMENT_METHOD.CASH,
            cashierId: cashierId,  // Nhân viên đặt đơn không có cashierId
            note: 'Đơn hàng từ nhân viên',
            items: orderItems.value.map(item => ({
                name: item.name,
                price: item.price,
                foodId: Number(item.id),
                quantity: Number(item.quantity) || MIN_QUANTITY,
            })),
        }

        // Bước 3: Gửi đơn hàng lên server
        const result = await submitOrder(orderData)

        if (!result) {
            throw new Error(STAFF_ORDER_ALERT_MESS.ORDER_CREATE_FAIL)
        }

        // Bước 4: Tạo hóa đơn với phương thức thanh toán tiền mặt
        const receiptResult = await createReceipt(result.id, {
            paymentMethod: PAYMENT_METHOD.CASH,
            cashierId: cashierId
        })

        if (receiptResult) {
            // Bước 5: In hóa đơn (nếu có cấu hình máy in)
            await printReceiptForCustomer(receiptResult)

            // Bước 6: Reset màn hình về trạng thái ban đầu
            resetOrder()
        }

        alert(STAFF_ORDER_ALERT_MESS.ORDER_CREATE_SUCCESS)

    } catch (error) {
        const errorMessage = error.message || 'Unknown error'
        alert(CLIENT_ORDER_ALERT_MESS.ORDER_CREATE_ERROR.replace('{errorMessage}', errorMessage))
    }
}

/**
 * In hóa đơn qua máy in Epson
 * Quy trình in:
 * 1. Lấy cấu hình máy in từ device (IP, port, deviceId)
 * 2. Load service in hóa đơn (LocalPrintService)
 * 3. Format dữ liệu hóa đơn theo định dạng máy in
 * 4. Gửi lệnh in đến máy in qua IP
 * @param {Object} receiptData - Dữ liệu hóa đơn cần in
 */
async function printReceiptForCustomer(receiptData) {
    try {
        // Bước 1: Lấy cấu hình máy in từ localStorage device
        const printerConfig = getPrinterConfigFromDevice()
        
        if (!printerConfig) {
            console.warn('No printer config found, skipping print')
            return  // Không có cấu hình máy in thì bỏ qua việc in
        }

        // Bước 2: Load service in hóa đơn động (dynamic import)
        const { printReceipt, createReceiptData } = await loadPrintService()
        
        // Bước 3: Format dữ liệu hóa đơn theo định dạng máy in Epson
        const formattedReceiptData = createReceiptData(receiptData)
        
        // Bước 4: Gửi lệnh in đến máy in qua network
        const printResult = await printReceipt(
            printerConfig.printerIp,    // IP address của máy in
            printerConfig.port,         // Port kết nối (thường là 80)
            printerConfig.deviceId,     // Device ID của máy in
            formattedReceiptData        // Dữ liệu đã format
        )

        console.log('Print successful:', printResult)

    } catch (printError) {
        console.error('Print failed:', printError)
        alert(`In hóa đơn thất bại: ${printError.message}`)
    }
}

/**
 * Reset màn hình về trạng thái ban đầu
 * Xóa toàn bộ giỏ hàng và đóng modal xác nhận để chuẩn bị cho đơn hàng mới
 */
function resetOrder() {
    orderItems.value = []        // Xóa toàn bộ món trong giỏ hàng
    showConfirm.value = false    // Đóng modal xác nhận
}
</script>

<style scoped>
/* Import CSS từ ClientOrderView để giữ nguyên style */
:root {
  --nature-green: #8FA374;
  --nature-green-light: #A4B88D;
  --nature-green-soft: #B8C9A6;
  --nature-green-dark: #6C7A53;
  --earth-brown: #8B7355;
  --earth-brown-light: #A68B6B;
  --earth-brown-dark: #6B5D48;
  --warm-beige: #F5F1E8;
  --success-green: #198754;
  --natural-shadow: rgba(107, 93, 72, 0.15);
}

.nature-bg {
    background: linear-gradient(135deg, var(--warm-beige) 0%, #ffffff 100%);
}

.order-screen {
    min-height: 100vh;
}

/* Header styles */
.order-header-modern {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%);
    border-bottom: 3px solid var(--nature-green-dark);
    color: white;
    padding: 1.5rem 0;
    box-shadow: 0 4px 12px var(--natural-shadow);
    position: relative;
}

.header-back-btn-modern {
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.header-back-btn-modern:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-50%) scale(1.05);
}

.header-title-section {
    text-align: center;
}

.order-title-modern {
    font-size: 2.5rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    letter-spacing: 2px;
}

.order-subtitle-modern {
    font-size: 1.1rem;
    opacity: 0.9;
    font-weight: 400;
    margin-top: 0.5rem;
}

/* Menu area styles */
.menu-scroll {
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
    border-radius: 20px;
}

.menu-list-bg {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px var(--natural-shadow);
}

/* Responsive */
@media (max-width: 768px) {
    .order-title-modern {
        font-size: 2rem;
    }
    
    .order-subtitle-modern {
        font-size: 1rem;
    }
    
    .header-back-btn-modern {
        left: 1rem;
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
}

@media (max-width: 576px) {
    .order-title-modern {
        font-size: 1.5rem;
    }
    
    .order-subtitle-modern {
        font-size: 0.9rem;
    }
}
</style>
