const { getMenu } = require('../services/MenuService')

// Controller trả về danh sách menu hoặc theo id nếu có
exports.getMenu = async (req, res) => {
    try {
        const { id } = req.query; // ví dụ: /api/menus?id=1
        const menu = await getMenu(id);

        if (id && !menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        res.json({ success: true, data: menu })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}
