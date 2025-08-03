const {Sequelize} = require('sequelize');
const dbConfig = require('../config/db.config');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
  logging: false, // Disable logging; default: console.log
});

const User = require('./models/user.model')(sequelize, Sequelize);

sequelize.sync().then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Failed to synchronize database:', err);
});

module.exports = {
    sequelize,
    Sequelize,
    User: require('./models/user.model')(sequelize, Sequelize),
    // Add other models here
}