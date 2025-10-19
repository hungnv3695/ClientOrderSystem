const express = require('express')
const router = express.Router()
const menuController = require('../controllers/MenuController')

// API Documentation: See docs/swagger/menu.yaml

// GET /api/menus - Lấy tất cả menus hoặc menu cụ thể theo ID (?id=1)
router.get('/', menuController.getMenu)

module.exports = router;
