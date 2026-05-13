const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AssetPresenceLog = sequelize.define(
  "AssetPresenceLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    asset_id: { type: DataTypes.STRING, allowNull: false },
    branch_id: { type: DataTypes.INTEGER, allowNull: true },
    branch_name: { type: DataTypes.STRING, allowNull: true },
    local_ip: { type: DataTypes.STRING, allowNull: true },
    public_ip: { type: DataTypes.STRING, allowNull: true },
    mac_address: { type: DataTypes.STRING, allowNull: true },
    device_status: { type: DataTypes.STRING, allowNull: true },
    location_status: { type: DataTypes.STRING, allowNull: true },
    tracking_source: { type: DataTypes.STRING, allowNull: true },
    response_ms: { type: DataTypes.INTEGER, allowNull: true },
    seen_at: { type: DataTypes.DATE, allowNull: false },
    details: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    asset_label: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "asset_presence_logs",
    underscored: true,
    timestamps: false,
  }
);

module.exports = AssetPresenceLog;