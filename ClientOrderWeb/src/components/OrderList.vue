<template>
  <div>
    <div v-if="orderItems.length === 0" class="text-center text-muted py-3">
      Chưa có món nào được chọn.
    </div>
    <div class="order-list-bg p-3" v-else>
      <table class="table table-sm align-middle mb-2 ">
        <thead>
          <tr>
            <th class="food-th col-6">Tên món</th>
            <th class="food-th text-center col-3">Số lượng</th>
            <th class="food-th text-end col-3">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in orderItems" :key="item.id">
            <td class="food-td col-6">{{ item.name }}</td>
            <td class="food-td text-center col-3">
              <BButton size="sm"  class="me-1 px-2 py-0 btn-nature qty-btn" @click="$emit('decrease', item)">-</BButton>
              <span class="mx-1 qty-value">{{ item.quantity }}</span>
              <BButton size="sm" class="ms-1 px-2 py-0 btn-nature qty-btn" @click="$emit('increase', item)">+</BButton>
            </td>
            <td class="food-td price-td text-end col-3">{{ formatCurrencyVND(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex justify-content-between fw-bold pt-2 mb-3">
        <h5 class="text-black">Tổng tiền</h5>
        <h5 class="text-black">{{ formatCurrencyVND(totalAmount) }}</h5>
      </div>
      <BButton class="w-100 pay-btn" @click="$emit('checkout')">Thanh toán</BButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrencyVND } from '../utils/currency.js'

const props = defineProps({
  orderItems: {
    type: Array,
    required: true
  }
})

const totalAmount = computed(() =>
  props.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
)
</script>

<style scoped>
td.food-td {
    background: var(--nature-green-light);
    font-size: 16px;
}

th.food-th {
    background: var(--nature-green-soft);
    font-size: 16px;
}

.qty-btn {
    font-size: 16px !important;
}

.qty-value {
    display: inline-block;
    min-width: 24px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: 16px;
}

.pay-btn {
  padding-top: 0.75rem;  /* gấp đôi mặc định .btn (0.375rem) */
  padding-bottom: 0.75rem;
  font-size: 20px; /* 20px theo yêu cầu */
  font-weight: 600; /* đậm chữ */
  background-color: var(--success-green);
  border-color: var(--success-green);
  color: #fff;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.pay-btn:hover {
  background-color: #157347; /* success hover mặc định của Bootstrap */
  border-color: #146c43;
  color: #fff;
}
</style>
