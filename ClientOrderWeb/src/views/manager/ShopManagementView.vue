<template>
    <ManagerLayout>
        <template #title>Quản Lý Cửa Hàng</template>

        <!-- Khu vực tìm kiếm -->
        <SearchForm :loading="loading" :show-add-button="true" add-button-text="Thêm cửa hàng" @search="handleSearch"
            @clear="handleClearSearch" @add-new="handleAddNew">
            <SearchFormField label="Mã cửa hàng" field-name="code" v-model="searchForm.code"
                placeholder="Nhập mã cửa hàng" />
            <SearchFormField label="Tên cửa hàng" field-name="name" v-model="searchForm.name"
                placeholder="Nhập tên cửa hàng" />
            <SearchFormField label="Công ty" field-name="companyName" v-model="searchForm.companyName"
                placeholder="Nhập tên công ty" />
            <SearchFormField label="Địa chỉ" field-name="address" v-model="searchForm.address"
                placeholder="Nhập địa chỉ" />
            <SearchFormField label="Điện thoại" field-name="phone" v-model="searchForm.phone"
                placeholder="Nhập số điện thoại" />
            <SearchFormField label="Email" field-name="email" v-model="searchForm.email" type="email"
                placeholder="Nhập email" />
            <SearchFormField label="Trạng thái" field-name="status" v-model="searchForm.status" type="checkbox"
                :options="statusOptions" />
            <SearchFormField label="Từ ngày" field-name="createdAtFrom" v-model="searchForm.createdAtFrom"
                type="date" />
            <SearchFormField label="Đến ngày" field-name="createdAtTo" v-model="searchForm.createdAtTo" type="date" />
        </SearchForm>

        <!-- Khu vực kết quả -->
        <SearchResultTable :items="shops" :fields="tableFields" :loading="loading" :total-records="totalRecords"
            v-model:current-page="currentPage" @page-change="handlePageChange" title="Kết quả tìm kiếm"
            record-unit="cửa hàng">
            <template #cell(status)="{ item }">
                <span :class="getStatusClass(item.status)">
                    {{ getStatusText(item.status) }}
                </span>
            </template>

            <template #cell(createdAt)="{ item }">
                <span class="text-nowrap">{{ formatDateTime(item.createdAt) }}</span>
            </template>

            <template #cell(updatedAt)="{ item }">
                <span class="text-nowrap">{{ formatDateTime(item.updatedAt) }}</span>
            </template>

            <template #cell(actions)="{ item }">
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" @click="handleEdit(item)">
                        Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="handleDelete(item)">
                        Xóa
                    </button>
                </div>
            </template>
        </SearchResultTable>

        <!-- Edit Modal -->
        <EditModal v-model="showEditModal" :title="editModalTitle" :data="editingShop" :fields="editFields"
            :loading="editLoading" :errors="editErrors" @submit="handleSaveShop" @cancel="handleCancelEdit" />
    </ManagerLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ManagerLayout from '../../layouts/ManagerLayout.vue'
import SearchForm from '../../components/SearchForm.vue'
import SearchFormField from '../../components/SearchFormField.vue'
import SearchResultTable from '../../components/SearchResultTable.vue'
import EditModal from '../../components/EditModal.vue'
import { formatDateTime } from '../../utils/dateTime.js'

// Reactive data
const loading = ref(false)
const shops = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(20)

// Edit modal data
const showEditModal = ref(false)
const editLoading = ref(false)
const editingShop = ref({})
const editErrors = ref({})

const searchForm = reactive({
    code: '',
    name: '',
    companyName: '',
    address: '',
    phone: '',
    email: '',
    status: [],
    createdAtFrom: '',
    createdAtTo: ''
})

// Mock data for shops
const mockData = [
    {
        id: 1,
        code: 'SH001',
        name: 'Cửa hàng ABC Chi nhánh 1',
        companyId: 1,
        companyName: 'Công ty ABC',
        address: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
        phone: '0123456789',
        email: 'sh001@abc.com',
        managerId: 1,
        managerName: 'Nguyễn Văn A',
        status: 'ACTIVE',
        createdAt: '2025-01-15T10:30:00',
        updatedAt: '2025-01-20T14:20:00'
    },
    {
        id: 2,
        code: 'SH002',
        name: 'Cửa hàng ABC Chi nhánh 2',
        companyId: 1,
        companyName: 'Công ty ABC',
        address: '456 Lê Văn Việt, Q.9, TP.HCM',
        phone: '0987654321',
        email: 'sh002@abc.com',
        managerId: 2,
        managerName: 'Trần Thị B',
        status: 'ACTIVE',
        createdAt: '2025-01-10T09:15:00',
        updatedAt: '2025-01-18T16:45:00'
    },
    {
        id: 3,
        code: 'SH003',
        name: 'Cửa hàng XYZ Hà Nội',
        companyId: 2,
        companyName: 'Công ty XYZ',
        address: '789 Cầu Giấy, Hà Nội',
        phone: '0456789123',
        email: 'hanoi@xyz.com',
        managerId: 3,
        managerName: 'Lê Văn C',
        status: 'ACTIVE',
        createdAt: '2025-01-05T14:20:00',
        updatedAt: '2025-01-15T11:30:00'
    },
    {
        id: 4,
        code: 'SH004',
        name: 'Cửa hàng XYZ Đà Nẵng',
        companyId: 2,
        companyName: 'Công ty XYZ',
        address: '321 Hải Châu, Đà Nẵng',
        phone: '0789123456',
        email: 'danang@xyz.com',
        managerId: 4,
        managerName: 'Phạm Thị D',
        status: 'INACTIVE',
        createdAt: '2025-01-12T08:45:00',
        updatedAt: '2025-01-22T13:20:00'
    },
    {
        id: 5,
        code: 'SH005',
        name: 'Cửa hàng DEF Cần Thơ',
        companyId: 3,
        companyName: 'Công ty DEF Ltd',
        address: '654 Ninh Kiều, Cần Thơ',
        phone: '0321654987',
        email: 'cantho@def.com',
        managerId: 5,
        managerName: 'Hoàng Văn E',
        status: 'ACTIVE',
        createdAt: '2025-01-08T16:10:00',
        updatedAt: '2025-01-19T10:15:00'
    },
    {
        id: 6,
        code: 'SH006',
        name: 'Cửa hàng DEF Vũng Tàu',
        companyId: 3,
        companyName: 'Công ty DEF Ltd',
        address: '987 Thùy Vân, Vũng Tàu',
        phone: '0654987321',
        email: 'vungtau@def.com',
        managerId: 6,
        managerName: 'Võ Thị F',
        status: 'ACTIVE',
        createdAt: '2025-01-03T12:00:00',
        updatedAt: '2025-01-17T15:30:00'
    },
    {
        id: 7,
        code: 'SH007',
        name: 'Cửa hàng GHI Nha Trang',
        companyId: 4,
        companyName: 'Tập đoàn GHI',
        address: '159 Trần Phú, Nha Trang',
        phone: '0159753486',
        email: 'nhatrang@ghi.com',
        managerId: 7,
        managerName: 'Đặng Văn G',
        status: 'ACTIVE',
        createdAt: '2025-01-14T11:25:00',
        updatedAt: '2025-01-21T09:45:00'
    },
    {
        id: 8,
        code: 'SH008',
        name: 'Cửa hàng GHI Huế',
        companyId: 4,
        companyName: 'Tập đoàn GHI',
        address: '753 Lê Lợi, Huế',
        phone: '0753486159',
        email: 'hue@ghi.com',
        managerId: 8,
        managerName: 'Bùi Thị H',
        status: 'INACTIVE',
        createdAt: '2025-01-07T13:40:00',
        updatedAt: '2025-01-16T14:55:00'
    },
    {
        id: 9,
        code: 'SH009',
        name: 'Cửa hàng JKL Quy Nhơn',
        companyId: 5,
        companyName: 'Công ty TNHH JKL',
        address: '486 Nguyễn Huệ, Quy Nhơn',
        phone: '0486159753',
        email: 'quynhon@jkl.com',
        managerId: 9,
        managerName: 'Ngô Văn I',
        status: 'ACTIVE',
        createdAt: '2025-01-11T07:30:00',
        updatedAt: '2025-01-20T12:10:00'
    },
    {
        id: 10,
        code: 'SH010',
        name: 'Cửa hàng JKL Vinh',
        companyId: 5,
        companyName: 'Công ty TNHH JKL',
        address: '951 Lê Mao, Vinh',
        phone: '0951357246',
        email: 'vinh@jkl.com',
        managerId: 10,
        managerName: 'Lý Thị K',
        status: 'ACTIVE',
        createdAt: '2025-01-09T15:20:00',
        updatedAt: '2025-01-18T08:40:00'
    }
]

// Status options for checkbox
const statusOptions = [
    { value: 'ACTIVE', text: 'Hoạt động' },
    { value: 'INACTIVE', text: 'Ngừng hoạt động' }
]

// Table configuration
const tableFields = [
    { key: 'id', label: 'ID', sortable: true, thStyle: { width: '60px' } },
    { key: 'code', label: 'Mã cửa hàng', sortable: true, thStyle: { width: '120px' } },
    { key: 'name', label: 'Tên cửa hàng', sortable: true },
    { key: 'companyName', label: 'Công ty', sortable: true, thStyle: { width: '150px' } },
    { key: 'address', label: 'Địa chỉ', thStyle: { width: '200px' } },
    { key: 'phone', label: 'Điện thoại', thStyle: { width: '120px' } },
    { key: 'email', label: 'Email', thStyle: { width: '180px' } },
    { key: 'managerName', label: 'Quản lý', thStyle: { width: '120px' } },
    { key: 'status', label: 'Trạng thái', sortable: true, thStyle: { width: '100px' } },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true, thStyle: { width: '160px', whiteSpace: 'nowrap' } },
    { key: 'updatedAt', label: 'Cập nhật', sortable: true, thStyle: { width: '160px', whiteSpace: 'nowrap' } },
    { key: 'actions', label: 'Thao tác', thStyle: { width: '120px' } }
]

// Edit modal configuration
const editFields = [
    {
        key: 'code',
        label: 'Mã cửa hàng',
        type: 'text',
        placeholder: 'Nhập mã cửa hàng',
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'name',
        label: 'Tên cửa hàng',
        type: 'text',
        placeholder: 'Nhập tên cửa hàng',
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'companyId',
        label: 'Công ty',
        type: 'select',
        options: [
            { value: '', text: 'Chọn công ty' },
            { value: 1, text: 'Công ty ABC' },
            { value: 2, text: 'Công ty XYZ' },
            { value: 3, text: 'Công ty DEF Ltd' },
            { value: 4, text: 'Tập đoàn GHI' },
            { value: 5, text: 'Công ty TNHH JKL' }
        ],
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'managerId',
        label: 'Quản lý',
        type: 'select',
        options: [
            { value: '', text: 'Chọn quản lý' },
            { value: 1, text: 'Nguyễn Văn A' },
            { value: 2, text: 'Trần Thị B' },
            { value: 3, text: 'Lê Văn C' },
            { value: 4, text: 'Phạm Thị D' },
            { value: 5, text: 'Hoàng Văn E' }
        ],
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'address',
        label: 'Địa chỉ',
        type: 'textarea',
        placeholder: 'Nhập địa chỉ',
        rows: 2,
        required: true,
        colClass: 'col-12'
    },
    {
        key: 'phone',
        label: 'Điện thoại',
        type: 'tel',
        placeholder: 'Nhập số điện thoại',
        colClass: 'col-md-6'
    },
    {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Nhập email',
        colClass: 'col-md-6'
    },
    {
        key: 'status',
        label: 'Trạng thái',
        type: 'select',
        options: [
            { value: 'ACTIVE', text: 'Hoạt động' },
            { value: 'INACTIVE', text: 'Ngừng hoạt động' }
        ],
        required: true,
        colClass: 'col-md-6'
    }
]

// Computed
const totalPages = computed(() => Math.ceil(totalRecords.value / perPage.value))

const editModalTitle = computed(() => {
    return editingShop.value?.id ? 'Sửa thông tin cửa hàng' : 'Thêm cửa hàng mới'
})

// Methods
const getStatusClass = (status) => {
    return status === 'ACTIVE' ? 'badge bg-success' : 'badge bg-secondary'
}

const getStatusText = (status) => {
    return status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'
}

const handleSearch = async () => {
    loading.value = true
    try {
        await searchShops()
    } catch (error) {
        console.error('Search error:', error)
    } finally {
        loading.value = false
    }
}

const handleClearSearch = () => {
    Object.keys(searchForm).forEach(key => {
        if (key === 'status') {
            searchForm[key] = []
        } else {
            searchForm[key] = ''
        }
    })
    currentPage.value = 1
    handleSearch()
}

const handlePageChange = (page) => {
    currentPage.value = page
    handleSearch()
}

const handleEdit = (shop) => {
    editingShop.value = { ...shop }
    editErrors.value = {}
    showEditModal.value = true
}

const handleAddNew = () => {
    editingShop.value = {}
    editErrors.value = {}
    showEditModal.value = true
}

const handleDelete = (shop) => {
    // TODO: Show confirmation dialog and delete
    console.log('Delete shop:', shop)
}

const handleSaveShop = async (formData) => {
    editLoading.value = true
    editErrors.value = {}

    try {
        console.log('Saving shop:', formData)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (formData.id) {
            // Update existing shop
            const index = shops.value.findIndex(s => s.id === formData.id)
            if (index !== -1) {
                shops.value[index] = { ...formData }
            }
        } else {
            // Add new shop
            const newShop = {
                ...formData,
                id: Math.max(...shops.value.map(s => s.id)) + 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            shops.value.unshift(newShop)
            totalRecords.value += 1
        }

        showEditModal.value = false
        console.log('Shop saved successfully')

    } catch (error) {
        console.error('Save error:', error)
        editErrors.value = {
            // Example: code: 'Mã cửa hàng đã tồn tại'
        }
    } finally {
        editLoading.value = false
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
    editingShop.value = {}
    editErrors.value = {}
}

const searchShops = async () => {
    // Filter data based on search criteria
    let filteredData = mockData.filter(shop => {
        // Filter by code
        if (searchForm.code && !shop.code.toLowerCase().includes(searchForm.code.toLowerCase())) {
            return false
        }

        // Filter by name
        if (searchForm.name && !shop.name.toLowerCase().includes(searchForm.name.toLowerCase())) {
            return false
        }

        // Filter by company name
        if (searchForm.companyName && !shop.companyName.toLowerCase().includes(searchForm.companyName.toLowerCase())) {
            return false
        }

        // Filter by address
        if (searchForm.address && !shop.address.toLowerCase().includes(searchForm.address.toLowerCase())) {
            return false
        }

        // Filter by phone
        if (searchForm.phone && !shop.phone.includes(searchForm.phone)) {
            return false
        }

        // Filter by email
        if (searchForm.email && !shop.email.toLowerCase().includes(searchForm.email.toLowerCase())) {
            return false
        }

        // Filter by status (array of selected statuses)
        if (searchForm.status.length > 0 && !searchForm.status.includes(shop.status)) {
            return false
        }

        // Filter by date range
        if (searchForm.createdAtFrom) {
            const shopDate = new Date(shop.createdAt).toISOString().split('T')[0]
            if (shopDate < searchForm.createdAtFrom) {
                return false
            }
        }

        if (searchForm.createdAtTo) {
            const shopDate = new Date(shop.createdAt).toISOString().split('T')[0]
            if (shopDate > searchForm.createdAtTo) {
                return false
            }
        }

        return true
    })

    // Apply pagination
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    const paginatedData = filteredData.slice(startIndex, endIndex)

    shops.value = paginatedData
    totalRecords.value = filteredData.length
}

// Lifecycle
onMounted(() => {
    handleSearch()
})
</script>

<style scoped>
/* Custom styles for this view if needed */
.text-nowrap {
    white-space: nowrap !important;
}

/* Ensure datetime columns don't wrap */
:deep(.table td) {
    vertical-align: middle;
}

:deep(.table th),
:deep(.table td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Allow some columns to wrap if needed */
:deep(.table td:nth-child(3)),
/* Tên cửa hàng */
:deep(.table td:nth-child(5)) {
    /* Địa chỉ */
    white-space: normal;
    word-wrap: break-word;
}

.badge {
    font-size: 0.75em;
}
</style>
