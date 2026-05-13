//model/branch_ups
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const BranchUps = sequelize.define(
  "BranchUps",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.STRING(100), allowNull: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    ups_model: { type: DataTypes.STRING },
    ups_backup_time: { type: DataTypes.STRING },
    ups_installer: { type: DataTypes.STRING },
    ups_rating: { type: DataTypes.STRING },
    assigned_user: { type: DataTypes.STRING },
    remarks: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING }, 
    ip_address: { type: DataTypes.STRING },

  },
  { tableName: "branch_ups", timestamps: true }
);
/* ─── INVERTER TABLE ─── */
const Inverter = sequelize.define(
  "Inverter",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.STRING(100), allowNull: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: true },
    inverter_model: { type: DataTypes.STRING(100), allowNull: true },
    inverter_backup_time: { type: DataTypes.STRING(50), allowNull: true },
    inverter_installer: { type: DataTypes.STRING(100), allowNull: true },
    assigned_user: { type: DataTypes.STRING(255), allowNull: true },
    battery_1: { type: DataTypes.STRING(50), allowNull: true },
    battery_2: { type: DataTypes.STRING(50), allowNull: true },
    battery_3: { type: DataTypes.STRING(50), allowNull: true },
    battery_4: { type: DataTypes.STRING(50), allowNull: true },
    battery_rating: { type: DataTypes.STRING(50), allowNull: true },
    inverter_purchase_year: { type: DataTypes.INTEGER, allowNull: true },
    inverter_status: { type: DataTypes.STRING(20), allowNull: true },
    location: { type: DataTypes.STRING(150), allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "inverter", timestamps: true }
);
module.exports = {
  BranchUps,
  Inverter,
};

