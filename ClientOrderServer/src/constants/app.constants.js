// src/constants/app.constants.js

/**
 * Application Constants
 */

// Status Constants
const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Status Arrays
const STATUS_VALUES = Object.values(STATUS);

// Status Options for UI
const STATUS_OPTIONS = [
    { value: STATUS.ACTIVE, text: 'Hoạt động', label: 'Hoạt động' },
    { value: STATUS.INACTIVE, text: 'Ngừng hoạt động', label: 'Ngừng hoạt động' }
];

// Order Status Constants
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

const ORDER_STATUS_OPTIONS = [
    { value: ORDER_STATUS.PENDING, text: 'Chờ xác nhận', label: 'Chờ xác nhận' },
    { value: ORDER_STATUS.CONFIRMED, text: 'Đã xác nhận', label: 'Đã xác nhận' },
    { value: ORDER_STATUS.PREPARING, text: 'Đang chuẩn bị', label: 'Đang chuẩn bị' },
    { value: ORDER_STATUS.READY, text: 'Sẵn sàng', label: 'Sẵn sàng' },
    { value: ORDER_STATUS.COMPLETED, text: 'Hoàn thành', label: 'Hoàn thành' },
    { value: ORDER_STATUS.CANCELLED, text: 'Đã hủy', label: 'Đã hủy' }
];

// User Role Constants
const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    DEVICE: 'device'
};

const USER_ROLES_VALUES = Object.values(USER_ROLES);

const USER_ROLES_OPTIONS = [
    { value: USER_ROLES.ADMIN, text: 'Quản trị viên', label: 'Quản trị viên' },
    { value: USER_ROLES.MANAGER, text: 'Quản lý', label: 'Quản lý' },
    { value: USER_ROLES.STAFF, text: 'Nhân viên', label: 'Nhân viên' },
    { value: USER_ROLES.DEVICE, text: 'Thiết bị', label: 'Thiết bị' }
];

// Pagination Constants
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SORT_ORDER: 'DESC'
};

// Validation Constants
const VALIDATION = {
    CODE_LENGTH: 8,
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[0-9]{10,11}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// Success/Error Messages
const MESSAGES = {
    // Success Messages
    SUCCESS: {
        CREATED: 'Tạo mới thành công',
        UPDATED: 'Cập nhật thành công',
        DELETED: 'Xóa thành công',
        LOGIN: 'Đăng nhập thành công',
        LOGOUT: 'Đăng xuất thành công'
    },
    
    // Error Messages
    ERROR: {
        NOT_FOUND: 'Không tìm thấy dữ liệu',
        ALREADY_EXISTS: 'Dữ liệu đã tồn tại',
        INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác',
        UNAUTHORIZED: 'Không có quyền truy cập',
        FORBIDDEN: 'Truy cập bị từ chối',
        INTERNAL_ERROR: 'Lỗi hệ thống',
        INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ',
        REQUIRED_FIELD: 'Trường bắt buộc không được để trống'
    }
};

module.exports = {
    STATUS,
    STATUS_VALUES,
    STATUS_OPTIONS,
    ORDER_STATUS,
    ORDER_STATUS_VALUES,
    ORDER_STATUS_OPTIONS,
    USER_ROLES,
    USER_ROLES_VALUES,
    USER_ROLES_OPTIONS,
    PAGINATION,
    VALIDATION,
    HTTP_STATUS,
    MESSAGES
};
