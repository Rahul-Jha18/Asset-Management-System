const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AssetTrackingProfile = sequelize.define(
  "AssetTrackingProfile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    asset_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    asset_label: { type: DataTypes.STRING, allowNull: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    branch_name: { type: DataTypes.STRING, allowNull: true },
    asset_type: { type: DataTypes.STRING, allowNull: false },
    tracking_method: {
      type: DataTypes.ENUM("ping", "http", "rtsp", "manual"),
      allowNull: false,
      defaultValue: "ping",
    },
    hostname: { type: DataTypes.STRING, allowNull: true },
    expected_local_ip: { type: DataTypes.STRING, allowNull: true },
    expected_mac: { type: DataTypes.STRING, allowNull: true },
    monitor_port: { type: DataTypes.INTEGER, allowNull: true },
    http_url: { type: DataTypes.STRING, allowNull: true },
    rtsp_url: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "asset_tracking_profiles",
    underscored: true,
    timestamps: true,
  }
);

module.exports = AssetTrackingProfile;