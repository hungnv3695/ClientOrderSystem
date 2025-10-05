<template>
  <BModal
    v-model="showModal"
    title="Xác nhận đơn hàng"
    size="lg"
    no-footer="true"
    no-close-on-backdrop
    no-close-on-esc
    @hidden="onModalHidden"
  >
    <div class="confirm-modal-content">
      <!-- Header thông tin đơn hàng -->
      <div class="order-summary-header mb-4">
        <h5 class="text-center mb-3">Chi tiết đơn hàng</h5>
      </div>

      <!-- Bảng hiển thị lại đơn hàng -->
      <div class="order-summary-table mb-4">
        <table class="table table-sm">
          <thead>
            <tr>
              <th class="summary-th">Tên món</th>
              <th class="summary-th text-center">SL</th>
              <th class="summary-th text-end">Đơn giá</th>
              <th class="summary-th text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderItems" :key="item.id">
              <td class="summary-td">{{ item.name }}</td>
              <td class="summary-td text-center">{{ item.quantity }}</td>
              <td class="summary-td text-end">{{ formatCurrencyVND(item.price) }}</td>
              <td class="summary-td text-end fw-bold">{{ formatCurrencyVND(item.price * item.quantity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tổng tiền -->
      <div class="total-section mb-4">
        <div class="d-flex justify-content-between align-items-center p-3 total-box">
          <h5 class="mb-0 text-dark">Tổng cộng:</h5>
          <h4 class="mb-0 text-success fw-bold">{{ formatCurrencyVND(totalAmount) }}</h4>
        </div>
      </div>

      <!-- Buttons -->
      <div class="modal-actions d-flex gap-3">
        <BButton 
          variant="secondary" 
          class="flex-fill"
          @click="closeModal"
        >
          Hủy
        </BButton>
        <BButton 
          class="flex-fill payment-btn"
          @click="handlePayment"
        >
          Thanh toán
        </BButton>
      </div>
    </div>
  </BModal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { formatCurrencyVND } from '../utils/currency.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  orderItems: {
    type: Array,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:show', 'payment'])

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const closeModal = () => {
  emit('update:show', false)
}

const handlePayment = () => {
  emit('payment')
  closeModal()
}

const onModalHidden = () => {
  emit('update:show', false)
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

.confirm-modal-content {
  background: linear-gradient(135deg, var(--warm-beige) 0%, #ffffff 100%);
  border-radius: 15px;
  padding: 1rem;
}

.order-summary-header h5 {
  color: var(--earth-brown-dark);
  font-weight: 700;
  font-size: 1.5rem;
}

/* Table styles */
.order-summary-table {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px var(--natural-shadow);
}

.summary-th {
  background: var(--nature-green-soft);
  color: var(--earth-brown-dark);
  font-weight: 600;
  border: none;
  padding: 0.75rem;
  font-size: 0.95rem;
}

.summary-td {
  background: var(--nature-green-light);
  border: none;
  padding: 0.75rem;
  font-size: 0.9rem;
}

/* Total section */
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

/* Button styles */
.modal-actions {
  margin-top: 1.5rem;
}

.payment-btn {
  background: linear-gradient(135deg, var(--success-green) 0%, var(--nature-green-dark) 100%);
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.payment-btn:hover {
  background: linear-gradient(135deg, #157347 0%, var(--nature-green) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--natural-shadow);
}

.payment-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 576px) {
  .confirm-modal-content {
    padding: 0.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    margin-bottom: 0.5rem;
  }
  
  .summary-th,
  .summary-td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .order-summary-header h5 {
    font-size: 1.25rem;
  }
}
</style>
