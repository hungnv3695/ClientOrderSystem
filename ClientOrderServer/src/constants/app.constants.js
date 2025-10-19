// src/constants/app.constants.js

/**
 * Application Constants
 */

const { ORDER_STATUS, ORDER_STATUS_TEXT } = require('./order.constants');

// Status Constants
const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Status Options for UI
const STATUS_OPTIONS = [
    { value: STATUS.ACTIVE, text: 'Hoạt động', label: 'Hoạt động' },
    { value: STATUS.INACTIVE, text: 'Ngừng hoạt động', label: 'Ngừng hoạt động' }
];

// Order Status Options for UI (using INTEGER values from order.constants)
const ORDER_STATUS_OPTIONS = [
    { value: ORDER_STATUS.CANCELLED, text: ORDER_STATUS_TEXT[0], label: ORDER_STATUS_TEXT[0] },
    { value: ORDER_STATUS.RECEIVED, text: ORDER_STATUS_TEXT[1], label: ORDER_STATUS_TEXT[1] },
    { value: ORDER_STATUS.PROCESSING, text: ORDER_STATUS_TEXT[2], label: ORDER_STATUS_TEXT[2] },
    { value: ORDER_STATUS.COMPLETED, text: ORDER_STATUS_TEXT[3], label: ORDER_STATUS_TEXT[3] },
    { value: ORDER_STATUS.DELIVERED, text: ORDER_STATUS_TEXT[4], label: ORDER_STATUS_TEXT[4] }
];

// User Role Constants
const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    DEVICE: 'device'
};

const USER_ROLES_VALUES = Object.values(USER_ROLES);

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

// Company Status Constants
const COMPANY_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
};

// Shop Status Constants
const SHOP_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
};

const USER_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
};

const FOOD_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
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
    STATUS_OPTIONS,
    ORDER_STATUS,
    ORDER_STATUS_OPTIONS,
    USER_ROLES,
    USER_ROLES_VALUES,
    PAGINATION,
    VALIDATION,
    HTTP_STATUS,
    MESSAGES,
    SHOP_STATUS,
    COMPANY_STATUS,
    USER_STATUS,
    FOOD_STATUS
};
