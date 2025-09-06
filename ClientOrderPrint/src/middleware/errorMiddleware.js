const logger = require('../utils/logger');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', err);

    // Default error
    let error = {
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Axios errors
    if (err.response) {
        error.message = 'External service error';
        error.details = err.response.data;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = 'Validation error';
        error.details = err.errors;
    }

    // JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        error.message = 'Invalid JSON payload';
    }

    res.status(err.status || 500).json(error);
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        availableRoutes: {
            'GET /': 'Service information',
            'GET /health': 'Health check',
            'POST /api/print/receipt': 'Print receipt',
            'POST /api/print/test': 'Print test page',
            'GET /api/print/status': 'Check printer status',
            'POST /api/print/display': 'Update customer display',
            'GET /api/print/config': 'Get printer configuration'
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
