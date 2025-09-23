module.exports = (sequelize, DataTypes) => {
    const UserShop = sequelize.define('UserShop', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
        shopId: { type: DataTypes.INTEGER, allowNull: false, field: 'shop_id' },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active'
        },
        assignedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'assigned_at'
        }
    }, {
        tableName: 'user_shop',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['user_id', 'shop_id'] }, // Prevent duplicate assignments
            { fields: ['user_id'] },
            { fields: ['shop_id'] },
            { fields: ['status'] }
        ]
    });

    UserShop.associate = function(models) {
        UserShop.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        UserShop.belongsTo(models.Shop, {
            foreignKey: 'shopId', 
            as: 'shop'
        });
    };

    return UserShop;
};
