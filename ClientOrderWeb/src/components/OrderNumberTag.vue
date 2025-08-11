<template>
  <div
    class="order-number-tab-box"
    :style="{ color: 'white', backgroundColor }"
  >
    {{ number }}
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  number: {
    type: [Number, String],
    required: true
  },
  enabled: {
    type: Boolean,
    default: false,
  },
})

const backgroundColor = computed(() =>
  props.enabled ? 'var(--nature-green-light)' : 'var(--nature-green)'
)
</script>

<style scoped>
.order-number-tab-box {
  min-width: 60px;
  min-height: 50px;
  font-size: 1.3rem;
  border-radius: 8px;
  margin: 4px;
  box-shadow: 0 2px 8px #0001;
  background: #ffffff;
  border: 2px solid var(--nature-green-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: x-large;
  color: #222; /* đảm bảo tương phản trên nền trắng */
}
</style>
