const { Menu, Food } = require('../database');

// Lấy menu theo id kèm foods
async function getMenu(id) {

    const menus = await Menu.findByPk(id, {
        include: [
            {
                model: Food,
                as: 'food',
                through: { attributes: [] }, // ẩn cột từ bảng trung gian
                where: { isActive: true }, // bật nếu chỉ muốn món đang active
                attributes: ['id', 'name', 'price', 'description', 'image', 'isActive'],
            },
        ],
        order: [
            ['id', 'ASC'],
            [{ model: Food, as: 'food' }, 'id', 'ASC'],
        ],
        attributes: ['id', 'name', 'description'],
    });

    return menus; // Sequelize tự chuyển toJSON() khi res.json()
}

module.exports = {
    getMenu,
};
