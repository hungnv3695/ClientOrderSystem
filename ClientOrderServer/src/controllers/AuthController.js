const { User } = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/app.config');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
    const { username, password } = req.body || {};
    
    // Log login attempt
    logger.logAuthEvent('login_attempt', {
        username,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        hasPassword: !!password
    });

    try {
        // Validate input
        if (!username || !password) {
            logger.logAuthEvent('login_failed', {
                username,
                reason: 'missing_credentials',
                ip: req.ip
            });
            return res.status(400).json({ success: false, message: 'Missing credentials' });
        }

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            logger.logAuthEvent('login_failed', {
                username,
                reason: 'user_not_found',
                ip: req.ip
            });
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Check if user status is active
        if (user.status !== 'active') {
            logger.logAuthEvent('login_failed', {
                username,
                userId: user.id,
                reason: 'account_inactive',
                userStatus: user.status,
                ip: req.ip
            });
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }

        // Verify password
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            logger.logAuthEvent('login_failed', {
                username,
                userId: user.id,
                reason: 'invalid_password',
                ip: req.ip
            });
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Success - create token
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            code: user.code,
            email: user.email,
            shopId: user.shopId
        };
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

        // Log successful login
        logger.logAuthEvent('login_success', {
            userId: user.id,
            username: user.username,
            role: user.role,
            shopId: user.shopId,
            ip: req.ip,
            tokenExpiresIn: config.jwt.expiresIn
        });

        res.json({ success: true, data: { token, user: payload } });
    } catch (e) {
        logger.logError(e, {
            action: 'user_login',
            username,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// UNUSED - Not used in frontend
exports.profile = async (req, res) => {
    try {
        const user = req.user;
        
        // Log profile access
        logger.logAuthEvent('profile_accessed', {
            userId: user?.sub || user?.id,
            username: user?.username,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, data: user });
    } catch (e) {
        logger.logError(e, {
            action: 'get_user_profile',
            userId: req.user?.sub || req.user?.id,
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
