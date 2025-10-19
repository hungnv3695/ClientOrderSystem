// src/database/models/receiptItem.model.js
module.exports = (sequelize, DataTypes) => {
    const ReceiptItem = sequelize.define('ReceiptItem', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        receiptId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'receipt_id',
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'item_id',
        },
        itemName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'item_name',
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'unit_price',
        },
        totalPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'total_price',
        },
        createdCd: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'created_cd',
        },
    }, {
        tableName: 't_receipt_item',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['receipt_id'] },
            { fields: ['item_id'] },
        ],
        hooks: {
            beforeCreate: (receiptItem, options) => {
                receiptItem.createdCd = options.userId || 'SYSTEM';
            }
        }
    });

    return ReceiptItem;
};
