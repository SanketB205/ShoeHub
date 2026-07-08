const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shoehub_db', 'root', 'root@123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
