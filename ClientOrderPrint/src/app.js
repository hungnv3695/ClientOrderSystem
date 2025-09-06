require('dotenv').config();
const express = require('express');
const cors = require('cors');
const printRoutes = require('./routes/printRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// CORS configuration - allow all origins for development
const corsOptions = {
    origin: true, // Accept all origins in development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'ClientOrderPrint',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/print', printRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ClientOrderPrint - Local Print Service',
        version: require('../package.json').version,
        endpoint: '/api/print/receipt'
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, HOST, () => {
    logger.info(`🖨️  ClientOrderPrint Service started on http://${HOST}:${PORT}`);
});

module.exports = app;
