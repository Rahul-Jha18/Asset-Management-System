// backend/models/Request.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = require('./User');
const Branch = require('./Branch');

const Request = sequelize.define(
  'Request',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('Pending', 'Done'),
      allowNull: false,
      defaultValue: 'Pending',
    },

    // ✅ We'll use branchId as "Current Branch"
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'branch_id',
    },

    // ✅ We'll use deviceId as "Selected Item ID" (device OR asset)
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'device_id',
    },
  },
  {
    tableName: 'requests',
    timestamps: true,
    underscored: true,
  }
);

/* Associations */
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Request.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
Branch.hasMany(Request, { foreignKey: 'branchId', as: 'requests' });

module.exports = Request;
