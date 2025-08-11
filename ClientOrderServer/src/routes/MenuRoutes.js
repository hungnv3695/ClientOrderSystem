const express = require('express')
const router = express.Router()
const menuController = require('../controllers/MenuController')

// Route lấy danh sách menu
router.get('/', menuController.getMenu)

module.exports = router;
