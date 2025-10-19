module.exports = (sequelize, DataTypes) => {
    const DeviceType = sequelize.define('DeviceType', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        code: { 
            type: DataTypes.STRING(20), 
            allowNull: false 
        },
        name: { 
            type: DataTypes.STRING(20), 
            allowNull: true
        },
        description: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        }
    }, {
        tableName: 'm_device_type',
        underscored: true,
        timestamps: false,
        indexes: [
            { unique: true, fields: ['code'] },
            { fields: ['name'] }
        ]
    });

    return DeviceType;
};
