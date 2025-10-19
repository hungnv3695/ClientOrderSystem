module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define('Device', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        code: { 
            type: DataTypes.STRING(8), 
            allowNull: false 
        },
        name: { 
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        serialNumber: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            field: 'serial_number' 
        },
        brand: { 
            type: DataTypes.STRING(100), 
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
        typeId: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            field: 'type_id'
        },
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            field: 'user_id' 
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0: available, 1: using, 99: removed'
        },
        note: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        },
        createdCd: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'created_cd',
        },
        updatedCd: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'updated_cd',
        },
    }, {
        tableName: 'm_device',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['code'] },
            { fields: ['type_id'] },
            { fields: ['user_id'] },
            { fields: ['status'] },
            { fields: ['serial_number'] }
        ],
        hooks: {
            beforeCreate: (device, options) => {
                device.createdCd = options.userId || 'SYSTEM';
                device.updatedCd = options.userId || 'SYSTEM';
            },
            beforeUpdate: (device, options) => {
                device.updatedCd = options.userId || 'SYSTEM';
            }
        }
    });

    return Device;
};
