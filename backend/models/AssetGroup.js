// backend/models/AssetGroup.js
module.exports = (sequelize, DataTypes) => {
  const AssetGroup = sequelize.define(
    "AssetGroup",
    {
      id: { type: DataTypes.CHAR(1), primaryKey: true, field: "id" },
      name: { type: DataTypes.STRING(100), allowNull: false, field: "name" },
    },
    {
      tableName: "asset_groups",
      timestamps: false,
    }
  );

  AssetGroup.associate = (models) => {
    AssetGroup.hasMany(models.AssetSubCategory, {
      foreignKey: "groupId",
      sourceKey: "id",
      as: "subCategories",
    });
  };

  return AssetGroup;
};
