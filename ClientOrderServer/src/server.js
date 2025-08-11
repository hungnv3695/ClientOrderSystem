const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();

// Khởi tạo DB (gọi sync trong src/database/index.js)
require('./database');

const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


// Import và khởi tạo socket.io
const { setupSocket } = require('./socket');
setupSocket(server);

// CORS middleware
const cors = require('cors');
app.use(cors({
    origin: '*', // hoặc chỉ định domain cụ thể
}));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
