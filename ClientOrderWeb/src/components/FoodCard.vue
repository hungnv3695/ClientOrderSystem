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
        <div class="food-name fw-bold fs-5 mb-1">{{ food.name }}</div>
        <div class="food-description small mb-2">{{ food.description }}</div>
        <div class="food-price fw-semibold fs-6">{{ formattedPrice }}</div>
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
    border-radius: 16px;
    border: 1px solid rgba(107, 93, 72, 0.15);
    box-shadow: 0 4px 12px var(--natural-shadow);
    transition: all 0.2s ease-out;
    cursor: pointer;
    padding: 12px;
  }

  .food-card:hover {
    box-shadow: 0 6px 20px var(--natural-shadow);
    transform: translateY(-2px);
  }

.food-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 12px;
    background: var(--warm-beige);
    border: 1px solid rgba(139, 115, 85, 0.2);
    box-shadow: 0 2px 8px rgba(107, 93, 72, 0.1);
}

/* Natural style text colors */
.food-name {
    color: var(--earth-brown-dark); /* #6B5D48 - nâu đậm cho tiêu đề */
    font-weight: 600;
    letter-spacing: 0.3px;
}

.food-description {
    color: var(--earth-brown); /* #8B7355 - nâu trung bình cho mô tả */
    opacity: 0.9;
    line-height: 1.4;
}

.food-price {
    color: var(--nature-green-dark); /* #6C7A53 - xanh đậm cho giá */
    font-weight: 600;
    letter-spacing: 0.5px;
}
</style>
