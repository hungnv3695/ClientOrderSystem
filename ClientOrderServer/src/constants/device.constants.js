/**
 * Device-related constants
 * Synchronized with device.model.js
 */

/**
 * Device status values (INTEGER)
 * Used in m_device table
 */
const DEVICE_STATUS = {
    AVAILABLE: 0,  // Device is available for use
    USING: 1,      // Device is currently in use
    REMOVED: 99    // Device has been removed/deactivated
};

/**
 * Device status text mapping for display
 */
const DEVICE_STATUS_TEXT = {
    0: 'Sẵn sàng',
    1: 'Đang sử dụng',
    99: 'Đã xóa'
};

/**
 * Device status options for UI select
 */
const DEVICE_STATUS_OPTIONS = [
    { value: DEVICE_STATUS.AVAILABLE, label: DEVICE_STATUS_TEXT[DEVICE_STATUS.AVAILABLE] },
    { value: DEVICE_STATUS.USING, label: DEVICE_STATUS_TEXT[DEVICE_STATUS.USING] },
    { value: DEVICE_STATUS.REMOVED, label: DEVICE_STATUS_TEXT[DEVICE_STATUS.REMOVED] }
];

module.exports = {
    DEVICE_STATUS,
    DEVICE_STATUS_TEXT,
    DEVICE_STATUS_OPTIONS
};
