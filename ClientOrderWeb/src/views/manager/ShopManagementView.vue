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
            <template #cell(stt)="{ index }">
                {{ (currentPage - 1) * perPage + index + 1 }}
            </template>

            <template #cell(created_at)="{ item }">
                <span class="text-nowrap">{{ formatDateTime(item.created_at) }}</span>
            </template>

            <template #cell(status)="{ item }">
                <span :class="getStatusBadgeClass(item.status)">
                    {{ getStatusText(item.status) }}
                </span>
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

        <!-- Confirm Delete Modal -->
        <ConfirmModal 
            v-model="showDeleteModal" 
            type="danger"
            title="Xác nhận xóa"
            :message="`Bạn có chắc chắn muốn xóa cửa hàng '${deletingShop?.name??''}'?`"
            description="Thao tác này không thể hoàn tác."
            confirm-text="Xác nhận"
            cancel-text="Hủy"
            :loading="deleteLoading"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />

        <!-- Confirm Save Modal -->
        <ConfirmModal 
            v-model="showSaveModal" 
            type="info"
            title="Xác nhận lưu"
            :message="editingShop?.id ? 'Bạn có chắc chắn muốn cập nhật thông tin cửa hàng?' : 'Bạn có chắc chắn muốn tạo cửa hàng mới?'"
            description="Vui lòng kiểm tra lại thông tin trước khi lưu."
            confirm-text="Lưu"
            cancel-text="Hủy"
            :loading="editLoading"
            @confirm="confirmSave"
            @cancel="cancelSave"
        />
    </ManagerLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import ManagerLayout from '../../layouts/ManagerLayout.vue'
import SearchForm from '../../components/SearchForm.vue'
import SearchFormField from '../../components/SearchFormField.vue'
import SearchResultTable from '../../components/SearchResultTable.vue'
import EditModal from '../../components/EditModal.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { formatDateTime } from '../../utils/dateTime.js'
import ShopService from '../../services/manager/ShopService.js'
import CompanyService from '../../services/manager/CompanyService.js'
import { STATUS_OPTIONS, getStatusText, getStatusBadgeClass } from '../../constants/app.constants.js'

// Reactive data
const loading = ref(false)
const shops = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(20)
const companies = ref([]) // For company dropdown
const managers = ref([]) // For manager dropdown - mock data for now
const isMounted = ref(false) // Track component mount state

// Edit modal data
const showEditModal = ref(false)
const editLoading = ref(false)
const editingShop = ref({})
const editErrors = ref({})

// Confirm modal data
const showDeleteModal = ref(false)
const showSaveModal = ref(false)
const deleteLoading = ref(false)
const deletingShop = ref({})
const pendingSaveData = ref({})

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

// Mock data for shops - REMOVED: Will be replaced by API calls
// const mockData = [...]

// Status options for checkbox
const statusOptions = STATUS_OPTIONS

// Table configuration
const tableFields = [
    { key: 'stt', label: 'STT', thStyle: { width: '60px', textAlign: 'center' }, tdClass: 'text-center' },
    { key: 'id', label: 'ID', sortable: true, thStyle: { width: '60px' }, class: 'd-none', thClass: 'd-none', tdClass: 'd-none' },
    { key: 'code', label: 'Mã', sortable: true, thStyle: { width: '120px' } },
    { key: 'name', label: 'Tên ', sortable: true },
    { key: 'companyName', label: 'Công ty', sortable: true, thStyle: { width: '150px' } },
    { key: 'address', label: 'Địa chỉ', thStyle: { width: '120px' } },
    { key: 'phone', label: 'Điện thoại', thStyle: { width: '120px' } },
    { key: 'email', label: 'Email', thStyle: { width: '180px' } },
    { key: 'managerName', label: 'Quản lý', thStyle: { width: '120px' } },
    { key: 'created_at', label: 'Ngày tạo', sortable: true, thStyle: { width: '140px' } },
    { key: 'status', label: 'Trạng thái', sortable: true, thStyle: { width: '100px' } },
    { key: 'actions', label: 'Thao tác', thStyle: { width: '120px' } }
]

// Edit modal configuration
const editFields = ref([
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
        options: [{ value: '', text: 'Chọn công ty' }], // Will be updated dynamically
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'managerId',
        label: 'Quản lý',
        type: 'select',
        options: [{ value: '', text: 'Chọn quản lý' }], // Will be updated dynamically
        required: false,
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
        options: STATUS_OPTIONS,
        required: true,
        colClass: 'col-md-6'
    }
])

// Computed
const totalPages = computed(() => Math.ceil(totalRecords.value / perPage.value))

const editModalTitle = computed(() => {
    return editingShop.value?.id ? 'Sửa thông tin cửa hàng' : 'Thêm cửa hàng mới'
})

// Methods
// Methods - Use imported functions from constants
// const getStatusClass and getStatusText are imported from constants

const handleSearch = async () => {
    loading.value = true
    try {
        await searchShops()
    } catch (error) {
        console.error('Search error:', error)
        // Error already handled in searchShops function
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
    if (!shop || !shop.id) {
        console.error('Invalid shop data for edit')
        return
    }
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
    if (!shop || !shop.id) {
        console.error('Invalid shop data for delete')
        return
    }
    
    deletingShop.value = shop
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    deleteLoading.value = true
    try {
        await ShopService.deleteShop(deletingShop.value.id)
        console.log('Shop deleted successfully')
        showDeleteModal.value = false
        
        // Refresh data after delete
        await handleSearch()
    } catch (error) {
        console.error('Delete error:', error)
        
        // Handle API not available errors gracefully
        if (error.message && (error.message.includes('Không tìm thấy shop') || error.message.includes('404'))) {
            alert('Chức năng quản lý shop chưa được triển khai trên server')
        } else {
            alert(error.message || 'Có lỗi xảy ra khi xóa cửa hàng')
        }
    } finally {
        deleteLoading.value = false
    }
}

const cancelDelete = () => {
    deletingShop.value = {}
}

const handleSaveShop = (formData) => {
    pendingSaveData.value = formData
    showSaveModal.value = true
}

const confirmSave = async () => {
    editLoading.value = true
    editErrors.value = {}

    try {
        const formData = pendingSaveData.value
        if (formData.id) {
            // Update existing shop
            await ShopService.updateShop(formData.id, formData)
            console.log('Shop updated successfully')
        } else {
            // Add new shop
            await ShopService.createShop(formData)
            console.log('Shop created successfully')
        }

        // Close modals
        showSaveModal.value = false
        showEditModal.value = false
        
        // Refresh data after save
        await handleSearch()

    } catch (error) {
        console.error('Save error:', error)
        
        // Handle API not available errors gracefully
        if (error.message && (error.message.includes('Không tìm thấy shop') || error.message.includes('404'))) {
            alert('Chức năng quản lý shop chưa được triển khai trên server')
            showSaveModal.value = false
            showEditModal.value = false
        } else {
            showSaveModal.value = false
            // Handle validation errors
            if (error.message) {
                if (error.message.includes('Mã shop đã tồn tại') || error.message.includes('Mã cửa hàng đã tồn tại')) {
                    editErrors.value = { code: error.message }
                } else if (error.message.includes('email')) {
                    editErrors.value = { email: error.message }
                } else {
                    alert(error.message)
                }
            } else {
                alert('Có lỗi xảy ra khi lưu cửa hàng')
            }
        }
    } finally {
        editLoading.value = false
    }
}

const cancelSave = () => {
    pendingSaveData.value = {}
}

const handleCancelEdit = () => {
    showEditModal.value = false
    editingShop.value = {}
    editErrors.value = {}
}

const searchShops = async () => {
    if (!isMounted.value) return // Don't search if component is not mounted
    
    try {
        // Prepare search parameters
        const searchParams = {
            page: currentPage.value,
            limit: perPage.value
        }

        // Add search filters
        if (searchForm.code) searchParams.code = searchForm.code
        if (searchForm.name) searchParams.name = searchForm.name
        if (searchForm.companyName) searchParams.companyName = searchForm.companyName
        if (searchForm.address) searchParams.address = searchForm.address
        if (searchForm.phone) searchParams.phone = searchForm.phone
        if (searchForm.email) searchParams.email = searchForm.email
        if (searchForm.status && searchForm.status.length > 0) {
            searchParams.status = searchForm.status.join(',')
        }
        if (searchForm.createdAtFrom) searchParams.createdAtFrom = searchForm.createdAtFrom
        if (searchForm.createdAtTo) searchParams.createdAtTo = searchForm.createdAtTo

        // Call API
        const response = await ShopService.searchShops(searchParams)
        
        if (!isMounted.value) return // Check again after async operation
        
        if (response.success) {
            shops.value = response.data.rows || []
            totalRecords.value = response.data.count || 0
        } else {
            console.error('Search failed:', response.message)
            shops.value = []
            totalRecords.value = 0
        }
        
    } catch (error) {
        console.error('Search error:', error)
        if (isMounted.value) {
            shops.value = []
            totalRecords.value = 0
            
            // Handle specific API not found errors more gracefully
            if (error.message && error.message.includes('Không tìm thấy shop')) {
                console.warn('Shop API not implemented yet, using empty data')
                // Don't show alert for this case as it's expected during development
            } else if (error.message && !error.message.includes('kết nối')) {
                console.warn('API error:', error.message)
                // Only show user-facing errors, not development errors
            }
        }
    }
}

// Load companies for dropdown
const loadCompanies = async () => {
    try {
        const response = await CompanyService.getCompaniesForDropdown()
        if (response.success) {
            companies.value = response.data || []
            // Update editFields company options
            const companyField = editFields.value.find(f => f.key === 'companyId')
            if (companyField) {
                companyField.options = [
                    { value: '', text: 'Chọn công ty' },
                    ...companies.value.map(company => ({
                        value: company.id,
                        text: company.name
                    }))
                ]
            }
        }
    } catch (error) {
        console.error('Load companies error:', error)
        companies.value = []
        
        // Handle API not available gracefully
        if (error.message && (error.message.includes('Không tìm thấy') || error.message.includes('404'))) {
            console.warn('Company API not fully implemented, using empty dropdown')
        }
    }
}

// Load managers for dropdown - mock data for now
const loadManagers = async () => {
    // TODO: Replace with actual UserService call when available
    managers.value = [
        { id: 1, name: 'Nguyễn Văn A' },
        { id: 2, name: 'Trần Thị B' },
        { id: 3, name: 'Lê Văn C' },
        { id: 4, name: 'Phạm Thị D' },
        { id: 5, name: 'Hoàng Văn E' }
    ]
    
    // Update editFields manager options
    const managerField = editFields.value.find(f => f.key === 'managerId')
    if (managerField) {
        managerField.options = [
            { value: '', text: 'Chọn quản lý' },
            ...managers.value.map(manager => ({
                value: manager.id,
                text: manager.name
            }))
        ]
    }
}

// Lifecycle
onMounted(async () => {
    isMounted.value = true
    try {
        await Promise.all([
            loadCompanies(),
            loadManagers(),
            handleSearch()
        ])
    } catch (error) {
        console.error('Component initialization error:', error)
    }
})

onUnmounted(() => {
    isMounted.value = false
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
