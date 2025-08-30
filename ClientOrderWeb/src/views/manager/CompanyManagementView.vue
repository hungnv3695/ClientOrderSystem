<template>
    <ManagerLayout>
        <template #title>Quản Lý Công Ty</template>

        <!-- Khu vực tìm kiếm -->
        <SearchForm :loading="loading" :show-add-button="true" add-button-text="Thêm công ty" @search="handleSearch"
            @clear="handleClearSearch" @add-new="handleAddNew">
            <SearchFormField label="Mã công ty" field-name="code" v-model="searchForm.code"
                placeholder="Nhập mã công ty" />
            <SearchFormField label="Tên công ty" field-name="name" v-model="searchForm.name"
                placeholder="Nhập tên công ty" />
            <SearchFormField label="Số đăng ký" field-name="registration_number"
                v-model="searchForm.registration_number" placeholder="Nhập số đăng ký" />
            <SearchFormField label="Địa chỉ" field-name="address" v-model="searchForm.address"
                placeholder="Nhập địa chỉ" />
            <SearchFormField label="Điện thoại" field-name="phone" v-model="searchForm.phone"
                placeholder="Nhập số điện thoại" />
            <SearchFormField label="Email" field-name="email" v-model="searchForm.email" type="email"
                placeholder="Nhập email" />
            <SearchFormField label="Từ ngày" field-name="createdAtFrom" v-model="searchForm.createdAtFrom"
                type="date" />
            <SearchFormField label="Đến ngày" field-name="createdAtTo" v-model="searchForm.createdAtTo" type="date" />
        </SearchForm>

        <!-- Khu vực kết quả -->
        <SearchResultTable :items="companies" :fields="tableFields" :loading="loading" :total-records="totalRecords"
            v-model:current-page="currentPage" @page-change="handlePageChange" title="Kết quả tìm kiếm"
            record-unit="công ty">
            <template #cell(created_at)="{ item }">
                <span class="text-nowrap">{{ formatDateTime(item.created_at) }}</span>
            </template>

            <template #cell(updated_at)="{ item }">
                <span class="text-nowrap">{{ formatDateTime(item.updated_at) }}</span>
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
        <EditModal v-model="showEditModal" :title="editModalTitle" :data="editingCompany" :fields="editFields"
            :loading="editLoading" :errors="editErrors" @submit="handleSaveCompany" @cancel="handleCancelEdit" />
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
import CompanyService from '../../services/manager/CompanyService.js'

// Reactive data
const loading = ref(false)
const companies = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const perPage = ref(20)

// Edit modal data
const showEditModal = ref(false)
const editLoading = ref(false)
const editingCompany = ref({})
const editErrors = ref({})

const searchForm = reactive({
    code: '',
    name: '',
    registration_number: '',
    address: '',
    phone: '',
    email: '',
    createdAtFrom: '',
    createdAtTo: ''
})

// Table configuration
const tableFields = [
    { key: 'id', label: 'ID', sortable: true, thStyle: { width: '60px' } },
    { key: 'code', label: 'Mã công ty', sortable: true, thStyle: { width: '120px' } },
    { key: 'name', label: 'Tên công ty', sortable: true },
    { key: 'registration_number', label: 'Số đăng ký', sortable: true, thStyle: { width: '150px' } },
    { key: 'address', label: 'Địa chỉ', thStyle: { width: '200px' } },
    { key: 'phone', label: 'Điện thoại', thStyle: { width: '120px' } },
    { key: 'email', label: 'Email', thStyle: { width: '180px' } },
    { key: 'created_at', label: 'Ngày tạo', sortable: true, thStyle: { width: '160px', whiteSpace: 'nowrap' } },
    { key: 'updated_at', label: 'Cập nhật', sortable: true, thStyle: { width: '160px', whiteSpace: 'nowrap' } },
    { key: 'actions', label: 'Thao tác', thStyle: { width: '120px' } }
]

// Edit modal configuration
const editFields = [
    {
        key: 'code',
        label: 'Mã công ty',
        type: 'text',
        placeholder: 'Nhập mã công ty',
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'name',
        label: 'Tên công ty',
        type: 'text',
        placeholder: 'Nhập tên công ty',
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'registration_number',
        label: 'Số đăng ký',
        type: 'text',
        placeholder: 'Nhập số đăng ký',
        required: true,
        colClass: 'col-md-6'
    },
    {
        key: 'address',
        label: 'Địa chỉ',
        type: 'textarea',
        placeholder: 'Nhập địa chỉ',
        rows: 2,
        colClass: 'col-md-6'
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
        key: 'website',
        label: 'Website',
        type: 'text',
        placeholder: 'Nhập website',
        colClass: 'col-md-6'
    },
    {
        key: 'description',
        label: 'Mô tả',
        type: 'textarea',
        placeholder: 'Nhập mô tả',
        rows: 3,
        colClass: 'col-12'
    }
]

// Computed
const totalPages = computed(() => Math.ceil(totalRecords.value / perPage.value))

const editModalTitle = computed(() => {
    return editingCompany.value?.id ? 'Sửa thông tin công ty' : 'Thêm công ty mới'
})

// Methods
const handleSearch = async () => {
    loading.value = true
    try {
        await searchCompanies()
    } catch (error) {
        console.error('Search error:', error)
        // TODO: Show error notification
        alert('Lỗi khi tìm kiếm công ty: ' + error.message)
    } finally {
        loading.value = false
    }
}

const handleClearSearch = () => {
    Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
    })
    currentPage.value = 1
    handleSearch()
}

const handlePageChange = (page) => {
    currentPage.value = page
    handleSearch()
}

const handleEdit = (company) => {
    editingCompany.value = { ...company }
    editErrors.value = {}
    showEditModal.value = true
}

const handleAddNew = () => {
    editingCompany.value = {}
    editErrors.value = {}
    showEditModal.value = true
}

const handleDelete = async (company) => {
    if (confirm(`Bạn có chắc chắn muốn xóa công ty "${company.name}"?`)) {
        try {
            loading.value = true
            await CompanyService.deleteCompany(company.id)

            // Refresh data after successful delete
            await searchCompanies()
            alert('Xóa công ty thành công!')
        } catch (error) {
            console.error('Delete error:', error)
            alert('Lỗi khi xóa công ty: ' + error.message)
        } finally {
            loading.value = false
        }
    }
}

const handleSaveCompany = async (formData) => {
    editLoading.value = true
    editErrors.value = {}

    try {
        let result
        if (formData.id) {
            // Update existing company
            result = await CompanyService.updateCompany(formData.id, formData)
        } else {
            // Create new company
            result = await CompanyService.createCompany(formData)
        }

        // Close modal
        showEditModal.value = false

        // Refresh data
        await searchCompanies()

        // Show success message
        const action = formData.id ? 'cập nhật' : 'tạo mới'
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} công ty thành công!`)

    } catch (error) {
        console.error('Save error:', error)

        // Handle validation errors from server
        if (error.message.includes('đã tồn tại')) {
            editErrors.value = {
                code: 'Mã công ty đã tồn tại'
            }
        } else if (error.message.includes('email')) {
            editErrors.value = {
                email: 'Định dạng email không hợp lệ'
            }
        } else if (error.message.includes('điện thoại')) {
            editErrors.value = {
                phone: 'Định dạng số điện thoại không hợp lệ'
            }
        } else {
            // Show general error
            alert('Lỗi khi lưu công ty: ' + error.message)
        }
    } finally {
        editLoading.value = false
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
    editingCompany.value = {}
    editErrors.value = {}
}

const searchCompanies = async () => {
    try {
        const searchParams = {
            ...searchForm,
            page: currentPage.value,
            limit: perPage.value,
            sortBy: 'created_at',
            sortOrder: 'DESC'
        }

        const result = await CompanyService.searchCompanies(searchParams)

        if (result.success) {
            companies.value = result.data.companies || []
            totalRecords.value = result.data.pagination?.totalRecords || 0
        } else {
            throw new Error(result.message || 'Lỗi khi tìm kiếm công ty')
        }
    } catch (error) {
        console.error('searchCompanies error:', error)
        companies.value = []
        totalRecords.value = 0
        throw error
    }
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
/* Tên công ty */
:deep(.table td:nth-child(5)) {
    /* Địa chỉ */
    white-space: normal;
    word-wrap: break-word;
}
</style>