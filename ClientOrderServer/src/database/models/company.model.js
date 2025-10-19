// src/database/models/company.model.js
module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define(
        'Company',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            code: {
                type: DataTypes.STRING(3),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            registration_number: {
                type: DataTypes.STRING(100),
                allowNull: true,
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
            website: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            createdCd: {
                type: DataTypes.STRING(50),
                allowNull: false,
                fields: 'created_cd'
            },
            updatedCd: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'updated_cd'
            },
        },
        {
            tableName: 'm_company',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                { fields: ['code'] },
                { fields: ['registration_number'] },
                { fields: ['status'] },
            ],
            hooks: {
                beforeCreate: (company, options) => {
                    company.createdCd = options.userId || 'SYSTEM';
                    company.updatedCd =  options.userId || 'SYSTEM';
                },
                beforeUpdate: (company, options) => {
                    company.updatedCd = options.userId || 'SYSTEM';
                }
            }
        }
    );

    return Company;
};
