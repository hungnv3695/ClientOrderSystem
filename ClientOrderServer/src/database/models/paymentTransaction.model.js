// src/database/models/paymentTransaction.model.js
module.exports = (sequelize, DataTypes) => {
    const PaymentTransaction = sequelize.define('PaymentTransaction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        gateway: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'transaction_date',
            defaultValue: DataTypes.NOW,
        },
        accountNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'account_number',
        },
        subAccount: {
            type: DataTypes.STRING(250),
            allowNull: true,
            field: 'sub_account',
        },
        amountIn: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'amount_in',
        },
        amountOut: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'amount_out',
        },
        accumulated: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        code: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        transactionContent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'transaction_content',
        },
        referenceNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'reference_number',
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at',
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'payment_transactions',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['transaction_date'] },
            { fields: ['gateway'] },
            { fields: ['account_number'] },
            { fields: ['code'] },
            { fields: ['reference_number'] },
        ],
    });

    return PaymentTransaction;
};
