// src/database/models/receipt.model.js
module.exports = (sequelize, DataTypes) => {
    const Receipt = sequelize.define('Receipt', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'order_id',
        },
        receiptNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'receipt_number',
        },
        totalAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'total_amount',
        },
        discountAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'discount_amount',
        },
        taxAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'tax_amount',
        },
        finalAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'final_amount',
        },
        paidAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'paid_amount',
        },
        changeAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'change_amount',
        },
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'payment_method',
        },
        paidAt: {
            type: DataTypes.STRING(14), // yyyyMMddHHmmss format (14 chars)
            allowNull: true,
            field: 'paid_at',
        },
        cashierId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'cashier_id',
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'status',
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdCd: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'created_cd',
        },
        updatedCd: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'updated_cd',
        },
    }, {
        tableName: 't_receipt',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['order_id'] },
            { unique: true, fields: ['receipt_number'] },
        ],
        hooks: {
            beforeCreate: (receipt, options) => {
                receipt.createdCd = options.userId || 'SYSTEM';
                receipt.updatedCd = options.userId || 'SYSTEM';
            },
            beforeUpdate: (receipt, options) => {
                receipt.updatedCd = options.userId || 'SYSTEM';
            }
        }
    });

    return Receipt;
};
