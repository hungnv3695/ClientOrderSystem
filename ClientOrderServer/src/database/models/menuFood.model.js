// src/database/models/menuFood.model.js
module.exports = (sequelize, DataTypes) => {
    const MenuFood = sequelize.define(
        'MenuFood',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            menuId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: 'menu_id',
            },
            foodId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: 'food_id',
            },
            createdCd: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'created_cd',
            },
            updatedCd: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'updated_cd',
            },
        },
        {
            tableName: 't_menu_food',
            timestamps: true,
            underscored: true,
            hooks: {
                beforeCreate: (menuFood, options) => {
                    menuFood.createdCd = options.userId || 'SYSTEM';
                    menuFood.updatedCd = options.userId || 'SYSTEM';
                },
                beforeUpdate: (menuFood, options) => {
                    menuFood.updatedCd = options.userId || 'SYSTEM';
                }
            }
        }
    );

    return MenuFood;
};
