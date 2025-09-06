const express = require('express');
const app = express();
const menuRoutes = require('./routes/MenuRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const sepayRoutes = require('./routes/SepayRoutes'); // Giả sử bạn có một route cho Sepay
const authRoutes = require('./routes/AuthRoutes');
const receiptRoutes = require('./routes/ReceiptRoutes');
const companyRoutes = require('./routes/manager/CompanyRoutes');
const shopRoutes = require('./routes/manager/ShopRoutes');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config/app.config');

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sepay', sepayRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/shop', shopRoutes);
app.use(errorHandler); // middleware xử lý lỗi

module.exports = app;
