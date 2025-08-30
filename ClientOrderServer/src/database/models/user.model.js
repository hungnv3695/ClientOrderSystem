module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
        passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
        code: { type: DataTypes.STRING(10), allowNull: false },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'staff',
            validate: { isIn: [['staff', 'manager', 'device']] },
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(20), allowNull: true },
        shopId: { type: DataTypes.INTEGER, allowNull: true, field: 'shop_id' },
    }, {
        tableName: 'user',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['username'] },
            { fields: ['shop_id'] },
            { fields: ['code'] },
        ],
    });
    return User;
};
