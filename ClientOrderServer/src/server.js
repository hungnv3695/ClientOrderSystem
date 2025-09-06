const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const logger = require('./utils/logger');

// Khởi tạo DB (gọi sync trong src/database/index.js)
require('./database');

const http = require('http');
const server = http.createServer(app);
const config = require('./config/app.config');
const PORT = config.port;


// Import và khởi tạo socket.io
const { setupSocket } = require('./socket');
setupSocket(server);

// CORS middleware (đã cấu hình trong app.js)

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 ClientOrderServer running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        host: '0.0.0.0'
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server shut down complete.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server shut down complete.');
        process.exit(0);
    });
});
