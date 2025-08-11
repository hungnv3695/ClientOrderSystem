// src/database/models/menuFood.model.js
module.exports = (sequelize, DataTypes) => {
    const MenuFood = sequelize.define(
        'MenuFood',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            menuId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'menu_id',
            },
            foodId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'food_id',
            },
        },
        {
            tableName: 'menu_food',
            timestamps: true,
            underscored: true,
        }
    );

    return MenuFood;
};
