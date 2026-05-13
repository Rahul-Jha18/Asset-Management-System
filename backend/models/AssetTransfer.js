const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AssetTransfer = sequelize.define(
  "AssetTransfer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    assetCode: { type: DataTypes.STRING(100), allowNull: true },
    section: { type: DataTypes.STRING(100), allowNull: false },
    assetId: { type: DataTypes.INTEGER, allowNull: false },

    transferType: {
      type: DataTypes.ENUM("branch", "user", "both"),
      allowNull: false,
      defaultValue: "branch",
    },

    fromBranchId: { type: DataTypes.INTEGER, allowNull: true },
    toBranchId: { type: DataTypes.INTEGER, allowNull: true },

    fromUserId: { type: DataTypes.INTEGER, allowNull: true },
    fromUserName: { type: DataTypes.STRING(255), allowNull: true },

    toUserId: { type: DataTypes.INTEGER, allowNull: true },
    toUserName: { type: DataTypes.STRING(255), allowNull: true },

    reason: { type: DataTypes.TEXT, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    transferredBy: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "asset_transfers",
    timestamps: true,
  }
);

module.exports = AssetTransfer;