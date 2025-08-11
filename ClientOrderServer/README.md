# Cấu trúc thư mục dự án ClientOrderServer

```
ClientOrderServer/
├── Dockerfile
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── socket.js
│   ├── config/
│   │   └── db.config.js
│   ├── controllers/
│   │   ├── MenuController.js
│   │   └── OrderController.js
│   ├── database/
│   │   ├── index.js
│   │   └── models/
│   │       ├── food.model.js
│   │       ├── menu.model.js
│   │       ├── menuFood.model.js
│   │       ├── order.model.js
│   │       └── orderFood.model.js
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── models/
│   ├── routes/
│   │   ├── MenuRoutes.js
│   │   └── OrderRoutes.js
│   ├── services/
│   │   ├── MenuService.js
│   │   └── OrderService.js
│   └── utils/
```

- src/app.js: Khởi tạo Express, middleware chung, đăng ký routes.
- src/server.js: Khởi động HTTP server, bind socket.io.
- src/socket.js: Cấu hình sự kiện socket.io (rooms, broadcast...).
- src/config/db.config.js: Cấu hình kết nối cơ sở dữ liệu.
- src/controllers/: Xử lý request/response theo tài nguyên (Menu, Order...).
- src/services/: Business logic, truy vấn dữ liệu, giao tiếp DB.
- src/routes/: Định nghĩa các endpoint REST mapping tới controller.
- src/middlewares/errorHandler.js: Middleware xử lý lỗi tập trung.
- src/database/index.js: Khởi tạo/kết nối DB; src/database/models/: định nghĩa model/schema Sequelize.
- src/models/: Khu vực model tách riêng (nếu dùng kiến trúc khác với database/models).
- src/utils/: Tiện ích dùng chung cho server.
