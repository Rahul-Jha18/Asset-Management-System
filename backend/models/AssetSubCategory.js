// backend/models/AssetSubCategory.js
module.exports = (sequelize, DataTypes) => {
  const AssetSubCategory = sequelize.define(
    "AssetSubCategory",
    {
      code: {
        type: DataTypes.STRING(5),
        primaryKey: true,
        allowNull: false,
        field: "code",
      },
      groupId: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        field: "group_id",  // 🔴 IMPORTANT: map to DB column name
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name",
      },
    },
    {
      tableName: "asset_sub_categories",
      timestamps: false, // or true if you actually have created_at/updated_at
    }
  );

  AssetSubCategory.associate = (models) => {
    // Each sub-category belongs to a group
    AssetSubCategory.belongsTo(models.AssetGroup, {
      foreignKey: "groupId",
      as: "group",
    });

    // Optional: back-reference from sub-category to many assets
    AssetSubCategory.hasMany(models.Asset, {
      foreignKey: "subCategoryCode",
      as: "assets",
    });
  };

  return AssetSubCategory;
};