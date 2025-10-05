<template>
  <div class="staff-screen-container">
    <!-- Header -->
    <div class="header-section">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="header-title">Màn hình nhân viên</h1>
            <p class="header-subtitle">Chọn chức năng để tiếp tục</p>
            <div class="shop-info" v-if="currentShopCode">
              <span class="shop-label">Cửa hàng:</span>
              <span class="shop-code">{{ currentShopCode }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="screen-buttons-grid">
              
              <!-- Dashboard đơn hàng -->
              <FunctionScreenButton
                title="Dashboard đơn hàng"
                description="Theo dõi và quản lý đơn hàng"
                icon-class="bi bi-graph-up"
                button-class="dashboard-btn"
                @click="navigateToOrderDashboard"
              />

              <!-- Màn hình caller đơn hàng -->
              <FunctionScreenButton
                title="Màn hình caller đơn hàng"
                description="Gọi số và thông báo đơn hàng"
                icon-class="bi bi-megaphone"
                button-class="caller-btn"
                @click="navigateToOrderCaller"
              />

              <!-- Màn hình đặt món -->
              <FunctionScreenButton
                title="Màn hình đặt món"
                description="Tạo đơn hàng mới"
                icon-class="bi bi-cup-hot"
                button-class="order-btn"
                @click="navigateToStaffOrder"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentShop } from '../services/AuthService.js'
import FunctionScreenButton from '../components/FunctionScreenButton.vue'
import { SCREEN } from '../constants/app.constants.js'

const router = useRouter()
const currentShopCode = ref(null)

// Lấy shopCode hiện tại
onMounted(() => {
  currentShopCode.value = getCurrentShop()
  console.log('Current shop code:', currentShopCode.value)
})

// Sự kiện 1: Navigate to OrderDashboard
const navigateToOrderDashboard = () => {
  if (currentShopCode.value) {
    router.push({
      name: SCREEN.ORDER_DASHBOARD.NAME,
      query: { shopCode: currentShopCode.value }
    })
  } else {
    console.error('No shopCode available for navigation')
    alert('Không thể xác định cửa hàng. Vui lòng đăng nhập lại.')
  }
}

// Sự kiện 2: Navigate to OrderCaller
const navigateToOrderCaller = () => {
  if (currentShopCode.value) {
    router.push({
      name: SCREEN.ORDER_CALLER.NAME,
      query: { shopCode: currentShopCode.value }
    })
  } else {
    console.error('No shopCode available for navigation')
    alert('Không thể xác định cửa hàng. Vui lòng đăng nhập lại.')
  }
}

// Sự kiện 3: Navigate to StaffOrder
const navigateToStaffOrder = () => {
  if (currentShopCode.value) {
    router.push({
      name: SCREEN.STAFF_ORDER.NAME,
      query: { shopCode: currentShopCode.value }
    })
  } else {
    console.error('No shopCode available for navigation')
    alert('Không thể xác định cửa hàng. Vui lòng đăng nhập lại.')
  }
}
</script>

<style scoped>
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

.staff-screen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--warm-beige) 0%, #ffffff 100%);
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%);
  border-bottom: 3px solid var(--nature-green-dark);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 12px var(--natural-shadow);
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  opacity: 0.95;
  font-weight: 400;
}

.shop-info {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.shop-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.shop-code {
  font-weight: 700;
  font-size: 1.1rem;
}

/* Content Section */
.content-section {
  padding: 3rem 0;
}

.screen-buttons-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .screen-buttons-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .screen-buttons-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Button Grid Layout */

/* Button Variants */
.dashboard-btn {
  background: linear-gradient(135deg, var(--nature-green-dark) 0%, var(--earth-brown) 100%);
  color: white;
}

.dashboard-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--nature-green) 0%, var(--earth-brown-light) 100%);
}

.caller-btn {
  background: linear-gradient(135deg, var(--success-green) 0%, var(--nature-green) 100%);
  color: white;
}

.caller-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #157347 0%, var(--nature-green-dark) 100%);
}

.order-btn {
  background: linear-gradient(135deg, var(--earth-brown) 0%, var(--earth-brown-dark) 100%);
  color: white;
}

.order-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--earth-brown-light) 0%, var(--earth-brown) 100%);
}



/* Responsive */
@media (max-width: 767px) {
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 2rem 0;
  }
  
  .screen-buttons-grid {
    gap: 1.5rem;
    padding: 0 1rem;
  }
}
</style>
