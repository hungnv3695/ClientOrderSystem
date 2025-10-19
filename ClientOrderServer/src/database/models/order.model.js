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
            // Status: 0=Cancelled, 1=Received, 2=Processing, 3=Completed, 4=Delivered
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1, // 1 = Received
            },
            // Payment Status: 0=Unpaid, 1=Paid
            paymentStatus: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0, // 0 = Unpaid
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
            shopCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: 'shop_code',
            },
            createdCd: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'created_cd',
            },
            updatedCd: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'updated_cd',
            },
        },
        {
            tableName: 't_order',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                { unique: true, fields: ['order_number'] },
                { fields: ['shop_code'] },
                { fields: ['status'] },
                { fields: ['shop_code', 'status'] },
            ],
            hooks: {
                beforeCreate: (order, options) => {
                    order.createdCd = options.userId || 'SYSTEM';
                    order.updatedCd =  options.userId || 'SYSTEM';
                },
                beforeUpdate: (order, options) => {
                    order.updatedCd = options.userId || 'SYSTEM';
                }
            }
        }
    );

    return Order;
};
