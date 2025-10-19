// src/database/models/menu.model.js
module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define(
        'Menu',
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            tableName: 'm_menu',
            timestamps: true,
            underscored: true,
            hooks: {
                beforeCreate: (menu, options) => {
                    menu.createdCd = options.userId || 'SYSTEM';
                    menu.updatedCd = options.userId || 'SYSTEM';
                },
                beforeUpdate: (menu, options) => {
                    menu.updatedCd = options.userId || 'SYSTEM';
                }
            }
        }
    );

    return Menu;
};
