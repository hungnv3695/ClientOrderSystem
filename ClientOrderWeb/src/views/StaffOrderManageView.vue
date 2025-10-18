<template>
  <!-- Màn hình quản lý đơn hàng cho nhân viên -->
  <BContainer fluid class="min-vh-100 d-flex flex-column nature-bg order-manage-screen">
    <!-- Header với nút back và title -->
    <BRow class="order-header-modern align-items-center">
      <BCol class="position-relative text-center">
        <BButton class="header-back-btn-modern" @click="navigateBack" title="Quay lại">
          <i class="bi bi-arrow-left"></i>
        </BButton>
        <div class="header-title-section">
          <h1 class="order-title-modern m-0">DANH SÁCH ĐƠN HÀNG</h1>
          <p class="order-subtitle-modern m-0">Quản lý và theo dõi đơn hàng</p>
        </div>
      </BCol>
    </BRow>

    <!-- Main content area -->
    <BRow class="nature-bg flex-grow-1 h-100 pt-3 pb-3" style="min-height:0;">
      <!-- Danh sách order (Bên trái) -->
      <BCol cols="7" class="d-flex flex-column h-100">
        <div class="order-list-section menu-list-bg flex-grow-1">
          <!-- Phần filter -->
          <div class="filter-section mb-3">
            <h5 class="filter-title mb-3">Bộ lọc tìm kiếm</h5>
            
            <BRow class="mb-3">
              <!-- Mã đơn hàng -->
              <BCol cols="6">
                <BFormGroup label="Mã đơn hàng" label-for="order-code">
                  <BFormInput 
                    id="order-code"
                    v-model="filters.orderCode"
                    placeholder="Nhập mã đơn hàng"
                  />
                </BFormGroup>
              </BCol>
              
              <!-- Trạng thái đơn hàng -->
              <BCol cols="6">
                <BFormGroup label="Trạng thái đơn hàng" label-for="order-status">
                  <BFormSelect 
                    id="order-status"
                    v-model="filters.orderStatus"
                    :options="orderStatusOptions"
                  />
                </BFormGroup>
              </BCol>
            </BRow>

            <BRow class="mb-3">
              <!-- Trạng thái thanh toán -->
              <BCol cols="6">
                <BFormGroup label="Trạng thái thanh toán" label-for="payment-status">
                  <BFormSelect 
                    id="payment-status"
                    v-model="filters.paymentStatus"
                    :options="paymentStatusOptions"
                  />
                </BFormGroup>
              </BCol>
              
              <!-- Ngày tạo (Từ) -->
              <BCol cols="6">
                <BFormGroup label="Ngày tạo (Từ)" label-for="date-from">
                  <BFormInput 
                    id="date-from"
                    v-model="filters.dateFrom"
                    type="datetime-local"
                  />
                </BFormGroup>
              </BCol>
            </BRow>

            <BRow class="mb-3">
              <!-- Ngày tạo (Đến) -->
              <BCol cols="6">
                <BFormGroup label="Ngày tạo (Đến)" label-for="date-to">
                  <BFormInput 
                    id="date-to"
                    v-model="filters.dateTo"
                    type="datetime-local"
                  />
                </BFormGroup>
              </BCol>
              
              <!-- Buttons -->
              <BCol cols="6" class="d-flex align-items-end">
                <div class="filter-buttons d-flex gap-2 w-100">
                  <BButton 
                    variant="primary" 
                    class="search-btn flex-fill"
                    @click="searchOrders"
                  >
                    <i class="bi bi-search me-1"></i>
                    Tìm kiếm
                  </BButton>
                  <BButton 
                    variant="secondary" 
                    class="clear-btn flex-fill"
                    @click="clearFilters"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Xóa
                  </BButton>
                </div>
              </BCol>
            </BRow>
          </div>

          <!-- Bảng danh sách đơn hàng -->
          <div class="order-table-section flex-grow-1">
            <div class="table-container">
              <BTable
                :items="orders"
                :fields="orderFields"
                :busy="isLoading"
                :per-page="perPage"
                :current-page="currentPage"
                striped
                hover
                responsive
                small
                class="order-table"
                tbody-tr-class="order-row"
                @row-clicked="selectOrder"
              >
                <template #cell(index)="data">
                  {{ (currentPage - 1) * perPage + data.index + 1 }}
                </template>
                
                <template #cell(totalAmount)="data">
                  {{ formatCurrencyVND(data.item.totalAmount) }}
                </template>
                
                <template #cell(orderStatus)="data">
                  <BBadge :variant="getOrderStatusVariant(data.item.orderStatus)">
                    {{ getOrderStatusText(data.item.orderStatus) }}
                  </BBadge>
                </template>
                
                <template #cell(paymentStatus)="data">
                  <BBadge :variant="getPaymentStatusVariant(data.item.paymentStatus)">
                    {{ getPaymentStatusText(data.item.paymentStatus) }}
                  </BBadge>
                </template>
                
                <template #cell(createdAt)="data">
                  {{ formatDateTime(data.item.createdAt) }}
                </template>

                <template #table-busy>
                  <div class="text-center text-danger my-2">
                    <BSpinner class="align-middle"></BSpinner>
                    <strong> Đang tải...</strong>
                  </div>
                </template>
              </BTable>
            </div>

            <!-- Phân trang -->
            <div class="pagination-section d-flex justify-content-between align-items-center mt-3">
              <div class="pagination-info">
                <small class="text-muted">
                  Hiển thị {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, totalRows) }} 
                  của {{ totalRows }} đơn hàng
                </small>
              </div>
              <BPagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                size="sm"
                class="mb-0"
              />
            </div>
          </div>
        </div>
      </BCol>

      <!-- Chi tiết đơn hàng (Bên phải) -->
      <BCol cols="5" class="h-100 d-flex flex-column">
        <div class="order-detail-section menu-list-bg flex-grow-1">
          <div v-if="!selectedOrder" class="no-selection-message">
            <div class="text-center text-muted py-5">
              <i class="bi bi-receipt-cutoff display-1 mb-3"></i>
              <h5>Chọn đơn hàng để xem chi tiết</h5>
              <p>Nhấp vào một đơn hàng trong danh sách để xem thông tin chi tiết</p>
            </div>
          </div>

          <div v-else class="order-detail-content">
            <!-- Header chi tiết -->
            <div class="detail-header d-flex justify-content-between align-items-center mb-4">
              <h5 class="detail-title mb-0">Chi tiết đơn hàng {{ selectedOrder.orderCode }}</h5>
              <BButton 
                :variant="isEditing ? 'success' : 'warning'"
                size="sm"
                @click="toggleEdit"
              >
                <i :class="isEditing ? 'bi bi-check-lg' : 'bi bi-pencil-square'"></i>
                {{ isEditing ? 'Lưu' : 'Chỉnh sửa' }}
              </BButton>
            </div>

            <!-- Thông tin đơn hàng -->
            <div class="order-info-section mb-4">
              <!-- Mã đơn hàng -->
              <BFormGroup label="Mã đơn hàng" label-for="detail-order-code" class="mb-3">
                <BFormInput 
                  id="detail-order-code"
                  :value="selectedOrder.orderCode"
                  readonly
                  class="readonly-input"
                />
              </BFormGroup>

              <!-- Trạng thái đơn hàng -->
              <BFormGroup label="Trạng thái" label-for="detail-order-status" class="mb-3">
                <BFormSelect 
                  id="detail-order-status"
                  v-model="editableOrder.orderStatus"
                  :options="orderStatusOptions"
                  :disabled="!isEditing"
                  :class="{ 'readonly-input': !isEditing }"
                />
              </BFormGroup>

              <!-- Trạng thái thanh toán -->
              <BFormGroup label="Thanh toán" label-for="detail-payment-status" class="mb-3">
                <BFormSelect 
                  id="detail-payment-status"
                  v-model="editableOrder.paymentStatus"
                  :options="paymentStatusOptions"
                  :disabled="!isEditing"
                  :class="{ 'readonly-input': !isEditing }"
                />
              </BFormGroup>
            </div>

            <!-- Danh sách món -->
            <div class="order-items-section">
              <h6 class="items-title mb-3">Danh sách món</h6>
              <BTable
                :items="selectedOrder.items"
                :fields="itemFields"
                small
                class="items-table"
              >
                <template #cell(index)="data">
                  {{ data.index + 1 }}
                </template>
                
                <template #cell(price)="data">
                  {{ formatCurrencyVND(data.item.price) }}
                </template>
                
                <template #cell(total)="data">
                  {{ formatCurrencyVND(data.item.price * data.item.quantity) }}
                </template>
              </BTable>
              
              <!-- Tổng tiền -->
              <div class="total-section mt-3">
                <div class="d-flex justify-content-between align-items-center p-3 total-box">
                  <h6 class="mb-0 text-dark">Tổng tiền:</h6>
                  <h5 class="mb-0 text-success fw-bold">{{ formatCurrencyVND(selectedOrder.totalAmount) }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentShop, isAuthenticated } from '../services/AuthService.js'
import { formatCurrencyVND } from '../utils/currency.js'
import { formatDateTime } from '../utils/dateTime.js'
import { ORDER_STATUS, PAYMENT_STATUS, API_STATUS_CODES } from '../constants/app.constants.js'
import { CLIENT_ORDER_ALERT_MESS } from '../constants/msg.constants.js'

const router = useRouter()

// ===== REACTIVE VARIABLES =====

/** Danh sách đơn hàng */
const orders = ref([])

/** Đơn hàng được chọn */
const selectedOrder = ref(null)

/** Đơn hàng có thể chỉnh sửa */
const editableOrder = reactive({
  orderStatus: '',
  paymentStatus: ''
})

/** Trạng thái loading */
const isLoading = ref(false)

/** Trạng thái chỉnh sửa */
const isEditing = ref(false)

/** Phân trang */
const currentPage = ref(1)
const perPage = ref(20)
const totalRows = ref(0)

/** Bộ lọc tìm kiếm */
const filters = reactive({
  orderCode: '',
  orderStatus: ORDER_STATUS.RECEIVED, // Mặc định: Đã nhận
  paymentStatus: '', // Mặc định: Tất cả
  dateFrom: getTodayStart(), // Mặc định: Hôm nay
  dateTo: ''
})

// ===== CONSTANTS =====

/** URL đường dẫn trang đăng nhập */
const URL_LOGIN = '/login'

/** Cấu hình cột bảng đơn hàng */
const orderFields = [
  { key: 'index', label: 'STT', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'orderCode', label: 'Mã đơn hàng', sortable: true },
  { key: 'totalAmount', label: 'Tổng tiền', thClass: 'text-end', tdClass: 'text-end' },
  { key: 'orderStatus', label: 'Trạng thái đơn', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'paymentStatus', label: 'Thanh toán', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'createdAt', label: 'Ngày tạo', sortable: true }
]

/** Cấu hình cột bảng món ăn */
const itemFields = [
  { key: 'index', label: 'STT', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'name', label: 'Tên món' },
  { key: 'quantity', label: 'SL', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'price', label: 'Đơn giá', thClass: 'text-end', tdClass: 'text-end' },
  { key: 'total', label: 'Thành tiền', thClass: 'text-end', tdClass: 'text-end' }
]

/** Options cho trạng thái đơn hàng */
const orderStatusOptions = [
  { value: '', text: 'Tất cả trạng thái' },
  { value: ORDER_STATUS.RECEIVED, text: 'Đã nhận' },
  { value: ORDER_STATUS.PROCESSING, text: 'Đang thực hiện' },
  { value: ORDER_STATUS.COMPLETED, text: 'Hoàn thành' },
  { value: ORDER_STATUS.DELIVERED, text: 'Đã giao' }
]

/** Options cho trạng thái thanh toán */
const paymentStatusOptions = [
  { value: '', text: 'Tất cả trạng thái' },
  { value: PAYMENT_STATUS.UNPAID, text: 'Chưa thanh toán' },
  { value: PAYMENT_STATUS.PAID, text: 'Đã thanh toán' }
]

// ===== COMPUTED PROPERTIES =====

// ===== LIFECYCLE HOOKS =====

/**
 * Khởi tạo component và load dữ liệu
 */
onMounted(async () => {
  // Kiểm tra xác thực
  if (!isAuthenticated()) {
    window.location.href = URL_LOGIN
    return
  }
  
  // Load dữ liệu ban đầu
  await searchOrders()
})

// ===== WATCHERS =====

/**
 * Watch selectedOrder để cập nhật editableOrder
 */
watch(selectedOrder, (newOrder) => {
  if (newOrder) {
    editableOrder.orderStatus = newOrder.orderStatus
    editableOrder.paymentStatus = newOrder.paymentStatus
  }
}, { immediate: true })

// ===== FUNCTIONS =====

/**
 * Sự kiện 1: Quay lại màn hình StaffScreenView
 */
function navigateBack() {
  router.push({ name: 'StaffScreen' })
}

/**
 * Sự kiện 2: Tìm kiếm đơn hàng theo điều kiện filter
 */
async function searchOrders() {
  isLoading.value = true
  
  try {
    const shopCode = getCurrentShop()
    if (!shopCode) {
      alert(CLIENT_ORDER_ALERT_MESS.SHOP_CODE_NOT_FOUND)
      return
    }

    // // Gọi API tìm kiếm đơn hàng
    // const response = await searchOrdersForStaff({
    //   ...filters,
    //   shopCode,
    //   page: currentPage.value,
    //   limit: perPage.value
    // })
    
    orders.value = response.data
    totalRows.value = response.total
    
  } catch (error) {
    console.error('Failed to search orders:', error)
    
    if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED || error.response?.status === API_STATUS_CODES.FORBIDDEN) {
      return // Để AuthService tự động chuyển hướng
    }
    
    alert('Tìm kiếm đơn hàng thất bại: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

/**
 * Sự kiện 3: Xóa toàn bộ filter
 */
function clearFilters() {
  filters.orderCode = ''
  filters.orderStatus = ORDER_STATUS.RECEIVED
  filters.paymentStatus = ''
  filters.dateFrom = getTodayStart()
  filters.dateTo = ''
}

/**
 * Sự kiện 4: Toggle chế độ chỉnh sửa
 */
function toggleEdit() {
  if (isEditing.value) {
    // Lưu thay đổi
    saveOrderChanges()
  } else {
    // Bật chế độ chỉnh sửa
    isEditing.value = true
  }
}

/**
 * Lưu thay đổi thông tin đơn hàng
 */
async function saveOrderChanges() {

}

/**
 * Chọn đơn hàng để xem chi tiết
 */
function selectOrder(order) {
  selectedOrder.value = order
  isEditing.value = false
}

/**
 * Lấy màu sắc cho trạng thái đơn hàng
 */
function getOrderStatusVariant(status) {
  const variants = {
    [ORDER_STATUS.RECEIVED]: 'info',
    [ORDER_STATUS.PROCESSING]: 'warning',
    [ORDER_STATUS.COMPLETED]: 'success',
    [ORDER_STATUS.DELIVERED]: 'primary'
  }
  return variants[status] || 'secondary'
}

/**
 * Lấy text hiển thị cho trạng thái đơn hàng
 */
function getOrderStatusText(status) {
  const texts = {
    [ORDER_STATUS.RECEIVED]: 'Đã nhận',
    [ORDER_STATUS.PROCESSING]: 'Đang thực hiện',
    [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
    [ORDER_STATUS.DELIVERED]: 'Đã giao'
  }
  return texts[status] || status
}

/**
 * Lấy màu sắc cho trạng thái thanh toán
 */
function getPaymentStatusVariant(status) {
  return status === PAYMENT_STATUS.PAID ? 'success' : 'danger'
}

/**
 * Lấy text hiển thị cho trạng thái thanh toán
 */
function getPaymentStatusText(status) {
  return status === PAYMENT_STATUS.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'
}

/**
 * Lấy ngày bắt đầu hôm nay (yyyy-MM-ddT00:00)
 */
function getTodayStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().slice(0, 16) // Format: yyyy-MM-ddTHH:mm
}

// ===== HELPER FUNCTIONS =====
</script>

<style scoped>
/* Import CSS từ StaffOrderView để giữ nguyên style */
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

.order-manage-screen {
    min-height: 100vh;
}

/* Header styles - giống StaffOrderView */
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

/* Main content styles */
.order-list-section,
.order-detail-section {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px var(--natural-shadow);
    border-radius: 20px;
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
}

.menu-list-bg {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px var(--natural-shadow);
}

/* Filter section */
.filter-section {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 15px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.filter-title {
    color: var(--earth-brown-dark);
    font-weight: 600;
    margin-bottom: 1rem;
}

.search-btn {
    background: linear-gradient(135deg, var(--success-green) 0%, var(--nature-green-dark) 100%);
    border: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.search-btn:hover {
    background: linear-gradient(135deg, #157347 0%, var(--nature-green) 100%);
    transform: translateY(-2px);
}

.clear-btn {
    background: linear-gradient(135deg, var(--earth-brown) 0%, var(--earth-brown-dark) 100%);
    border: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.clear-btn:hover {
    background: linear-gradient(135deg, var(--earth-brown-light) 0%, var(--earth-brown) 100%);
    transform: translateY(-2px);
}

/* Table styles */
.table-container {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px var(--natural-shadow);
    max-height: 400px;
    overflow-y: auto;
}

.order-table {
    margin-bottom: 0;
}

.order-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.order-row:hover {
    background-color: var(--nature-green-soft) !important;
}

/* Order detail styles */
.no-selection-message {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.detail-header {
    border-bottom: 2px solid var(--nature-green-soft);
    padding-bottom: 1rem;
}

.detail-title {
    color: var(--earth-brown-dark);
    font-weight: 600;
}

.readonly-input {
    background-color: #f8f9fa !important;
    opacity: 0.8;
}

.items-title {
    color: var(--earth-brown-dark);
    font-weight: 600;
    border-bottom: 1px solid var(--nature-green-soft);
    padding-bottom: 0.5rem;
}

.items-table {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
}

.total-section {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--natural-shadow);
}

.total-box {
    background: linear-gradient(135deg, var(--nature-green-light) 0%, var(--nature-green-soft) 100%);
    border-radius: 8px;
    border: 2px solid var(--nature-green);
}

/* Pagination */
.pagination-section {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    padding: 0.75rem 1rem;
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
    
    .filter-section {
        padding: 1rem;
    }
    
    .order-list-section,
    .order-detail-section {
        padding: 1rem;
    }
}

@media (max-width: 576px) {
    .order-title-modern {
        font-size: 1.5rem;
    }
    
    .order-subtitle-modern {
        font-size: 0.9rem;
    }
    
    .filter-buttons {
        flex-direction: column;
    }
    
    .filter-buttons .btn {
        margin-bottom: 0.5rem;
    }
}
</style>
