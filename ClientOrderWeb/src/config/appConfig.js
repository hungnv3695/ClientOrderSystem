// Centralized frontend configuration
// Prefer environment variables (VITE_*) with sensible fallbacks

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:3000';

// Print service configuration - environment variable hoặc fallback
export const PRINT_SERVICE_URL = import.meta.env.VITE_PRINT_SERVICE_URL || 'http://localhost:3003/api/print';

export const QR_ACCOUNT_BANK = import.meta.env.VITE_QR_BANK || 'VCB';
export const QR_ACCOUNT_NUMBER = import.meta.env.VITE_QR_ACC || '0011004365510';
export const QR_ACCOUNT_NAME = import.meta.env.VITE_QR_ACC_NAME || 'NGUYEN VIET HUNG';

export function buildQrImage(amount, orderNumber) {
    return `https://img.vietqr.io/image/${QR_ACCOUNT_BANK}-${QR_ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderNumber)}&accountName=${encodeURIComponent(QR_ACCOUNT_NAME)}`;
}
