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

    station_ext_no: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "station_ext_no",
    },

    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "service_stations",
    timestamps: false,
  }
);

module.exports = ServiceStation;
