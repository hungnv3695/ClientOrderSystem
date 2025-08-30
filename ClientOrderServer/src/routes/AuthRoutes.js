const express = require('express');
const router = express.Router();
const { login, profile } = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/auth');

router.post('/login', login);
router.get('/profile', verifyToken, profile);

module.exports = router;
