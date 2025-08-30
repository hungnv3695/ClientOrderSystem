<template>
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ title }}</h6>
            <span class="badge bg-secondary">{{ totalText }}: {{ totalRecords }} {{ recordUnit }}</span>
        </div>
        <div class="card-body p-0 flex-grow-1 overflow-auto" style="min-height: 0;">
            <BTable :items="items" :fields="fields" :busy="loading" striped hover responsive show-empty
                :empty-text="emptyText" class="mb-0" sticky-header="400px">
                <template #table-busy>
                    <div class="text-center my-2">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </template>

                <!-- Forward all named slots to parent -->
                <template v-for="(_, name) in $slots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData" />
                </template>
            </BTable>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
            <small class="text-muted">{{ totalText }}: {{ totalRecords }} {{ recordUnit }}</small>
            <BPagination v-model="currentPageModel" :per-page="perPage" :total-rows="totalRecords" size="sm" align="end"
                @update:model-value="handlePageChange" />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { BTable, BPagination } from 'bootstrap-vue-next'

// Props
const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    fields: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    totalRecords: {
        type: Number,
        required: true
    },
    currentPage: {
        type: Number,
        default: 1
    },
    perPage: {
        type: Number,
        default: 20
    },
    title: {
        type: String,
        default: 'Kết quả tìm kiếm'
    },
    totalText: {
        type: String,
        default: 'Tổng'
    },
    recordUnit: {
        type: String,
        default: 'bản ghi'
    },
    emptyText: {
        type: String,
        default: 'Không có dữ liệu'
    }
})

// Emits
const emit = defineEmits(['update:currentPage', 'page-change'])

// Computed
const currentPageModel = computed({
    get() {
        return props.currentPage
    },
    set(value) {
        emit('update:currentPage', value)
    }
})

// Methods
const handlePageChange = (page) => {
    emit('page-change', page)
}
</script>

<style scoped>
.card {
    border: 1px solid #dee2e6;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}
</style>
