// src/database/models/orderFood.model.js
module.exports = (sequelize, DataTypes) => {
    const OrderFood = sequelize.define(
        'OrderFood',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'order_id',
            },
            foodId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'food_id',
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            unitPrice: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'unit_price',
            },
        },
        {
            tableName: 'order_food',
            timestamps: true,
            underscored: true,
        }
    );

    return OrderFood;
};
