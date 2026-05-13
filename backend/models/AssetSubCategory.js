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
        field: "group_id",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name",
      },
    },
    {
      tableName: "asset_sub_categories",
      timestamps: false,
    }
  );

  AssetSubCategory.associate = (models) => {
    AssetSubCategory.belongsTo(models.AssetGroup, {
      foreignKey: "groupId",
      targetKey: "id",
      as: "group",
    });
  };

  return AssetSubCategory;
};
