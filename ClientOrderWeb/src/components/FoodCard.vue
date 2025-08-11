<template>
  <BCard
    class="food-card p-0" 
    @mousedown="isActive = true"
    @mouseup="isActive = false"
    @mouseleave="isActive = false"
    @touchstart="isActive = true"
    @touchend="isActive = false"
    :style="isActive ? 'transform: scale(0.97); box-shadow: 0 4px 16px rgba(0,0,0,0.10);' : ''"
  >
    <div class="d-flex flex-row align-items-stretch">
      <!-- Ảnh bên trái -->
      <div class="d-flex align-items-center">
        <img :src="foodImageUrl" :alt="food.name" class="food-image" />
      </div>
      <!-- Thông tin bên phải -->
      <div class="flex-grow-1 d-flex flex-column justify-content-center">
        <div class="fw-bold fs-5 mb-1">{{ food.name }}</div>
        <div class="text-muted small mb-2">{{ food.description }}</div>
        <div class="text-primary fw-semibold fs-6">{{ formattedPrice }}</div>
      </div>
    </div>
  </BCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrencyVND } from '../utils/currency.js'
// Props: food (object: { name, image, price, description })
const props = defineProps({
  food: {
    type: Object,
    required: true
  }
})
const isActive = ref(false)
// Lấy đường dẫn ảnh từ src/assets
const foodImageUrl = computed(() => {
    if (!props.food.image) return ''
    // Nếu đã là đường dẫn tuyệt đối (http, /), trả về luôn
    if (/^(https?:\/\/|\/)/.test(props.food.image)) return props.food.image
    // Ngược lại, lấy từ assets
    return new URL(`../assets/images/${props.food.image}`, import.meta.url).href
})

// Định dạng tiền VND cho giá món
const formattedPrice = computed(() => formatCurrencyVND(props.food?.price))
</script>

<style scoped>
  .food-card {
    background: var(--nature-green-light);
    border-radius: 14px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    transition: box-shadow 0.15s, transform 0.12s;
    cursor: pointer;
  }
.food-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    background: #f8f9fa;
    border: 1px solid #eee;
}
</style>
