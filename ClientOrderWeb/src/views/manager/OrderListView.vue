<template>
    <ManagerLayout>
        <template #title>
            Danh sách đơn hàng
        </template>

        <!-- Bộ lọc tìm kiếm -->
        <div class="card mb-3">
            <div class="card-body p-0">
                <BForm @submit.prevent="onSearch">
                    <div class="row g-3">
                        <div class="col-12 col-md-3">
                            <label class="form-label">Order status</label>
                            <BFormSelect v-model="filters.status" :options="statusOptions" multiple :select-size="5" />
                            <small class="text-muted">Giữ Ctrl/Command để chọn nhiều</small>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label">Payment status</label>
                            <BFormSelect v-model="filters.paymentStatus" :options="paymentOptions" multiple
                                :select-size="5" />
                        </div>
                        <div class="col-6 col-md-2">
                            <label class="form-label">From date</label>
                            <DatePicker v-model="filters.fromDate" :format="formatDateSlash" :enable-time-picker="false"
                                :auto-apply="true" :clearable="true" placeholder="YYYY/MM/DD"
                                input-class="form-control w-100" />
                        </div>
                        <div class="col-6 col-md-2">
                            <label class="form-label">To date</label>
                            <DatePicker v-model="filters.toDate" :format="formatDateSlash" :enable-time-picker="false"
                                :auto-apply="true" :clearable="true" placeholder="YYYY/MM/DD"
                                input-class="form-control w-100" />
                        </div>
                        <div class="col-6 col-md-1">
                            <label class="form-label">Min total</label>
                            <BFormInput v-model.number="filters.minTotal" type="number" min="0" />
                        </div>
                        <div class="col-6 col-md-1">
                            <label class="form-label">Max total</label>
                            <BFormInput v-model.number="filters.maxTotal" type="number" min="0" />
                        </div>
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <BButton type="submit" variant="primary" :disabled="busy">
                            <span v-if="busy" class="spinner-border spinner-border-sm me-2"></span>
                            Tìm kiếm
                        </BButton>
                        <BButton type="button" variant="secondary" @click="onClear" :disabled="busy">Xóa lọc</BButton>
                    </div>
                </BForm>
            </div>
        </div>

        <!-- Bảng kết quả -->
        <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">

            <div class="card-body p-0 flex-grow-1 overflow-auto" style="min-height: 0;">
                <BTable :items="items" :fields="fields" :busy="busy" responsive hover small class="mb-1"
                    sticky-header="400px">
                    <template #cell(totalPrice)="{ value }">
                        <span>{{ formatCurrencyVND(value) }}</span>
                    </template>
                    <template #cell(createdAt)="{ value }">
                        <span>{{ formatDateTime(value) }}</span>
                    </template>
                    <template #cell(actions)="{ item }">
                        <BButton size="sm" variant="outline-secondary" @click="onView(item)" title="Xem chi tiết">
                            Chi tiết
                        </BButton>
                    </template>
                    <template #table-busy>
                        <div class="text-center my-3">
                            <div class="spinner-border" role="status"></div>
                        </div>
                    </template>
                </BTable>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
                <small class="text-muted">Tổng: {{ total }} đơn</small>
                <BPagination v-model="page" :per-page="pageSize" :total-rows="total" size="sm" align="end" />
            </div>
        </div>

        <!-- Modal chi tiết đơn hàng -->
        <OrderDetailModal v-model="detailOpen" :order="selectedOrder" />
    </ManagerLayout>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { BForm, BFormInput, BFormSelect, BButton, BTable, BPagination } from 'bootstrap-vue-next'
import DatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { searchOrders as apiSearchOrders } from '../../services/OrderService'
import { formatCurrencyVND } from '../../utils/currency.js'
import ManagerLayout from '../../layouts/ManagerLayout.vue'
import OrderDetailModal from '../../components/manager/OrderDetailModal.vue'

const statusOptions = [
    { value: 'Received', text: 'Received' },
    { value: 'Processing', text: 'Processing' },
    { value: 'Completed', text: 'Completed' },
    { value: 'Delivered', text: 'Delivered' },
    { value: 'Cancelled', text: 'Cancelled' },
]

const paymentOptions = [
    { value: 'Unpaid', text: 'Unpaid' },
    { value: 'Paid', text: 'Paid' },
    { value: 'Refunded', text: 'Refunded' },
]

const filters = reactive({
    status: [],
    paymentStatus: [],
    fromDate: null,
    toDate: null,
    minTotal: null,
    maxTotal: null,
})

const items = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const busy = ref(false)
const detailOpen = ref(false)
const selectedOrder = ref(null)

const fields = [
    { key: 'orderNumber', label: 'Mã đơn hàng' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'paymentStatus', label: 'Thanh toán' },
    { key: 'totalPrice', label: 'Tổng' },
    { key: 'note', label: 'Ghi chú' },
    { key: 'updatedAt', label: 'Cập nhật lúc' },
    { key: 'actions', label: ' ', class: 'text-center', thClass: 'text-center', tdClass: 'text-nowrap' },
]

function formatDateTime(value) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return ''
    return d.toLocaleString('vi-VN')
}

function pad2(n) { return n.toString().padStart(2, '0') }
function toYyyyMMdd(val) {
    if (!val) return ''
    if (val instanceof Date && !isNaN(val)) {
        const y = val.getFullYear()
        const m = pad2(val.getMonth() + 1)
        const d = pad2(val.getDate())
        return `${y}${m}${d}`
    }
    if (typeof val === 'string') {
        return val.replaceAll('/', '').replaceAll('-', '')
    }
    return ''
}
function formatDateSlash(val) {
    if (!(val instanceof Date) || isNaN(val)) return ''
    const y = val.getFullYear()
    const m = pad2(val.getMonth() + 1)
    const d = pad2(val.getDate())
    return `${y}/${m}/${d}`
}

async function fetchOrders() {
    busy.value = true
    try {
        const params = {
            page: page.value,
            pageSize: pageSize.value,
            sortBy: 'orderNumber',
            sortOrder: 'DESC',
        }
        if (filters.fromDate) params.fromDate = toYyyyMMdd(filters.fromDate)
        if (filters.toDate) params.toDate = toYyyyMMdd(filters.toDate)
        if (filters.minTotal != null && filters.minTotal !== '') params.minTotal = filters.minTotal
        if (filters.maxTotal != null && filters.maxTotal !== '') params.maxTotal = filters.maxTotal
        if (Array.isArray(filters.status) && filters.status.length) params.status = filters.status.join(',')
        if (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length) params.paymentStatus = filters.paymentStatus.join(',')

        const { rows, count } = await apiSearchOrders(params)
        items.value = rows
        total.value = count
    } catch (e) {
        console.error('Fetch orders failed', e)
        items.value = []
        total.value = 0
    } finally {
        busy.value = false
    }
}

function onSearch() {
    page.value = 1
    fetchOrders()
}

function onClear() {
    filters.status = []
    filters.paymentStatus = []
    filters.fromDate = null
    filters.toDate = null
    filters.minTotal = null
    filters.maxTotal = null
    page.value = 1
    fetchOrders()
}

function onView(item) {
    selectedOrder.value = item
    detailOpen.value = true
}

watch(page, () => {
    fetchOrders()
})

onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
.card-header {
    background-color: var(--bs-light);
}
</style>
