module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define('Device', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        code: { 
            type: DataTypes.STRING(8), 
            allowNull: false 
        },
        name: { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        },
        serialNumber: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            field: 'serial_number' 
        },
        brand: { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        },
        ip: { 
            type: DataTypes.STRING(20), 
            allowNull: true 
        },
        port: { 
            type: DataTypes.STRING(10), 
            allowNull: true 
        },
        type: { 
            type: DataTypes.STRING(20), 
            allowNull: true 
        },
        status: {
            type: DataTypes.ENUM('used', 'unused', 'removed'),
            allowNull: false,
            defaultValue: 'unused'
        },
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            field: 'user_id' 
        },
        note: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        }
    }, {
        tableName: 'device',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['code'] },
            { fields: ['type'], name: 'device_type_idx' },
            { fields: ['user_id'] },
            { fields: ['status'] },
            { fields: ['serial_number'] }
        ]
    });

    return Device;
};
