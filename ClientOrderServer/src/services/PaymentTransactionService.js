const { PaymentTransaction } = require('../database');

/**
 * Lưu transaction thanh toán vào bảng payment_transactions
 * @param {object} data Raw payload từ webhook
 * @returns {Promise<import('sequelize').Model>} PaymentTransaction record
 */
async function savePaymentTransaction(data) {
    // Map và chuẩn hóa
    const gateway = data.gateway;
    const transactionDate = data.transactionDate || data.transaction_date || new Date();
    const accountNumber = data.accountNumber || data.account_number || null;
    const subAccount = data.subAccount || data.sub_account || null;

    const transferType = data.transferType || data.transfer_type;
    const transferAmount = parseFloat(data.transferAmount || data.transfer_amount || 0) || 0;
    const accumulated = parseFloat(data.accumulated || 0) || 0;

    const code = data.code || null;
    const transactionContent = data.transactionContent || data.content || data.transaction_content || null;
    const referenceNumber = data.referenceNumber || data.reference_number || data.referenceCode || null;
    const body = data.description || data.body || JSON.stringify(data);

    let amountIn = 0;
    let amountOut = 0;
    if (transferType === 'in') amountIn = transferAmount;
    else if (transferType === 'out') amountOut = transferAmount;

    return await PaymentTransaction.create({
        gateway,
        transactionDate,
        accountNumber,
        subAccount,
        amountIn,
        amountOut,
        accumulated,
        code,
        transactionContent,
        referenceNumber,
        body,
    });
}

module.exports = { savePaymentTransaction };

