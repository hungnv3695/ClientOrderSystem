/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests with relevant information
 */

const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom Morgan token for response time in color
morgan.token('colored-status', (req, res) => {
    const status = res.statusCode;
    let color = '\x1b[32m'; // Green for 2xx
    
    if (status >= 400 && status < 500) {
        color = '\x1b[33m'; // Yellow for 4xx
    } else if (status >= 500) {
        color = '\x1b[31m'; // Red for 5xx
    }
    
    return `${color}${status}\x1b[0m`;
});

// Custom format for development
const devFormat = ':method :url :colored-status :response-time ms - :res[content-length]';

// Custom format for production (more detailed)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Morgan middleware with Winston stream
const httpLogger = morgan(
    process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    {
        stream: {
            write: (message) => {
                // Remove trailing newline and log as info
                logger.info(`HTTP: ${message.trim()}`);
            }
        },
        // Skip logging for health check endpoints
        skip: (req, res) => {
            return req.url === '/health' || req.url === '/ping';
        }
    }
);

// Advanced request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request start
    logger.debug('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        userId: req.user?.id,
        sessionId: req.sessionID
    });

    // Capture original end function
    const originalEnd = res.end;
    
    // Override res.end to log response
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // Log response
        logger.debug('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length'),
            userId: req.user?.id
        });

        // Log slow requests
        if (duration > 1000) {
            logger.warn('Slow request detected', {
                method: req.method,
                url: req.url,
                duration: `${duration}ms`,
                statusCode: res.statusCode
            });
        }

        // Call original end function
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = {
    httpLogger,
    requestLogger
};
