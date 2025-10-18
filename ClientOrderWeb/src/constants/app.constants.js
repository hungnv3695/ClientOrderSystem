// src/constants/app.constants.js

/**
 * Application Constants for Frontend
 */

// Payment Methods
export const PAYMENT_METHOD = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer'
};

// Payment Status
export const PAYMENT_STATUS = {
    PAID: 'Paid',
    UNPAID: 'Unpaid'
};

// API Status Codes
export const API_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Status Constants
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

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

// Status Badge Classes
export const STATUS_BADGE_CLASSES = {
    [STATUS.ACTIVE]: 'badge bg-success',
    [STATUS.INACTIVE]: 'badge bg-secondary'
};

// Helper Functions
export const getStatusText = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.text : status;
};

export const getStatusBadgeClass = (status) => {
    return STATUS_BADGE_CLASSES[status] || 'badge bg-secondary';
};

export const STRING = {
    EMPTY: '',
};

export const USER_ROLE = {
    STAFF: 'staff',
    DEVICE: 'device'
};

export const ORDER_STATUS = {
    RECEIVED: 'Received',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    DELIVERED: 'Delivered',
};

export const SCREEN = {
    STAFF_ORDER : {
        NAME: 'StaffOrder',
        URL: '/StaffOrder'
    },
    STAFF_ORDER_MANAGE : {
        NAME: 'StaffOrderManage',
        URL: '/StaffOrderManage'
    },
    STAFF_SCREEN : {
        NAME: 'StaffScreen',
        URL: '/StaffScreen'
    },
    CLIENT_ORDER : {
        NAME: 'ClientOrder',
        URL: '/ClientOrder'
    },
    ORDER_CALLER : {
        NAME: 'OrderCaller',
        URL: '/OrderCaller'
    },
    ORDER_DASHBOARD : {
        NAME: 'OrderDashboard',
        URL: '/OrderDashboard'
    },
}