const express = require('express');
const app = express();
const menuRoutes = require('./routes/MenuRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(express.json());
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use(errorHandler); // middleware xử lý lỗi

module.exports = app;
