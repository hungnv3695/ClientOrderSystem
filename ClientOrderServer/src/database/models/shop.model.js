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
            type: DataTypes.STRING(100),
            allowNull: false,
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
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
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
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'company_id',
        },
        createdCd: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'created_cd'
        },
        updatedCd: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'updated_cd'
        },
    }, {
        tableName: 'm_shop',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['company_id'] },
            { fields: ['code'], unique: true },
            { fields: ['name'] },
            { fields: ['bank_code'] },
            { fields: ['bank_number'] },
        ],
        hooks: {
            beforeCreate: (shop, options) => {
                shop.createdCd = options.userId || 'SYSTEM';
                shop.updatedCd =  options.userId || 'SYSTEM';
            },
            beforeUpdate: (shop, options) => {
                shop.updatedCd = options.userId || 'SYSTEM';
            }
        }
    });

    return Shop;
};
