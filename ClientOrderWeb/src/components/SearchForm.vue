<template>
    <div class="card mb-3">
        <div class="card-body">
            <div class="row g-3">
                <slot></slot>

                <!-- Search buttons -->
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex gap-2">
                            <BButton variant="primary" @click="$emit('search')" :disabled="loading" size="sm">
                                <BSpinner v-if="loading" small class="me-2" />
                                {{ searchButtonText }}
                            </BButton>
                            <BButton variant="outline-secondary" @click="$emit('clear')" size="sm">
                                {{ clearButtonText }}
                            </BButton>
                        </div>

                        <!-- Add New Button -->
                        <BButton v-if="showAddButton" variant="success" @click="$emit('add-new')" size="sm">
                            <i class="bi bi-plus-circle me-1"></i>
                            {{ addButtonText }}
                        </BButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BButton, BSpinner } from 'bootstrap-vue-next'

// Props
defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    searchButtonText: {
        type: String,
        default: 'Tìm kiếm'
    },
    clearButtonText: {
        type: String,
        default: 'Xóa điều kiện'
    },
    showAddButton: {
        type: Boolean,
        default: false
    },
    addButtonText: {
        type: String,
        default: 'Thêm mới'
    }
})

// Emits
defineEmits(['search', 'clear', 'add-new'])
</script>
