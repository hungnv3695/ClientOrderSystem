/**
 * Winston Logger Configuration for ClientOrderServer
 * Provides structured logging with multiple transports and levels
 */

const winston = require('winston');
const path = require('path');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = '\n' + JSON.stringify(meta, null, 2);
        }
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// File format - JSON for easy parsing
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: fileFormat,
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
            silent: process.env.NODE_ENV === 'test' // Disable console in tests
        }),

        // File transports for all environments
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 10
        }),
        
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10
        })
    ],

    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log')
        })
    ]
});

// Convenience methods for common logging patterns
logger.logRequest = (req, message = 'HTTP Request') => {
    logger.info(message, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });
};

logger.logOrderEvent = (event, orderId, data = {}) => {
    logger.info(`Order ${event}`, {
        event,
        orderId,
        ...data,
        timestamp: new Date().toISOString()
    });
};

logger.logPaymentEvent = (event, data = {}) => {
    logger.info(`Payment ${event}`, {
        event,
        ...data,
        timestamp: new Date().toISOString()
    });
};

logger.logAuthEvent = (event, data = {}) => {
    logger.info(`Auth ${event}`, {
        event,
        ...data,
        timestamp: new Date().toISOString()
    });
};

logger.logError = (error, context = {}) => {
    logger.error('Application Error', {
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        context,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
