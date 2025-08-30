const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');

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
    console.log(`Server running on port ${PORT}`);
});
