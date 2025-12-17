// backend/models/Branch.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Branch = sequelize.define(
  'Branch',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false, unique: true },

    manager_name: { type: DataTypes.STRING, allowNull: true },

    address: { type: DataTypes.STRING, allowNull: true },

    contact: { type: DataTypes.STRING, allowNull: true },

    ext_no: { type: DataTypes.STRING, allowNull: true },

    // 🔹 NEW FIELDS
    service_station: {
      type: DataTypes.STRING,
      allowNull: true,
      // field: 'service_station', // only needed if DB column name is different
    },

    region: {
      type: DataTypes.STRING,
      allowNull: true,
      // field: 'region',
    },
  },
  {
    timestamps: true,
    tableName: 'branches',
  }
);

module.exports = Branch;
