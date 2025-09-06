const logger = require('../utils/logger');

/**
 * Simple IP whitelist middleware for local network security
 * Only allow requests from local network ranges
 */
const ipWhitelist = (req, res, next) => {
    // Skip in development mode
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const allowedIps = process.env.ALLOWED_IPS;

    // If no IP whitelist configured, allow all (local network assumption)
    if (!allowedIps) {
        return next();
    }

    const allowedRanges = allowedIps.split(',').map(ip => ip.trim());
    
    // Simple check for local network ranges
    const isLocalNetwork = 
        clientIp.startsWith('192.168.') ||
        clientIp.startsWith('10.') ||
        clientIp.startsWith('172.') ||
        clientIp === '127.0.0.1' ||
        clientIp === 'localhost' ||
        clientIp === '::1';

    if (!isLocalNetwork) {
        logger.warn(`Access denied for IP: ${clientIp}`);
        return res.status(403).json({
            success: false,
            message: 'Access denied - not in local network'
        });
    }

    next();
};

/**
 * Basic rate limiting for print requests
 */
const rateLimiter = (() => {
    const requests = new Map();
    const WINDOW_MS = 60000; // 1 minute
    const MAX_REQUESTS = 30; // Max 30 print requests per minute per IP

    return (req, res, next) => {
        const clientIp = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requests.has(clientIp)) {
            requests.set(clientIp, []);
        }

        const clientRequests = requests.get(clientIp);
        
        // Remove old requests outside the window
        const validRequests = clientRequests.filter(time => now - time < WINDOW_MS);
        
        if (validRequests.length >= MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests - please wait before printing again'
            });
        }

        validRequests.push(now);
        requests.set(clientIp, validRequests);
        
        next();
    };
})();

module.exports = {
    ipWhitelist,
    rateLimiter
};
