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
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'menu',
            timestamps: true,
            underscored: true,
        }
    );

    return Menu;
};
