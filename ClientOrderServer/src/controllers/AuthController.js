const { User, Device, DeviceType } = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/app.config');
const logger = require('../utils/logger');
const { USER_ROLES, HTTP_STATUS } = require('../constants/app.constants');

exports.login = async (req, res) => {
    const { username, password, deviceCode } = req.body || {};
    
    // Log login attempt
    logger.logAuthEvent('login_attempt', {
        username,
        deviceCode,
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

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                reason: 'user_not_found',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid username or password' });
        }

        // Check if user status is active
        if (user.status !== 'active') {
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
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            logger.logAuthEvent('login_failed', {
                username,
                deviceCode,
                userId: user.id,
                reason: 'invalid_password',
                ip: req.ip
            });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid username or password' });
        }

        // Nếu có deviceCode, kiểm tra user có quyền sử dụng device này không
        if (user.role === USER_ROLES.DEVICE) {
            if (!deviceCode) {
                    logger.logAuthEvent('login_failed', {
                    username,
                    deviceCode,
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
                    status: 'used'
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
                    userId: user.id,
                    reason: 'device_not_authorized',
                    ip: req.ip
                });
                return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                    success: false, 
                    message: 'User không có quyền sử dụng thiết bị này' 
                });
            }
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

        // Lấy thông tin devices của user (bao gồm device hiện tại và máy in)
        let deviceInfo = null;
        let printerDevice = null;
        
        if (user.role === USER_ROLES.DEVICE) {
            try {
                // Lấy tất cả devices của user
                const userDevices = await Device.findAll({
                    where: { 
                        userId: user.id,
                        status: 'used'
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

                // Tìm máy in (type PRT)
                printerDevice = userDevices.find(d => d.type === 'PRT');

                // Nếu không có deviceCode cụ thể, dùng device đầu tiên
                if (!deviceInfo && userDevices.length > 0) {
                    deviceInfo = userDevices[0];
                }

                if (deviceInfo) {
                    payload.currentDevice = {
                        id: deviceInfo.id,
                        code: deviceInfo.code,
                        name: deviceInfo.name,
                        ip: deviceInfo.ip,
                        port: deviceInfo.port,
                        brand: deviceInfo.brand,
                        serialNumber: deviceInfo.serialNumber,
                        type: deviceInfo.type,
                        deviceType: deviceInfo.deviceType
                    };
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
                        type: printerDevice.type,
                        deviceType: printerDevice.deviceType
                    };
                }
                
                logger.logAuthEvent('device_login_success', {
                    userId: user.id,
                    username: user.username,
                    currentDeviceCode: deviceInfo?.code,
                    printerDeviceCode: printerDevice?.code,
                    requestedDeviceCode: deviceCode,
                    ip: req.ip
                });
            } catch (deviceError) {
                logger.logError(deviceError, {
                    action: 'get_device_info',
                    userId: user.id,
                    username: user.username,
                    deviceCode,
                    ip: req.ip
                });
                // Không fail login nếu không lấy được device info
            }
        }

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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
};
