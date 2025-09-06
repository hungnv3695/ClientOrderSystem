const { getMenu } = require('../services/MenuService');
const logger = require('../utils/logger');

// Controller trả về danh sách menu hoặc theo id nếu có
exports.getMenu = async (req, res) => {
    const { id } = req.query; // ví dụ: /api/menus?id=1
    
    // Log menu request
    logger.logOrderEvent('menu_request', {
        requestType: id ? 'specific_menu' : 'all_menus',
        menuId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    try {
        const menu = await getMenu(id);

        if (id && !menu) {
            logger.logOrderEvent('menu_not_found', {
                menuId: id,
                ip: req.ip
            });
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        // Log successful menu retrieval
        logger.logOrderEvent('menu_retrieved', {
            menuId: id || 'all',
            itemCount: Array.isArray(menu) ? menu.length : (menu ? 1 : 0),
            ip: req.ip
        });

        res.json({ success: true, data: menu });
    } catch (err) {
        logger.logError(err, {
            action: 'get_menu',
            menuId: id,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
