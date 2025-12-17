// backend/models/AssetLicenseDetail.js
module.exports = (sequelize, DataTypes) => {
  const AssetLicenseDetail = sequelize.define(
    "AssetLicenseDetail",
    {
      assetId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "asset_id",
      },
      noOfLicenses: {
        type: DataTypes.INTEGER,
        field: "no_of_licenses",
      },
      licenseKeyHash: {
        type: DataTypes.STRING(255),
        field: "license_key_hash",
      },
      licenseExp: {
        type: DataTypes.DATEONLY,
        field: "license_exp",
      },
      licenseNotes: {
        type: DataTypes.TEXT,
        field: "license_notes",
      },
    },
    {
      tableName: "asset_license_details",
      timestamps: false,
    }
  );

  AssetLicenseDetail.associate = (models) => {
    AssetLicenseDetail.belongsTo(models.Asset, {
      foreignKey: "assetId",
      as: "asset",
    });
  };

  return AssetLicenseDetail;
};
