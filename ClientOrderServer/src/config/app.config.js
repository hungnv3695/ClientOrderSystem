// Cấu hình ứng dụng ClientOrderServer
// - Đọc từ biến môi trường khi có (phù hợp production)
// - Cung cấp giá trị mặc định khi không có (tiện cho môi trường dev)
// Gợi ý: Thiết lập các biến trong docker-compose hoặc file .env

/** @type {{
 *  env: string,
 *  port: number|string,
 *  jwt: { secret: string, expiresIn: string },
 *  cors: { origin: string }
 * }}
 */
const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwt: {
        // CẢNH BÁO: Không dùng secret mặc định cho production. Hãy set biến môi trường JWT_SECRET.
        secret: process.env.JWT_SECRET || 'dev_secret_key',
        // Thời hạn token, ví dụ: '8h', '1d'
        expiresIn: process.env.JWT_EXPIRES || '8h',
    },
    cors: {
        // Parse CORS_ORIGIN: nếu có dấu phẩy thì split thành array, nếu không thì giữ nguyên string
        origin: process.env.CORS_ORIGIN 
            ? (process.env.CORS_ORIGIN.includes(',') 
                ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
                : process.env.CORS_ORIGIN)
            : '*',
    },
};

module.exports = config;
