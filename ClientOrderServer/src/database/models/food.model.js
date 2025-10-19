// src/database/models/food.model.js
module.exports = (sequelize, DataTypes) => {
    const Food = sequelize.define(
        'Food',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1, // 1 = active, 0 = inactive
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
            tableName: 'm_food',
            timestamps: true,
            underscored: true,
            hooks: {
                beforeCreate: (food, options) => {
                    food.createdCd = options.userId || 'SYSTEM';
                    food.updatedCd = options.userId || 'SYSTEM';
                },
                beforeUpdate: (food, options) => {
                    food.updatedCd = options.userId || 'SYSTEM';
                }
            }
        }
    );

    return Food;
};
