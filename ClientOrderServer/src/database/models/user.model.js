module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
        password: { type: DataTypes.STRING(255), allowNull: false },
        code: { type: DataTypes.STRING(10), allowNull: false },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: { isIn: [['staff', 'manager', 'device']] },
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        email: { type: DataTypes.STRING(100), allowNull: true },
        phone: { type: DataTypes.STRING(20), allowNull: true },
        companyId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            field: 'company_id'
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
    }, {
        tableName: 'm_user',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['username'] },
            { fields: ['company_id'] },
            { fields: ['code'] },
        ],
        hooks: {
            beforeCreate: (user, options) => {
                user.createdCd = options.userId || 'SYSTEM';
                user.updatedCd = options.userId || 'SYSTEM';
            },
            beforeUpdate: (user, options) => {
                user.updatedCd = options.userId || 'SYSTEM';
            }
        }
    });
    
    return User;
};
