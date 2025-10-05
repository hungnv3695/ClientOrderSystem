// Centralized immutable constants for Order related enums

const ORDER_STATUS = Object.freeze({
    RECEIVED: 'Received', // Đã nhận 
    PROCESSING: 'Processing', // Đang xử lý
    COMPLETED: 'Completed', // Đã hoàn thành
    DELIVERED: 'Delivered', // Đã giao
    CANCELLED: 'Cancelled', // Đã hủy
});

const PAYMENT_STATUS = Object.freeze({
    UNPAID: 'Unpaid', // Chưa thanh toán
    PAID: 'Paid', // Đã thanh toán
    REFUNDED: 'Refunded', // Đã hoàn tiền
});

const PAYMENT_METHOD = Object.freeze({
    CASH: 'cash', // Tiền mặt
    BANK_TRANSFER: 'bank_transfer', // Chuyển khoản ngân hàng
});

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHOD,
};
