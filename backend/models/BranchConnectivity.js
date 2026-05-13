const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const BranchConnectivity = sequelize.define(
  "BranchConnectivity",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.STRING(100), allowNull: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    connectivity_status: { type: DataTypes.STRING },
    connectivity_wlink: { type: DataTypes.STRING },
    connectivity_lan_ip: { type: DataTypes.STRING },
    connectivity_lan_switch: { type: DataTypes.STRING },
    connectivity_network: { type: DataTypes.STRING },
    connectivity_wifi: { type: DataTypes.STRING },
    installed_year: { type: DataTypes.INTEGER },
    location: { type: DataTypes.STRING, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "branch_connectivity", timestamps: true }
);

module.exports = BranchConnectivity;