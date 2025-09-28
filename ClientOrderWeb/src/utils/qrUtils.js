/* QR Code Generation Utilities */
export function qrCompact2(amount, orderNumber, bankCode, bankNumber, bankNumberName) {
    return `https://img.vietqr.io/image/${bankCode}-${bankNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderNumber)}&accountName=${encodeURIComponent(bankNumberName)}`;
}
