// src/database/models/receipt.model.js
module.exports = (sequelize, DataTypes) => {
    const Receipt = sequelize.define('Receipt', {
        receiptId: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'receipt_id',
        },
        orderId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'order_id',
        },
        receiptNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'receipt_number',
        },
        totalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'total_amount',
        },
        discountAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'discount_amount',
        },
        taxAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'tax_amount',
        },
        finalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'final_amount',
        },
        paidAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'paid_amount',
        },
        changeAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'change_amount',
        },
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'card', 'ewallet', 'bank_transfer'),
            allowNull: false,
            field: 'payment_method',
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'paid_at',
        },
        cashierId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'cashier_id',
        },
        status: {
            type: DataTypes.ENUM('Unpaid', 'Paid', 'Refunded'),
            allowNull: false,
            defaultValue: 'Unpaid',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'receipt',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['order_id'] },
            { unique: true, fields: ['receipt_number'] },
        ],
    });

    return Receipt;
};
