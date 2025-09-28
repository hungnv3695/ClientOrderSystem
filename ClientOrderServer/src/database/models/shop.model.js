// src/database/models/shop.model.js
module.exports = (sequelize, DataTypes) => {
    const Shop = sequelize.define('Shop', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING(8),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'company_id',
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        managerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'manager_id',
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
        },
        bankCode: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'bank_code',
        },
        bankNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'bank_number',
        },
        bankNumberName: {
            type: DataTypes.STRING(60),
            allowNull: true,
            field: 'bank_number_name',
        },
    }, {
        tableName: 'shop',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['company_id'] },
            { fields: ['manager_id'] },
            { fields: ['code'], unique: true },
            { fields: ['name'] },
            { fields: ['bank_code'] },
            { fields: ['bank_number'] },
        ],
    });

    return Shop;
};
