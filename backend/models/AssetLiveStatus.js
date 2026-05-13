const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AssetLiveStatus = sequelize.define(
  "AssetLiveStatus",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    asset_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: true },
    branch_name: { type: DataTypes.STRING, allowNull: true },
    asset_type: { type: DataTypes.STRING, allowNull: true },
    hostname: { type: DataTypes.STRING, allowNull: true },
    local_ip: { type: DataTypes.STRING, allowNull: true },
    public_ip: { type: DataTypes.STRING, allowNull: true },
    mac_address: { type: DataTypes.STRING, allowNull: true },
    device_status: { type: DataTypes.STRING, allowNull: true, defaultValue: "Offline" },
    location_status: { type: DataTypes.STRING, allowNull: true, defaultValue: "Unknown" },
    tracking_source: { type: DataTypes.STRING, allowNull: true },
    response_ms: { type: DataTypes.INTEGER, allowNull: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    asset_label: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "asset_live_status",
    underscored: true,
    timestamps: true,
  }
);

module.exports = AssetLiveStatus;