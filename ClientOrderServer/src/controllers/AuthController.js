const { User, Device, DeviceType, Shop, UserShop } = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/app.config');
const logger = require('../utils/logger');
const { USER_ROLES, HTTP_STATUS, SHOP_STATUS, USER_STATUS } = require('../constants/app.constants');
const { DEVICE_STATUS } = require('../constants/device.constants');
const { USER } = require('../config/db.config');

exports.login = async (req, res) => {
    const { username, password, deviceCode, shopCode } = req.body || {};
    
    // Log login attempt
    logger.logAuthEvent('login_attempt', {
        username,
        deviceCode,
        shopCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        hasPassword: !!password
    });

    try {
        // Validate input
        if (!username || !password) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                reason: 'missing_credentials',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Missing credentials' });
        }

        // Find user with shops (tích hợp shopCode validation)
        const whereConditions = { username, status: USER_STATUS.ACTIVE };
        const includeConditions = [{
            model: Shop,
            as: 'shops',
            through: {
                attributes: ['status'],
                where: { status: SHOP_STATUS.ACTIVE }
            },
            where: { status: SHOP_STATUS.ACTIVE }
        }];

        // Nếu có shopCode, thêm điều kiện filter shop
        if (shopCode) {
            includeConditions[0].where.code = shopCode;
        }

        const user = await User.findOne({ 
            where: whereConditions,
            include: includeConditions
        });
        
        if (!user) {
            const reason = shopCode ? 'user_not_found_or_no_shop_access' : 'user_not_found';
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                shopCode,
                reason,
                ip: req.ip
            });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                success: false, 
                message: shopCode ? 'Invalid username, password, or no access to shop' : 'Invalid username or password' 
            });
        }

        // Check if user status is active (redundant nhưng giữ lại cho safety)
        if (user.status !== USER_STATUS.ACTIVE) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                userId: user.id,
                reason: 'account_inactive',
                userStatus: user.status,
                ip: req.ip
            });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Account is inactive' });
        }

        // Verify password
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                shopCode,
                userId: user.id,
                reason: 'invalid_password',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid username or password' });
        }

        // Nếu có deviceCode, kiểm tra user có quyền sử dụng device này không
        if (!deviceCode) {
                logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                shopCode,
                userId: user.id,
                reason: 'device_not_existed',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                success: false, 
                message: 'Thiết bị không tồn tại' 
            });
        }

        const userDevice = await Device.findOne({
            where: { 
                code: deviceCode,
                userId: user.id,
                status: DEVICE_STATUS.USING // INTEGER: 1 = using
            },
            include: [{
                model: DeviceType,
                as: 'deviceType',
                required: true
            }]
        });

        if (!userDevice) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                shopCode,
                userId: user.id,
                reason: 'device_not_authorized',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                success: false, 
                message: 'User không có quyền sử dụng thiết bị này' 
            });
        }

        const shop = await Shop.findOne({ where: { code: shopCode, status: SHOP_STATUS.ACTIVE } });

        // Success - create token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            code: user.code,
            email: user.email,
            shopCode: shopCode,
            bankCode: shop?.bankCode || null,
            bankNumber: shop?.bankNumber || null,
            bankNumberName: shop?.bankNumberName || null
        };

        // Lấy thông tin devices của user (bao gồm device hiện tại và máy in)
        let deviceInfo = null;
        let printerDevice = null;
        
        // Lấy tất cả devices của user (status: 1 = using)
        const userDevices = await Device.findAll({
            where: { 
                userId: user.id,
                status: DEVICE_STATUS.USING // INTEGER: 1 = using
            },
            include: [{
                model: DeviceType,
                as: 'deviceType',
                required: true
            }]
        });

        // Tìm device hiện tại (nếu có deviceCode)
        if (deviceCode) {
            deviceInfo = userDevices.find(d => d.code === deviceCode);
        }

        // Tìm máy in (deviceType.code === 'PRT')
        printerDevice = userDevices.find(d => d.deviceType && d.deviceType.code === 'PRT');

        // Nếu không có deviceCode cụ thể, dùng device đầu tiên
        if (!deviceInfo && userDevices.length > 0) {
            deviceInfo = userDevices[0];
        }

        if (deviceInfo) {
            payload.deviceCode = deviceInfo.code;
        }

        if (printerDevice) {
            payload.printerDevice = {
                id: printerDevice.id,
                code: printerDevice.code,
                name: printerDevice.name,
                ip: printerDevice.ip,
                port: printerDevice.port,
                brand: printerDevice.brand,
                serialNumber: printerDevice.serialNumber,
                type: printerDevice.deviceType?.code,
                deviceType: printerDevice.deviceType
            };
        }

        // kiểm tra token còn hạn không
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

        // Log successful login
        logger.logAuthEvent('login_success', {
            userId: user.id,
            username: user.username,
            role: user.role,
            currentShop: shopCode,
            deviceCode: deviceCode,
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
};

// UNUSED - Not used in frontend
exports.profile = async (req, res) => {
    try {
        const user = req.user;
        
        // Log profile access
        logger.logAuthEvent('profile_accessed', {
            userId: user?.id || user?.sub,
            username: user?.username,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, data: user });
    } catch (e) {
        logger.logError(e, {
            action: 'get_user_profile',
            userId: req.user?.id || req.user?.sub,
            ip: req.ip
        });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
};
