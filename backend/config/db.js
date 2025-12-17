const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const connectDB = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('Connected to database:', sequelize.getDatabaseName());
    console.log('MySQL connected');
    await sequelize.sync({ alter: false });

  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
};
module.exports = { sequelize, connectDB };