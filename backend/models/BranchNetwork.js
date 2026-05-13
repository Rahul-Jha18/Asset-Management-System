const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const BranchNetwork = sequelize.define(
  "BranchNetwork",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    branch_name: { type: DataTypes.STRING, allowNull: false },
    public_ip: { type: DataTypes.STRING, allowNull: true },
    local_subnet: { type: DataTypes.STRING, allowNull: true },
    gateway_ip: { type: DataTypes.STRING, allowNull: true },
    vlan_name: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "branch_networks",
    underscored: true,
    timestamps: true,
  }
);

module.exports = BranchNetwork;