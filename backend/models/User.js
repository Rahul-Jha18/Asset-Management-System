// backend/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'subadmin', 'user'), // no dash, matches frontend
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  timestamps: true,
  underscored: true, // fields in DB: created_at, updated_at
});

module.exports = User;
