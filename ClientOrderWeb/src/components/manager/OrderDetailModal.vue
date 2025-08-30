<template>
    <BModal v-model="show" title="Chi tiết đơn hàng" size="lg" ok-only ok-title="OK">
        <div class="row g-2">
            <div class="col-12 col-md-6">
                <label class="form-label">Order number</label>
                <BFormInput :value="order?.orderNumber ?? ''" readonly />
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label">Status</label>
                <BFormInput :value="order?.status ?? ''" readonly />
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label">Payment Status</label>
                <BFormInput :value="order?.paymentStatus ?? ''" readonly />
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label">Total</label>
                <BFormInput :value="formatCurrencyVND(order?.totalPrice ?? 0)" readonly />
            </div>
            <div class="col-12 col-md-9">
                <label class="form-label">Note</label>
                <BFormInput :value="order?.note ?? ''" readonly />
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label">Created at</label>
                <BFormInput :value="formatDateTime(order?.createdAt)" readonly />
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label">Updated at</label>
                <BFormInput :value="formatDateTime(order?.updatedAt)" readonly />
            </div>
        </div>
        <hr class="my-3" />
        <div>
            <h6 class="fw-semibold mb-2">Danh sách món</h6>
            <BTable :items="itemRows" :fields="itemFields" small bordered hover>
                <template #cell(index)="{ index }">
                    <span>{{ index + 1 }}</span>
                </template>
                <template #cell(lineTotal)="{ item }">
                    <span>{{ formatCurrencyVND(item.lineTotal || 0) }}</span>
                </template>
            </BTable>
        </div>
    </BModal>
</template>

<script setup>
import { computed } from 'vue'
import { BModal, BFormInput, BTable } from 'bootstrap-vue-next'
import { formatCurrencyVND } from '../../utils/currency.js'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    order: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

function formatDateTime(value) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return ''
    return d.toLocaleString('vi-VN')
}

const itemFields = [
    { key: 'index', label: '#' },
    { key: 'name', label: 'Tên món' },
    { key: 'quantity', label: 'Số lượng' },
    { key: 'lineTotal', label: 'Thành tiền' },
]

const itemRows = computed(() => {
    const list = props.order?.items || props.order?.foods || []
    return (list || []).map((i) => {
        const name = i.name || i.foodName || i.Food?.name || ''
        const quantity = i.quantity || i.OrderFood?.quantity || 0
        const unit = (i.unitPrice ?? i.price ?? i.OrderFood?.unitPrice ?? i.Food?.price ?? 0)
        const lineTotal = Number(quantity) * Number(unit)
        return { name, quantity, lineTotal }
    })
})
</script>

<style scoped>
/* Optional: style tweaks */
</style>
