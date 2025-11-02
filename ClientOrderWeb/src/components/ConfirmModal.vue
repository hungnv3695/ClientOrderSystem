<template>
    <BModal v-model="isVisible" :title="title" :size="size" @hidden="handleHidden" 
        @show="handleShow" :header-bg-variant="headerVariant" :header-text-variant="headerTextVariant" centered>
        <!-- Modal body content -->
        <div class="modal-body-content">
            <!-- Icon -->
            <div class="text-center mb-3" v-if="showIcon">
                <i :class="iconClass" :style="{ fontSize: '48px', color: iconColor }"></i>
            </div>
            
            <!-- Message -->
            <div class="text-center mb-4">
                <h5 v-if="message" class="mb-2">{{ message }}</h5>
                <p v-if="description" class="text-muted mb-0">{{ description }}</p>
            </div>
            
            <!-- Custom content slot -->
            <slot name="content"></slot>
        </div>

        <!-- Modal footer -->
        <template #footer>
            <div class="d-flex justify-content-center gap-2 w-100">
                <BButton 
                    :variant="confirmVariant" 
                    @click="handleConfirm" 
                    :disabled="loading"
                >
                    <BSpinner v-if="loading" small class="me-2" />
                    {{ confirmText }}
                </BButton>
                <BButton 
                    variant="outline-secondary" 
                    @click="handleCancel" 
                    :disabled="loading"
                >
                    {{ cancelText }}
                </BButton>
            </div>
        </template>
    </BModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { BModal, BButton, BSpinner } from 'bootstrap-vue-next'

// Props
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
        default: 'sm', // sm, md, lg, xl
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

// Computed properties for styling based on type
const iconClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bi bi-check-circle'
        case 'warning':
            return 'bi bi-exclamation-triangle'
        case 'danger':
            return 'bi bi-x-circle'
        case 'info':
            return 'bi bi-info-circle'
        default:
            return 'bi bi-question-circle'
    }
})

const iconColor = computed(() => {
    switch (props.type) {
        case 'success':
            return '#198754'
        case 'warning':
            return '#fd7e14'
        case 'danger':
            return '#dc3545'
        case 'info':
            return '#0dcaf0'
        default:
            return '#6c757d'
    }
})

const confirmVariant = computed(() => {
    switch (props.type) {
        case 'success':
            return 'success'
        case 'warning':
            return 'warning'
        case 'danger':
            return 'danger'
        case 'info':
            return 'info'
        default:
            return 'primary'
    }
})

const headerVariant = computed(() => {
    switch (props.type) {
        case 'danger':
            return 'danger'
        case 'warning':
            return 'warning'
        case 'success':
            return 'success'
        case 'info':
            return 'info'
        default:
            return ''
    }
})

const headerTextVariant = computed(() => {
    return ['danger', 'warning', 'success', 'info'].includes(props.type) ? 'white' : ''
})

// Computed for v-model
const isVisible = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

// Methods
const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
    isVisible.value = false
}

const handleShow = () => {
    emit('show')
}

const handleHidden = () => {
    emit('hidden')
}
</script>

<style scoped>
.modal-body-content {
    padding: 1rem 0;
}

/* Custom icon styles */
.bi {
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    line-height: 1;
}

/* Bootstrap Icons - Add the most common ones */
.bi-check-circle::before { content: "✓"; }
.bi-exclamation-triangle::before { content: "⚠"; }
.bi-x-circle::before { content: "✕"; }
.bi-info-circle::before { content: "ℹ"; }
.bi-question-circle::before { content: "?"; }
</style>
