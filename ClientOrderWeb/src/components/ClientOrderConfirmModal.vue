<template>
    <ConfirmModal
        :model-value="modelValue"
        :title="title"
        :message="message"
        :description="description"
        :type="type"
        :size="size"
        :confirm-text="confirmText"
        :cancel-text="cancelText"
        :loading="loading"
        :show-icon="showIcon"
        @update:model-value="$emit('update:modelValue', $event)"
        @confirm="$emit('confirm')"
        @cancel="$emit('cancel')"
        @show="$emit('show')"
        @hidden="$emit('hidden')"
        :class="`client-order-modal client-order-modal-${type}`"
    >
        <!-- Pass through custom content slot if provided -->
        <template #content>
            <slot name="content"></slot>
        </template>
    </ConfirmModal>
</template>

<script setup>
import ConfirmModal from './ConfirmModal.vue'

// Props - inherit all from parent ConfirmModal
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Xác nhận'
    },
    message: {
        type: String,
        default: 'Bạn có chắc chắn muốn thực hiện thao tác này?'
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'warning', // success, warning, danger, info
        validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
    },
    size: {
        type: String,
        default: 'md',
    },
    confirmText: {
        type: String,
        default: 'Xác nhận'
    },
    cancelText: {
        type: String,
        default: 'Hủy'
    },
    loading: {
        type: Boolean,
        default: false
    },
    showIcon: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'show', 'hidden'])
</script>

<style>
/* Import color variables from app */
@import '../assets/css/color.css';

/* ===== CLIENT ORDER MODAL CUSTOM STYLING ===== */

/* Modal backdrop with nature theme */
.client-order-modal .modal-backdrop {
    backdrop-filter: blur(8px);
    background-color: rgba(45, 80, 22, 0.4) !important;
}

/* Modal dialog container */
.client-order-modal .modal-dialog {
    filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.3));
    max-width: 550px !important; /* Tăng chiều ngang từ default 500px lên 550px */
}

/* Modal content - natural border and background */
.client-order-modal .modal-content {
    border: 3px solid var(--nature-green-light) !important;
    border-radius: 20px !important;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--cream-white) 0%, #f8f9f0 100%) !important;
}

/* ===== HEADER STYLING BY TYPE ===== */

/* Warning Type - Nature green with warning accent */
.client-order-modal-warning .modal-header {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%) !important;
    border-bottom: 3px solid var(--nature-green-dark) !important;
    padding: 1rem 1.5rem !important; /* Giảm padding từ 1.25rem xuống 1rem */
}

.client-order-modal-warning .modal-title {
    color: var(--earth-brown-dark) !important;
    font-size: 1.35rem !important; /* Giảm từ 1.5rem xuống 1.35rem */
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

/* Danger Type - Nature green with danger emphasis */
.client-order-modal-danger .modal-header {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%) !important;
    border-bottom: 3px solid #dc2626 !important;
    padding: 1rem 1.5rem !important; /* Giảm padding từ 1.25rem xuống 1rem */
}

.client-order-modal-danger .modal-title {
    color: #dc2626 !important;
    font-size: 1.35rem !important; /* Giảm từ 1.5rem xuống 1.35rem */
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(220, 38, 38, 0.1) !important;
}

/* Success Type - Pure nature green tones */
.client-order-modal-success .modal-header {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%) !important;
    border-bottom: 3px solid var(--nature-green-dark) !important;
    padding: 1rem 1.5rem !important; /* Giảm padding từ 1.25rem xuống 1rem */
}

.client-order-modal-success .modal-title {
    color: var(--nature-green-dark) !important;
    font-size: 1.35rem !important; /* Giảm từ 1.5rem xuống 1.35rem */
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(45, 80, 22, 0.15) !important;
}

/* Info Type - Nature green with info accent */
.client-order-modal-info .modal-header {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-soft) 100%) !important;
    border-bottom: 3px solid var(--nature-green-dark) !important;
    padding: 1rem 1.5rem !important; /* Giảm padding từ 1.25rem xuống 1rem */
}

.client-order-modal-info .modal-title {
    color: var(--earth-brown-dark) !important;
    font-size: 1.35rem !important; /* Giảm từ 1.5rem xuống 1.35rem */
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

/* ===== BODY CONTENT STYLING ===== */

.client-order-modal .modal-body {
    padding: 1.25rem 1.5rem !important; /* Giảm padding từ 2rem xuống 1.25rem */
    background: var(--cream-white) !important;
}

/* Override spacing from parent ConfirmModal */
.client-order-modal .modal-body-content .text-center.mb-3 {
    margin-bottom: 0.75rem !important; /* Icon spacing - compact hơn */
}

.client-order-modal .modal-body-content .text-center.mb-4 {
    margin-bottom: 0.75rem !important; /* Message container spacing - compact hơn */
}

.client-order-modal .modal-body h5 {
    font-size: 1.15rem !important; /* Giảm từ 1.25rem xuống 1.15rem */
    font-weight: 600 !important;
    color: var(--earth-brown-dark) !important;
    line-height: 1.4 !important;
    margin-bottom: 0.5rem !important;
}

.client-order-modal .modal-body p {
    font-size: 0.95rem !important; /* Giảm từ 1rem xuống 0.95rem */
    color: var(--earth-brown) !important;
    line-height: 1.5 !important;
    margin-bottom: 0 !important;
}

/* Icon styling */
.client-order-modal .modal-body i {
    font-size: 48px !important; /* Giảm từ 64px xuống 48px */
    margin-bottom: 0.75rem !important;
}

/* ===== BUTTON STYLING ===== */

/* Button container */
.client-order-modal .modal-footer {
    padding: 0.875rem 1.5rem 1rem !important; /* Giảm padding từ 1rem 1.5rem 1.5rem */
    border-top: 2px solid var(--nature-green-light) !important;
    background: linear-gradient(to top, var(--nature-green-light) 0%, var(--cream-white) 100%) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
}

.client-order-modal .modal-footer > div {
    width: 100% !important;
    max-width: 400px !important;
}

.client-order-modal .modal-footer .d-flex {
    gap: 1rem !important;
    flex-wrap: nowrap !important;
}

/* Base button styling - optimized for touch */
.client-order-modal .modal-footer .btn {
    flex: 1 1 0 !important;
    max-width: 180px !important;
    min-height: 50px !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    border-radius: 12px !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.3s ease !important;
    letter-spacing: 0.3px !important;
    border-width: 2px !important;
    border-style: solid !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* Confirm button - nature green gradient */
.client-order-modal .modal-footer .btn-success,
.client-order-modal .modal-footer .btn-warning,
.client-order-modal .modal-footer .btn-danger,
.client-order-modal .modal-footer .btn-info,
.client-order-modal .modal-footer .btn-primary {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Success confirm button */
.client-order-modal .modal-footer .btn-success {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-dark) 100%) !important;
    border-color: var(--nature-green-dark) !important;
    color: var(--cream-white) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.client-order-modal .modal-footer .btn-success:hover {
    background: linear-gradient(135deg, var(--nature-green-dark) 0%, #2d5016 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(45, 80, 22, 0.4) !important;
}

.client-order-modal .modal-footer .btn-success:active {
    transform: translateY(0) !important;
}

/* Warning confirm button - nature green with subtle warning accent */
.client-order-modal .modal-footer .btn-warning {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-dark) 100%) !important;
    border-color: var(--nature-green-dark) !important;
    color: var(--cream-white) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.client-order-modal .modal-footer .btn-warning:hover {
    background: linear-gradient(135deg, var(--nature-green-dark) 0%, #2d5016 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(45, 80, 22, 0.4) !important;
}

.client-order-modal .modal-footer .btn-warning:active {
    transform: translateY(0) !important;
}

/* Danger confirm button - strong red for destructive actions */
.client-order-modal .modal-footer .btn-danger {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    border-color: #991b1b !important;
    color: white !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.client-order-modal .modal-footer .btn-danger:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4) !important;
}

.client-order-modal .modal-footer .btn-danger:active {
    transform: translateY(0) !important;
}

/* Info confirm button - nature green style */
.client-order-modal .modal-footer .btn-info {
    background: linear-gradient(135deg, var(--nature-green) 0%, var(--nature-green-dark) 100%) !important;
    border-color: var(--nature-green-dark) !important;
    color: var(--cream-white) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.client-order-modal .modal-footer .btn-info:hover {
    background: linear-gradient(135deg, var(--nature-green-dark) 0%, #2d5016 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(45, 80, 22, 0.4) !important;
}

.client-order-modal .modal-footer .btn-info:active {
    transform: translateY(0) !important;
}

/* Cancel button - earth tone outline */
.client-order-modal .modal-footer .btn-outline-secondary {
    background: white !important;
    border-color: var(--earth-brown) !important;
    color: var(--earth-brown-dark) !important;
    font-weight: 600 !important;
}

.client-order-modal .modal-footer .btn-outline-secondary:hover {
    background: var(--earth-brown) !important;
    border-color: var(--earth-brown-dark) !important;
    color: white !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(101, 67, 33, 0.3) !important;
}

.client-order-modal .modal-footer .btn-outline-secondary:active {
    transform: translateY(0) !important;
}

/* Loading spinner */
.client-order-modal .modal-footer .btn .spinner-border {
    width: 1rem !important;
    height: 1rem !important;
    margin-right: 0.5rem !important;
}

/* ===== RESPONSIVE ADJUSTMENTS ===== */

@media (max-width: 768px) {
    .client-order-modal .modal-header {
        padding: 1rem 1.25rem !important;
    }
    
    .client-order-modal .modal-title {
        font-size: 1.3rem !important;
    }
    
    .client-order-modal .modal-body {
        padding: 1.5rem 1.25rem !important;
    }
    
    .client-order-modal .modal-body h5 {
        font-size: 1.1rem !important;
    }
    
    .client-order-modal .modal-body p {
        font-size: 0.95rem !important;
    }
    
    .client-order-modal .modal-body i {
        font-size: 48px !important;
    }
    
    .client-order-modal .modal-footer {
        padding: 0.75rem 1rem 1rem !important;
    }
    
    .client-order-modal .modal-footer .btn {
        min-height: 44px !important;
        font-size: 0.95rem !important;
        padding: 0.6rem 0.85rem !important;
    }
}

/* ===== ANIMATION ENHANCEMENTS ===== */

.client-order-modal .modal.show .modal-dialog {
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Close button styling */
.client-order-modal .btn-close {
    font-size: 1.2rem !important;
    opacity: 0.8 !important;
    filter: brightness(0) invert(1);
}

.client-order-modal .btn-close:hover {
    opacity: 1 !important;
}
</style>
