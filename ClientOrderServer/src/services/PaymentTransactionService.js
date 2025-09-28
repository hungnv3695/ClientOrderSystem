const { PaymentTransaction } = require('../database');

/**
 * Lưu transaction thanh toán vào bảng payment_transactions
 * @param {object} data Raw payload từ webhook
 * @returns {Promise<import('sequelize').Model>} PaymentTransaction record
 */
async function savePaymentTransaction(data) {
    // Map và chuẩn hóa
    const id = data.id; // ID giao dịch trên SePay
    const gateway = data.gateway; // Brand name của ngân hàng
    const transactionDate = data.transactionDate; // Thời gian xảy ra giao dịch phía ngân hàng
    const accountNumber = data.accountNumber || null; // Số tài khoản ngân hàng
    const code = data.code || null; // Mã code thanh toán
    const transactionContent = data.content || null; // Nội dung chuyển khoản
    const transferType = data.transferType; // Loại chuyển khoản ('in' hoặc 'out')
    const transferAmount = parseFloat(data.transferAmount || 0) || 0; // Số tiền chuyển khoản
    const accumulated = parseFloat(data.accumulated || 0) || 0; // Số dư tài khoản sau giao dịch
    const subAccount = data.subAccount || null; // Tài khoản phụ (nếu có)
    const referenceNumber = data.referenceCode || null; // Mã tham chiếu của tin nhắn sms (unique)
    const body = data.description || ''; // Toàn bộ nội dung tin nhắn sms

    let amountIn = 0; // Số tiền vào (chuyển in)
    let amountOut = 0; // Số tiền ra (chuyển out)
    if (transferType === 'in') amountIn = transferAmount; // Ghi nhận số tiền vào
    else if (transferType === 'out') amountOut = transferAmount; // Ghi nhận số tiền ra

    try {
        return await PaymentTransaction.create({
            id: id,
            gateway: gateway,
            transactionDate: transactionDate,
            accountNumber: accountNumber,
            subAccount: subAccount,
            amountIn: amountIn,
            amountOut: amountOut,
            accumulated: accumulated,
            code: code,
            transactionContent: transactionContent,
            referenceNumber: referenceNumber,
            body: body,
        });
    } catch (error) {
        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError' && referenceNumber) {
            console.log(`Duplicate transaction detected for referenceNumber: ${referenceNumber}`);
            // Trả về transaction đã tồn tại
            return await PaymentTransaction.findOne({ where: { id, referenceNumber } });
        }
        throw error;
    }
}

module.exports = { savePaymentTransaction };

