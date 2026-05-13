// backend/models/AssetHistory.js
module.exports = (sequelize, DataTypes) => {
  const AssetHistory = sequelize.define(
    "AssetHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        index: true,
      },
      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        index: true,
      },
      assetType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "e.g., laptop, desktop, printer, software, etc.",
      },
      changeType: {
        type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "TRANSFER", "MAINTENANCE"),
        defaultValue: "UPDATE",
      },
      fieldName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "The field that was changed",
      },
      oldValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Previous value (serialized if needed)",
      },
      newValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "New value (serialized if needed)",
      },
      changedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "User ID who made the change",
      },
      changedByName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Human-readable description of the change",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional metadata about the change",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "asset_history",
      timestamps: false,
      indexes: [
        { fields: ["branchId", "assetId"] },
        { fields: ["assetType", "changeType"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  return AssetHistory;
};
