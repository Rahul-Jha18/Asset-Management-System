// backend/models/BrandedOption.js
module.exports = (sequelize, DataTypes) => {
  const BrandedOption = sequelize.define(
    "BrandedOption",
    {
      code: {
        type: DataTypes.CHAR(1),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "branded_options",
      timestamps: false,
    }
  );

  BrandedOption.associate = (models) => {
    BrandedOption.hasMany(models.Asset, {
      foreignKey: "brandedOptionCode",
      as: "assets",
    });
  };

  return BrandedOption;
};
