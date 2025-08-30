const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');
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

// Associations (Many-to-Many)
Menu.belongsToMany(Food, { through: MenuFood, foreignKey: 'menu_id', otherKey: 'food_id', as: 'food' });
Food.belongsToMany(Menu, { through: MenuFood, foreignKey: 'food_id', otherKey: 'menu_id', as: 'menu' });

// Order - Food (Many-to-Many) with extra fields (quantity, unitPrice)
Order.belongsToMany(Food, { through: OrderFood, foreignKey: 'order_id', otherKey: 'food_id', as: 'foods' });
Food.belongsToMany(Order, { through: OrderFood, foreignKey: 'food_id', otherKey: 'order_id', as: 'orders' });

// Order - Receipt (One-to-Many)
Order.hasMany(Receipt, { foreignKey: 'order_id', as: 'receipts' });
Receipt.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Receipt - ReceiptItem (One-to-Many)
Receipt.hasMany(ReceiptItem, { foreignKey: 'receipt_id', as: 'items' });
ReceiptItem.belongsTo(Receipt, { foreignKey: 'receipt_id', as: 'receipt' });

// Company - Shop (One-to-Many)
Company.hasMany(Shop, { foreignKey: 'company_id', as: 'shops' });
Shop.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Shop - User (One-to-Many)
Shop.hasMany(User, { foreignKey: 'shop_id', as: 'users' });
User.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// Shop.manager -> User (manager_id) (optional)
User.hasMany(Shop, { foreignKey: 'manager_id', as: 'managedShops' });
Shop.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// Keep seeding for menu/food only
async function seedInitialData() {
    try {
        const [foodCount, menuCount, linkCount] = await Promise.all([
            Food.count(),
            Menu.count(),
            MenuFood.count()
        ]);

        if (foodCount > 0 || menuCount > 0 || linkCount > 0) {
            console.log('Seed skipped: tables already contain data');
        } else {
            const t = await sequelize.transaction();
            try {
                const foods = [
                    { name: 'Bánh mì', price: 20000, description: 'Bánh mì thịt truyền thống', image: 'banh-mi.jpg', isActive: true },
                    { name: 'Cà phê đen', price: 15000, description: 'Cà phê đen đậm đà', image: 'ca-phe-den.jpg', isActive: true },
                    { name: 'Cà phê sữa đá', price: 18000, description: 'Cà phê sữa đá thơm ngon', image: 'ca-phe-sua-da.jpg', isActive: true },
                    { name: 'Trà đá', price: 5000, description: 'Trà đá mát lạnh', image: 'tra-da.jpg', isActive: true },
                    { name: 'Nước sấu', price: 12000, description: 'Nước sấu Hà Nội', image: 'nuoc-sau.jpg', isActive: true },
                ];

                const menus = [
                    { name: 'Menu Sáng', description: 'Thực đơn buổi sáng' },
                    { name: 'Menu Trưa', description: 'Thực đơn buổi trưa' },
                ];

                const createdFoods = await Food.bulkCreate(foods, { returning: true, transaction: t });
                const createdMenus = await Menu.bulkCreate(menus, { returning: true, transaction: t });

                const links = [
                    { menuId: createdMenus[0].id, foodId: createdFoods[0].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[1].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[3].id },
                    { menuId: createdMenus[1].id, foodId: createdFoods[0].id },
                    { menuId: createdMenus[1].id, foodId: createdFoods[2].id },
                    { menuId: createdMenus[1].id, foodId: createdFoods[4].id },
                ];

                await MenuFood.bulkCreate(links, { transaction: t });

                await t.commit();
                console.log('Seed completed: inserted sample food, menu and relations');
            } catch (err) {
                await t.rollback();
                console.error('Seed failed, transaction rolled back:', err);
            }
        }

        // Seed 3 default users with different roles if users table empty
        try {
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('123456', 10);

            const [managerUser, managerCreated] = await User.findOrCreate({
                where: { username: 'manager' },
                defaults: {
                    username: 'manager',
                    passwordHash: hash,
                    role: 'manager',
                    code: 'MGR001',
                    email: 'manager@company.com',
                    status: 'ACTIVE'
                },
            });

            const [staffUser, staffCreated] = await User.findOrCreate({
                where: { username: 'staff' },
                defaults: {
                    username: 'staff',
                    passwordHash: hash,
                    role: 'staff',
                    code: 'STF001',
                    email: 'staff@company.com',
                    status: 'ACTIVE'
                },
            });

            const [deviceUser, deviceCreated] = await User.findOrCreate({
                where: { username: 'device' },
                defaults: {
                    username: 'device',
                    passwordHash: hash,
                    role: 'device',
                    code: 'DEV001',
                    email: 'device@company.com',
                    status: 'ACTIVE'
                },
            });

            console.log('User seed status => manager:', managerCreated ? 'created' : 'exists',
                ', staff:', staffCreated ? 'created' : 'exists',
                ', device:', deviceCreated ? 'created' : 'exists');
        } catch (uErr) {
            console.error('User seed failed:', uErr);
        }
    } catch (err) {
        console.error('Seed pre-check failed:', err);
    }
}

sequelize.sync({ alter: true }).then(async () => {
    console.log('Database synchronized');
    await seedInitialData();
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
}