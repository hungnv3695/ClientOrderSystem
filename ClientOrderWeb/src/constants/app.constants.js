// src/constants/app.constants.js

/**
 * Application Constants for Frontend
 */

// Status Constants
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Status Arrays
export const STATUS_VALUES = Object.values(STATUS);

// Status Options for UI Components
export const STATUS_OPTIONS = [
    { value: STATUS.ACTIVE, text: 'Hoạt động' },
    { value: STATUS.INACTIVE, text: 'Ngừng hoạt động' }
];

// Search Status Options (with "All" option)
export const SEARCH_STATUS_OPTIONS = [
    { value: '', text: 'Tất cả trạng thái' },
    ...STATUS_OPTIONS
];

// Order Status Constants
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const ORDER_STATUS_OPTIONS = [
    { value: ORDER_STATUS.PENDING, text: 'Chờ xác nhận' },
    { value: ORDER_STATUS.CONFIRMED, text: 'Đã xác nhận' },
    { value: ORDER_STATUS.PREPARING, text: 'Đang chuẩn bị' },
    { value: ORDER_STATUS.READY, text: 'Sẵn sàng' },
    { value: ORDER_STATUS.COMPLETED, text: 'Hoàn thành' },
    { value: ORDER_STATUS.CANCELLED, text: 'Đã hủy' }
];

// User Role Constants
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    DEVICE: 'device'
};

export const USER_ROLES_VALUES = Object.values(USER_ROLES);

export const USER_ROLES_OPTIONS = [
    { value: USER_ROLES.ADMIN, text: 'Quản trị viên' },
    { value: USER_ROLES.MANAGER, text: 'Quản lý' },
    { value: USER_ROLES.STAFF, text: 'Nhân viên' },
    { value: USER_ROLES.DEVICE, text: 'Thiết bị' }
];

// Pagination Constants
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SORT_ORDER: 'DESC'
};

// Validation Constants
export const VALIDATION = {
    CODE_LENGTH: 8,
    PASSWORD_MIN_LENGTH: 6,
    PHONE_PATTERN: '^[0-9]{10,11}$',
    EMAIL_PATTERN: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
};

// UI Constants
export const UI = {
    MODAL_SIZES: {
        SMALL: 'sm',
        MEDIUM: 'md',
        LARGE: 'lg',
        EXTRA_LARGE: 'xl'
    },
    
    CONFIRM_TYPES: {
        SUCCESS: 'success',
        WARNING: 'warning',
        DANGER: 'danger',
        INFO: 'info'
    },
    
    TABLE_ACTIONS: {
        EDIT: 'edit',
        DELETE: 'delete',
        VIEW: 'view'
    }
};

// Messages Constants
export const MESSAGES = {
    // Success Messages
    SUCCESS: {
        CREATED: 'Tạo mới thành công',
        UPDATED: 'Cập nhật thành công',
        DELETED: 'Xóa thành công',
        SAVED: 'Lưu thành công'
    },
    
    // Error Messages
    ERROR: {
        NETWORK: 'Lỗi kết nối mạng',
        NOT_FOUND: 'Không tìm thấy dữ liệu',
        UNAUTHORIZED: 'Không có quyền truy cập',
        VALIDATION: 'Dữ liệu không hợp lệ',
        UNKNOWN: 'Có lỗi xảy ra'
    },
    
    // Confirm Messages
    CONFIRM: {
        DELETE: 'Bạn có chắc chắn muốn xóa?',
        SAVE: 'Bạn có chắc chắn muốn lưu?',
        CANCEL: 'Bạn có chắc chắn muốn hủy?'
    }
};

// Status Badge Classes
export const STATUS_BADGE_CLASSES = {
    [STATUS.ACTIVE]: 'badge bg-success',
    [STATUS.INACTIVE]: 'badge bg-secondary'
};

// Order Status Badge Classes
export const ORDER_STATUS_BADGE_CLASSES = {
    [ORDER_STATUS.PENDING]: 'badge bg-warning',
    [ORDER_STATUS.CONFIRMED]: 'badge bg-info',
    [ORDER_STATUS.PREPARING]: 'badge bg-primary',
    [ORDER_STATUS.READY]: 'badge bg-success',
    [ORDER_STATUS.COMPLETED]: 'badge bg-success',
    [ORDER_STATUS.CANCELLED]: 'badge bg-danger'
};

// Helper Functions
export const getStatusText = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.text : status;
};

export const getStatusBadgeClass = (status) => {
    return STATUS_BADGE_CLASSES[status] || 'badge bg-secondary';
};

export const getOrderStatusText = (status) => {
    const option = ORDER_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.text : status;
};

export const getOrderStatusBadgeClass = (status) => {
    return ORDER_STATUS_BADGE_CLASSES[status] || 'badge bg-secondary';
};
