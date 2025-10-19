module.exports = (sequelize, DataTypes) => {
    const UserShop = sequelize.define('UserShop', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            field: 'user_id' 
        },
        shopId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            field: 'shop_id' 
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        assignedAt: {
            type: DataTypes.STRING(14), // yyyyMMddHHmmss format (14 chars)
            allowNull: true,
            field: 'assigned_at'
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
        tableName: 't_user_shop',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['user_id', 'shop_id'] },
            { fields: ['user_id'] },
            { fields: ['shop_id'] },
            { fields: ['status'] }
        ],
        hooks: {
            beforeCreate: (userShop, options) => {
                userShop.createdCd = options.userId || 'SYSTEM';
                userShop.updatedCd = options.userId || 'SYSTEM';
            },
            beforeUpdate: (userShop, options) => {
                userShop.updatedCd = options.userId || 'SYSTEM';
            }
        }
    });

    return UserShop;
};
