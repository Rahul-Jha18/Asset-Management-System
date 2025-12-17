// backend/models/AssetTechnicalDetail.js
module.exports = (sequelize, DataTypes) => {
  const AssetTechnicalDetail = sequelize.define(
    "AssetTechnicalDetail",
    {
      assetId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "asset_id",
      },
      cpu: DataTypes.STRING(100),
      ram: DataTypes.STRING(50),
      storage: DataTypes.STRING(100),
      os: DataTypes.STRING(100),
      ipAddress: {
        type: DataTypes.STRING(45),
        field: "ip_address",
      },
      domainName: {
        type: DataTypes.STRING(100),
        field: "domain_name",
      },
      serialNo: {
        type: DataTypes.STRING(100),
        field: "serial_no",
      },
      otherSpecs: {
        type: DataTypes.TEXT,
        field: "other_specs",
      },
    },
    {
      tableName: "asset_technical_details",
      timestamps: false,
    }
  );

  AssetTechnicalDetail.associate = (models) => {
    AssetTechnicalDetail.belongsTo(models.Asset, {
      foreignKey: "assetId",
      as: "asset",
    });
  };

  return AssetTechnicalDetail;
};
