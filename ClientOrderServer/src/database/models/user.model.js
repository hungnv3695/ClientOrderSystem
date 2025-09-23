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
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
        },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(20), allowNull: true },
        companyId: { type: DataTypes.INTEGER, allowNull: false, field: 'company_id' },
    }, {
        tableName: 'user',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['username'] },
            { fields: ['company_id'] },
            { fields: ['code'] },
        ],
    });
    
    // Associations
    User.associate = function(models) {
        // User thuộc về một Company
        User.belongsTo(models.Company, {
            foreignKey: 'companyId',
            as: 'company'
        });
        
        // User có thể thuộc về nhiều Shops (Many-to-Many)
        User.belongsToMany(models.Shop, {
            through: models.UserShop,
            foreignKey: 'userId',
            otherKey: 'shopId',
            as: 'shops'
        });
        
        // User có thể có nhiều UserShop assignments
        User.hasMany(models.UserShop, {
            foreignKey: 'userId',
            as: 'shopAssignments'
        });
    };
    
    return User;
};
