const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');
const { seedInitialData } = require('./seeders/initialData');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false, // Disable logging; default: console.log
});

// Import models
const Menu = require('./models/menu.model')(sequelize, DataTypes);
const Food = require('./models/food.model')(sequelize, DataTypes);
const MenuFood = require('./models/menuFood.model')(sequelize, DataTypes);
const Order = require('./models/order.model')(sequelize, DataTypes);
const OrderFood = require('./models/orderFood.model')(sequelize, DataTypes);
const PaymentTransaction = require('./models/paymentTransaction.model')(sequelize, DataTypes);
const User = require('./models/user.model')(sequelize, DataTypes);
const Receipt = require('./models/receipt.model')(sequelize, DataTypes);
const ReceiptItem = require('./models/receiptItem.model')(sequelize, DataTypes);
const Company = require('./models/company.model')(sequelize, DataTypes);
const Shop = require('./models/shop.model')(sequelize, DataTypes);
const UserShop = require('./models/userShop.model')(sequelize, DataTypes);
const DeviceType = require('./models/deviceType.model')(sequelize, DataTypes);
const Device = require('./models/device.model')(sequelize, DataTypes);

// Associations (Many-to-Many)
Menu.belongsToMany(Food, { through: MenuFood, foreignKey: 'menu_id', otherKey: 'food_id', as: 'food' });
Food.belongsToMany(Menu, { through: MenuFood, foreignKey: 'food_id', otherKey: 'menu_id', as: 'menu' });

// Order - Food (Many-to-Many) with extra fields (quantity, unitPrice)
Order.belongsToMany(Food, { through: OrderFood, foreignKey: 'order_id', otherKey: 'food_id', as: 'foods' });
Food.belongsToMany(Order, { through: OrderFood, foreignKey: 'food_id', otherKey: 'order_id', as: 'orders' });

// Order - Shop (Many-to-One) via shopCode
Order.belongsTo(Shop, { foreignKey: 'shopCode', targetKey: 'code', as: 'shop' });
Shop.hasMany(Order, { foreignKey: 'shopCode', sourceKey: 'code', as: 'orders' });

// Order - Receipt (One-to-Many)
Order.hasMany(Receipt, { foreignKey: 'order_id', as: 'receipts' });
Receipt.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Receipt - ReceiptItem (One-to-Many)
Receipt.hasMany(ReceiptItem, { foreignKey: 'receipt_id', as: 'items' });
ReceiptItem.belongsTo(Receipt, { foreignKey: 'receipt_id', as: 'receipt' });

// Company - Shop (One-to-Many)
Company.hasMany(Shop, { foreignKey: 'company_id', as: 'shops' });
Shop.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Company - User (One-to-Many)
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// User - Shop (Many-to-Many through UserShop)
User.belongsToMany(Shop, { through: UserShop, foreignKey: 'user_id', otherKey: 'shop_id', as: 'shops' });
Shop.belongsToMany(User, { through: UserShop, foreignKey: 'shop_id', otherKey: 'user_id', as: 'users' });

// UserShop associations
User.hasMany(UserShop, { foreignKey: 'user_id', as: 'shopAssignments' });
UserShop.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Shop.hasMany(UserShop, { foreignKey: 'shop_id', as: 'userAssignments' });
UserShop.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// Device - User associations
User.hasMany(Device, { foreignKey: 'user_id', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// DeviceType - Device associations
DeviceType.hasMany(Device, { foreignKey: 'type_id', as: 'devices' });
Device.belongsTo(DeviceType, { foreignKey: 'type_id', as: 'deviceType' });

// Keep seeding for menu/food only (DEV ONLY)
sequelize.sync({ alter: true }).then(async () => {
    console.log('Database synchronized');
    
    // ONLY seed data in development environment
    if (process.env.NODE_ENV === 'development') {
        console.log('🌱 Seeding initial data (Development only)...');
        
        // Pass all models to the seed function
        const models = {
            Food, Menu, MenuFood, Company, User, Shop, UserShop,
            DeviceType, Device, sequelize
        };
        
        await seedInitialData(models);
        console.log('✅ Seeding completed');
    } else {
        console.log('⏭️  Skipping seeding (Production environment)');
    }
}).catch(err => {
    console.error('Failed to synchronize database:', err);
});

module.exports = {
    sequelize,
    Sequelize,
    Menu,
    Food,
    MenuFood,
    Order,
    OrderFood,
    PaymentTransaction,
    User,
    Receipt,
    ReceiptItem,
    Company,
    Shop,
    UserShop,
    Device,
    DeviceType,
}