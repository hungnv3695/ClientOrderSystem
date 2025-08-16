// src/database/models/order.model.js
const { ORDER_STATUS, PAYMENT_STATUS } = require('../../constants/order.constants');
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define(
        'Order',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderNumber: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                field: 'order_number',
            },
            // Received | Processing | Completed | Delivered | Cancelled
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: ORDER_STATUS.RECEIVED,
            },
            // Trạng thái thanh toán: Unpaid | Paid | Refunded
            paymentStatus: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: PAYMENT_STATUS.UNPAID,
                field: 'payment_status',
            },
            totalPrice: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'total_price',
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'order',
            timestamps: true,
            underscored: true,
            indexes: [
                { unique: true, fields: ['order_number'] },
            ]
        }
    );

    return Order;
};
