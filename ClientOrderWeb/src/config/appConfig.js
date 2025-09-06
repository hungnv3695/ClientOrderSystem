// Centralized frontend configuration
// Prefer environment variables (VITE_*) with sensible fallbacks

export const SHOP_CODE = import.meta.env.VITE_SHOP_CODE || 'SH123';
export const DEVICE_CODE = import.meta.env.VITE_DEVICE_CODE || 'DV001';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:3000';

// Print service configuration - environment variable hoặc fallback
export const PRINT_SERVICE_URL = import.meta.env.VITE_PRINT_SERVICE_URL || 'http://localhost:3003/api/print';

// Cấu hình máy in theo từng thiết bị order (fix cứng)
export const PRINTER_CONFIG = {
    // Thiết bị order chính
    'DV001': {
        printerIp: '192.168.11.9',
        port: '80',  // Port HTTP của Epson
        deviceId: 'local_printer',
        name: 'Máy in quầy 1'
    },
    // Thiết bị order phụ
    'ORDER_DEVICE_02': {
        printerIp: '192.168.11.10',
        port: '80',  // Port HTTP của Epson
        deviceId: 'local_printer',
        name: 'Máy in quầy 2'
    },
    // Thiết bị order bếp
    'ORDER_DEVICE_KITCHEN': {
        printerIp: '192.168.11.11',
        port: '80',  // Port HTTP của Epson
        deviceId: 'local_printer', 
        name: 'Máy in bếp'
    }
};

// Lấy config máy in theo device code hiện tại
export function getPrinterConfig(deviceCode = DEVICE_CODE) {
    return PRINTER_CONFIG[deviceCode] || PRINTER_CONFIG['ORDER_DEVICE_01'];
}

export const QR_ACCOUNT_BANK = import.meta.env.VITE_QR_BANK || 'VCB';
export const QR_ACCOUNT_NUMBER = import.meta.env.VITE_QR_ACC || '0011004365510';
export const QR_ACCOUNT_NAME = import.meta.env.VITE_QR_ACC_NAME || 'NGUYEN VIET HUNG';

export function buildQrImage(amount, orderNumber) {
    return `https://img.vietqr.io/image/${QR_ACCOUNT_BANK}-${QR_ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderNumber)}&accountName=${encodeURIComponent(QR_ACCOUNT_NAME)}`;
}
