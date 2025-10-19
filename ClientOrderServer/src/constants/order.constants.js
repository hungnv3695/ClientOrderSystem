// Centralized immutable constants for Order related enums

// Order Status as INTEGER (theo SQL schema)
const ORDER_STATUS = Object.freeze({
    CANCELLED: 0,    // Đã hủy
    RECEIVED: 1,     // Đã nhận 
    PROCESSING: 2,   // Đang xử lý
    COMPLETED: 3,    // Đã hoàn thành
    DELIVERED: 4,    // Đã giao
});

// Payment Status as INTEGER (theo SQL schema)
const PAYMENT_STATUS = Object.freeze({
    UNPAID: 0,  // Chưa thanh toán
    PAID: 1,    // Đã thanh toán
});

// Helper mapping cho display text
const ORDER_STATUS_TEXT = Object.freeze({
    0: 'Đã hủy',
    1: 'Đã nhận',
    2: 'Đang xử lý',
    3: 'Đã hoàn thành',
    4: 'Đã giao',
});

const PAYMENT_STATUS_TEXT = Object.freeze({
    0: 'Chưa thanh toán',
    1: 'Đã thanh toán',
});

// Payment Method as INTEGER (theo SQL schema và Receipt model)
const PAYMENT_METHOD = Object.freeze({
    CASH: 0, // Tiền mặt
    BANK_TRANSFER: 1, // Chuyển khoản ngân hàng
});

const PAYMENT_METHOD_TEXT = Object.freeze({
    0: 'Tiền mặt',
    1: 'Chuyển khoản',
});

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHOD,
    ORDER_STATUS_TEXT,
    PAYMENT_STATUS_TEXT,
    PAYMENT_METHOD_TEXT,
};
