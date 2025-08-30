// JWT authentication & authorization middlewares
// - Reads Bearer token from the Authorization header
// - Verifies token using JWT_SECRET (configure in environment for production)
// - On success, attaches decoded payload (e.g. { sub, username, role }) to req.user
// - Use requireRole to protect routes by role-based access control (RBAC)

const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

/**
 * verifyToken
 * Middleware xác thực JWT cho các request cần đăng nhập.
 * - Trích token từ header Authorization dạng: "Bearer <token>"
 * - Xác thực token với JWT_SECRET (hết hạn/không hợp lệ => 401)
 * - Gán payload đã decode vào req.user để các middleware/controller phía sau dùng.
 *
 * Ví dụ dùng:
 *   router.get('/profile', verifyToken, (req, res) => { res.json(req.user) })
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null; // cắt tiền tố 'Bearer '
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, config.jwt.secret); // ném lỗi nếu hết hạn/không hợp lệ
        req.user = decoded; // ví dụ: { sub, username, role, iat, exp }
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

/**
 * requireRole(...roles)
 * Middleware factory kiểm tra quyền truy cập theo vai trò.
 * - Yêu cầu verifyToken chạy trước để có req.user
 * - Nếu req.user.role không thuộc danh sách roles cho phép => 403
 *
 * Ví dụ dùng:
 *   router.get('/admin', verifyToken, requireRole('manager'), handler)
 *   router.get('/staff-only', verifyToken, requireRole('staff','manager'), handler)
 *
 * Lưu ý: role hiện là string 'staff' | 'manager' được cấp khi login.
 * @param  {...string} roles Danh sách vai trò được phép
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };
