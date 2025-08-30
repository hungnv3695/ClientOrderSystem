// src/database/models/receiptItem.model.js
module.exports = (sequelize, DataTypes) => {
    const ReceiptItem = sequelize.define('ReceiptItem', {
        receiptItemId: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'receipt_item_id',
        },
        receiptId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'receipt_id',
        },
        itemId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'item_id',
        },
        itemName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'item_name',
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'unit_price',
        },
        totalPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'total_price',
        },
    }, {
        tableName: 'receipt_item',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['receipt_id'] },
            { fields: ['item_id'] },
        ],
    });

    return ReceiptItem;
};
