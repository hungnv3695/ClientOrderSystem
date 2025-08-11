// src/socket.js
const { Server } = require('socket.io');

let ioInstance = null;

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    ioInstance = io;

    io.on('connection', (socket) => {
        const shopId = socket.handshake?.query?.shopId || 'default';
        socket.join(shopId);
        console.log(`Client connected with shopId: ${shopId}`);

        // Không gửi dữ liệu business ở đây. Controller/Service sẽ chủ động emit qua các hàm tiện ích bên dưới.
        socket.emit('connected', { shopId });
    });
}

// ========== Emit helpers (dùng trong controller/service) ==========
function emitOrderNumbers(shopId, data) {
    if (!ioInstance) return;
    ioInstance.to(shopId).emit('orderNumbers', data);
}

module.exports = {
    setupSocket,
    emitOrderNumbers,
};
