// backend/models/AssetRemark.js
module.exports = (sequelize, DataTypes) => {
  const AssetRemark = sequelize.define(
    "AssetRemark",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // 👇 matches MySQL column: assetId
      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // 👇 matches MySQL column: updatedBy
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      // 👇 matches MySQL column: remarks
      remarks: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // 👇 matches MySQL column: dateUpdated
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "asset_remarks", // 👈 your table name
      timestamps: false,          // no createdAt/updatedAt
    }
  );

  AssetRemark.associate = (models) => {
    AssetRemark.belongsTo(models.Asset, {
      foreignKey: "assetId",
      as: "asset",
    });
  };

  return AssetRemark;
};
