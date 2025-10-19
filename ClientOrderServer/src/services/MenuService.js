const { Menu, Food } = require('../database');
const { FOOD_STATUS } = require('../constants/app.constants');

// Lấy menu theo id kèm foods
async function getMenu(id) {

    const menus = await Menu.findByPk(id, {
        include: [
            {
                model: Food,
                as: 'food',
                through: { attributes: [] }, // ẩn cột từ bảng trung gian
                where: { status: FOOD_STATUS.ACTIVE }, // chỉ lấy món đang active (1 = active)
                attributes: ['id', 'name', 'price', 'description', 'image', 'status'],
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
