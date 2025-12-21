// backend/models/AssetGroup.js
module.exports = (sequelize, DataTypes) => {
  const AssetGroup = sequelize.define(
    "AssetGroup",
    {
      id: {
        type: DataTypes.CHAR(1),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "asset_groups",
      timestamps: false,
    }
  );

  AssetGroup.associate = (models) => {
    AssetGroup.hasMany(models.AssetSubCategory, {
      foreignKey: "groupId",
      as: "subCategories",
    });
    AssetGroup.hasMany(models.Asset, {
      foreignKey: "groupId",
      as: "assets",
    });
  };

  return AssetGroup;
};
