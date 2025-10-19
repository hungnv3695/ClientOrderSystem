const bcrypt = require('bcryptjs');
const { formatDateTime } = require('../../utils/dateTimeUtils.js');

async function seedInitialData(models) {
    const {
        Food, Menu, MenuFood, Company, User, Shop, UserShop, 
        DeviceType, Device, sequelize
    } = models;

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
                    { name: 'Bánh mì', price: 20000, description: 'Bánh mì thịt truyền thống', image: 'banh-mi.jpg', status: 1 },
                    { name: 'Cà phê đen', price: 15000, description: 'Cà phê đen đậm đà', image: 'ca-phe-den.jpg', status: 1 },
                    { name: 'Cà phê sữa đá', price: 18000, description: 'Cà phê sữa đá thơm ngon', image: 'ca-phe-sua-da.jpg', status: 1 },
                    { name: 'Trà đá', price: 5000, description: 'Trà đá mát lạnh', image: 'tra-da.jpg', status: 1 },
                    { name: 'Nước sấu', price: 12000, description: 'Nước sấu Hà Nội', image: 'nuoc-sau.jpg', status: 1 },
                    { name: 'Bún chả', price: 35000, description: 'Bún chả Hà Nội truyền thống', image: 'bun-cha.jpg', status: 1 },
                    { name: 'Phở bò', price: 40000, description: 'Phở bò tái chín', image: 'pho-bo.jpg', status: 1 },
                    { name: 'Bánh cuốn', price: 25000, description: 'Bánh cuốn nóng chấm nước mắm', image: 'banh-cuon.jpg', status: 1 },
                    { name: 'Chả cá Lã Vọng', price: 45000, description: 'Chả cá Lã Vọng với bún tươi', image: 'cha-ca.jpg', status: 1 },
                    { name: 'Bắp xào bơ', price: 22000, description: 'Bắp xào bơ thơm ngon', image: 'bap-xao-bo.jpg', status: 1 }
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
                    { menuId: createdMenus[0].id, foodId: createdFoods[4].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[5].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[6].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[7].id },
                    { menuId: createdMenus[0].id, foodId: createdFoods[8].id },
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

        // Seed Company data first (before users)
        let defaultCompany;
        try {
            const [company, companyCreated] = await Company.findOrCreate({
                where: { code: 'HBC' },
                defaults: {
                    code: 'HBC',
                    name: 'Hung Bakery & Coffee',
                    registration_number: 'REG2024001',
                    address: 'Hà Nội, Việt Nam',
                    phone: '+84987654321',
                    email: 'info@hungbakerycoffee.com',
                    website: 'https://hungbakerycoffee.com',
                    description: 'Chuỗi cà phê và bánh ngọt cao cấp',
                    status: 1, // INTEGER: 1=active, 0=inactive
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                }
            });
            defaultCompany = company;
            console.log('Company seed status => company:', companyCreated ? 'created' : 'exists');
        } catch (cErr) {
            console.error('Company seed failed:', cErr);
            return; // Stop seeding if company creation fails
        }

        // Seed 3 default users with different roles if users table empty
        try {
            const hash = await bcrypt.hash('123456', 10);

            const [managerUser, managerCreated] = await User.findOrCreate({
                where: { username: 'manager' },
                defaults: {
                    username: 'manager',
                    password: hash,
                    role: 'manager',
                    code: 'MGR001',
                    email: 'manager@company.com',
                    status: 1,
                    companyId: defaultCompany.id,
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                },
            });

            const [staffUser, staffCreated] = await User.findOrCreate({
                where: { username: 'staff' },
                defaults: {
                    username: 'staff',
                    password: hash,
                    role: 'staff',
                    code: 'STF001',
                    email: 'staff@company.com',
                    status: 1,
                    companyId: defaultCompany.id,
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                },
            });

            const [deviceUser, deviceCreated] = await User.findOrCreate({
                where: { username: 'device' },
                defaults: {
                    username: 'device',
                    password: hash,
                    role: 'device',
                    code: 'DEV001',
                    email: 'device@company.com',
                    status: 1,
                    companyId: defaultCompany.id,
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                },
            });

            console.log('User seed status => manager:', managerCreated ? 'created' : 'exists',
                ', staff:', staffCreated ? 'created' : 'exists',
                ', device:', deviceCreated ? 'created' : 'exists');
        } catch (uErr) {
            console.error('User seed failed:', uErr);
        }

        // Seed Shop data
        try {
            const [shop, shopCreated] = await Shop.findOrCreate({
                where: { code: 'HBC001' },
                defaults: {
                    code: 'HBC001',
                    name: 'HBC Tô Hiệu',
                    companyId: defaultCompany.id,
                    address: '81 Tô Hiệu',
                    phone: '7085214356',
                    email: 'hung.dev95@gmail.com',
                    managerId: null, // Có thể set manager sau
                    status: 1, // INTEGER: 1=active, 0=inactive
                    bankCode: 'VCB',
                    bankNumber: '0011004365510',
                    bankNumberName: 'NGUYEN VIET HUNG',
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                }
            });

            console.log('Shop seed status => shop:', shopCreated ? 'created' : 'exists');

            // Seed UserShop assignments
            const deviceUser = await User.findOne({ where: { username: 'device', role: 'device' } });
            const staffUser = await User.findOne({ where: { username: 'staff', role: 'staff' } });

            if (deviceUser && shop.id) {
                const [deviceShopAssignment, deviceAssigned] = await UserShop.findOrCreate({
                    where: { userId: deviceUser.id, shopId: shop.id },
                    defaults: {
                        userId: deviceUser.id,
                        shopId: shop.id,
                        status: 1,
                        assignedAt: formatDateTime(new Date()),
                        createdCd: 'SYSTEM',
                        updatedCd: 'SYSTEM'
                    }
                });
                console.log('Device user shop assignment:', deviceAssigned ? 'created' : 'exists');
            }

            if (staffUser && shop.id) {
                const [staffShopAssignment, staffAssigned] = await UserShop.findOrCreate({
                    where: { userId: staffUser.id, shopId: shop.id },
                    defaults: {
                        userId: staffUser.id,
                        shopId: shop.id,
                        status: 1,
                        assignedAt: formatDateTime(new Date()),
                        createdCd: 'SYSTEM',
                        updatedCd: 'SYSTEM'
                    }
                });
                console.log('Staff user shop assignment:', staffAssigned ? 'created' : 'exists');
            }
        } catch (sErr) {
            console.error('Shop seed failed:', sErr);
        }

        // Seed DeviceType data
        try {
            const [printerType, printerCreated] = await DeviceType.findOrCreate({
                where: { code: 'PRT' },
                defaults: {
                    code: 'PRT',
                    name: 'printer',
                    description: 'máy in hóa đơn'
                }
            });

            const [tabletType, tabletCreated] = await DeviceType.findOrCreate({
                where: { code: 'TBL' },
                defaults: {
                    code: 'TBL',
                    name: 'tablet',
                    description: 'máy tính bảng'
                }
            });

            console.log('DeviceType seed status => printer:', printerCreated ? 'created' : 'exists',
                ', tablet:', tabletCreated ? 'created' : 'exists');
        } catch (dtErr) {
            console.error('DeviceType seed failed:', dtErr);
        }

        // Seed Device data
        try {
            // Sử dụng user device có sẵn (username: 'device', id: 3)
            const existingDeviceUser = await User.findOne({
                where: { username: 'device', role: 'device' }
            });

            if (!existingDeviceUser) {
                console.log('Device user not found, please ensure device user exists');
                return;
            }

            console.log('Using existing device user - ID:', existingDeviceUser.id, 'Username:', existingDeviceUser.username);

            // Get device types
            const printerType = await DeviceType.findOne({ where: { code: 'PRT' } });
            const tabletType = await DeviceType.findOne({ where: { code: 'TBL' } });

            if (!printerType || !tabletType) {
                console.error('DeviceType not found. Please run DeviceType seed first.');
                return;
            }

            // Seed printer device
            const [printerDevice, printerDeviceCreated] = await Device.findOrCreate({
                where: { code: 'PRT00001' },
                defaults: {
                    code: 'PRT00001',
                    name: 'Epson TM-M10',
                    serialNumber: 'SN00000001',
                    brand: 'EPSON',
                    ip: '192.168.11.9',
                    port: '80',
                    typeId: printerType.id,
                    userId: existingDeviceUser.id,
                    status: 1,
                    note: 'máy in hóa đơn số 1',
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                }
            });

            // Seed tablet device
            const [tabletDevice, tabletDeviceCreated] = await Device.findOrCreate({
                where: { code: 'KSK001' },
                defaults: {
                    code: 'KSK001',
                    name: 'Surface pro 5',
                    serialNumber: 'SN00000012',
                    brand: 'Microsoft',
                    ip: '192.168.11.6',
                    port: '5173',
                    typeId: tabletType.id,
                    userId: existingDeviceUser.id,
                    status: 1,
                    note: 'máy tính bảng order số 1',
                    createdCd: 'SYSTEM',
                    updatedCd: 'SYSTEM'
                }
            });

            console.log('Device seed status => printer device:', printerDeviceCreated ? 'created' : 'exists',
                ', tablet device:', tabletDeviceCreated ? 'created' : 'exists');
        } catch (dErr) {
            console.error('Device seed failed:', dErr);
        }
    } catch (err) {
        console.error('Seed pre-check failed:', err);
    }
}

module.exports = { seedInitialData };
