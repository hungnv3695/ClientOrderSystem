module.exports = (sequelize, DataTypes) => {
    const DeviceType = sequelize.define('DeviceType', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        code: { 
            type: DataTypes.STRING(20), 
            allowNull: false 
        },
        name: { 
            type: DataTypes.STRING(20), 
            allowNull: false 
        },
        description: { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        }
    }, {
        tableName: 'device_type',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['code'] },
            { fields: ['name'] }
        ]
    });

    return DeviceType;
};
