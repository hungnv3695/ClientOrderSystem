const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorHandler); // middleware xử lý lỗi

module.exports = app;
