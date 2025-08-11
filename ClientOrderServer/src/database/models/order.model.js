// src/database/models/order.model.js
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
            status: {
                type: DataTypes.STRING(20), // Waiting | Completed | Cancelled
                allowNull: false,
                defaultValue: 'Waiting',
            },
            // Trạng thái thanh toán: Unpaid | Paid | Refunded
            paymentStatus: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'Unpaid',
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
