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

// Associations (Many-to-Many)
Menu.belongsToMany(Food, { through: MenuFood, foreignKey: 'menu_id', otherKey: 'food_id', as: 'food' });
Food.belongsToMany(Menu, { through: MenuFood, foreignKey: 'food_id', otherKey: 'menu_id', as: 'menu' });

// Order - Food (Many-to-Many) with extra fields (quantity, unitPrice)
Order.belongsToMany(Food, { through: OrderFood, foreignKey: 'order_id', otherKey: 'food_id', as: 'foods' });
Food.belongsToMany(Order, { through: OrderFood, foreignKey: 'food_id', otherKey: 'order_id', as: 'orders' });

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
            return;
        }

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
}