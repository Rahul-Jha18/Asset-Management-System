// backend/models/ServiceStation.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ServiceStation = sequelize.define(
  "ServiceStation",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },

    manager_name: { type: DataTypes.STRING, allowNull: true },

    manager_email: { type: DataTypes.STRING, allowNull: true },

    contact: { type: DataTypes.STRING, allowNull: true },

    // DB has created_at / updated_at (snake case), so no timestamps
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "service_stations",
    timestamps: false,
  }
);

module.exports = ServiceStation;
