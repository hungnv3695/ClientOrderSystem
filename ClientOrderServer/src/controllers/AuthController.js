const { User } = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/app.config');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password' });

        // Check if user status is active
        if (user.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ success: false, message: 'Invalid username or password' });

        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            code: user.code,
            email: user.email,
            shopId: user.shopId
        };
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        res.json({ success: true, data: { token, user: payload } });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.profile = async (req, res) => {
    try {
        const user = req.user;
        res.json({ success: true, data: user });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
