<template>
  <div class="screen-button-wrapper">
    <BButton 
      :class="['screen-btn', buttonClass]"
      size="lg"
      :disabled="disabled"
      @click="handleClick"
    >
      <div class="btn-content">
        <div class="btn-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="btn-text">
          <div class="btn-title">{{ title }}</div>
          <div class="btn-desc">{{ description }}</div>
        </div>
      </div>
    </BButton>
  </div>
</template>

<script setup>
const props = defineProps({
  // Tiêu đề nút
  title: {
    type: String,
    required: true
  },
  // Mô tả nút
  description: {
    type: String,
    required: true
  },
  // Class icon (Bootstrap Icons)
  iconClass: {
    type: String,
    required: true
  },
  // Class CSS cho styling nút
  buttonClass: {
    type: String,
    default: ''
  },
  // Trạng thái disabled
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
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

/* Screen Buttons */
.screen-button-wrapper {
  display: flex;
  justify-content: center;
}

.screen-btn {
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 20px;
  box-shadow: 0 8px 20px var(--natural-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 1rem;
}

.screen-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(107, 93, 72, 0.25);
}

.screen-btn:active:not(:disabled) {
  transform: translateY(-2px);
}

.screen-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button Variants */
.screen-btn :deep(.dashboard-btn) {
  background: linear-gradient(135deg, var(--nature-green-dark) 0%, var(--earth-brown) 100%);
  color: white;
}

.screen-btn.dashboard-btn {
  background: linear-gradient(135deg, var(--nature-green-dark) 0%, var(--earth-brown) 100%);
  color: white;
}

.screen-btn.dashboard-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--nature-green) 0%, var(--earth-brown-light) 100%);
}

.screen-btn.caller-btn {
  background: linear-gradient(135deg, var(--success-green) 0%, var(--nature-green) 100%);
  color: white;
}

.screen-btn.caller-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #157347 0%, var(--nature-green-dark) 100%);
}

.screen-btn.order-btn {
  background: linear-gradient(135deg, var(--earth-brown) 0%, var(--earth-brown-dark) 100%);
  color: white;
}

.screen-btn.order-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--earth-brown-light) 0%, var(--earth-brown) 100%);
}

/* Button Content */
.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.btn-icon {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  line-height: 1.2;
}

.btn-desc {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.3;
}

/* Responsive */
@media (max-width: 767px) {
  .screen-btn {
    height: 180px;
    padding: 0.75rem;
  }
  
  .btn-icon {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  .btn-title {
    font-size: 1rem;
  }
  
  .btn-desc {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .screen-btn {
    height: 160px;
    padding: 0.5rem;
  }
  
  .btn-icon {
    font-size: 1.6rem;
    margin-bottom: 0.4rem;
  }
  
  .btn-title {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
  
  .btn-desc {
    font-size: 0.75rem;
    line-height: 1.2;
  }
}
</style>
