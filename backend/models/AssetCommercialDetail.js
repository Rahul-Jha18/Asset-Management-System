// backend/models/AssetCommercialDetail.js
module.exports = (sequelize, DataTypes) => {
  const AssetCommercialDetail = sequelize.define(
    "AssetCommercialDetail",
    {
      assetId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "asset_id",
      },
      vendorName: {
        type: DataTypes.STRING(150),
        field: "vendor_name",
      },
      poNo: {
        type: DataTypes.STRING(50),
        field: "po_no",
      },
      invoiceNo: {
        type: DataTypes.STRING(50),
        field: "invoice_no",
      },
      amount: DataTypes.DECIMAL(12, 2),
      amcVendor: {
        type: DataTypes.STRING(150),
        field: "amc_vendor",
      },
      amcExp: {
        type: DataTypes.DATEONLY,
        field: "amc_exp",
      },
      remarks: DataTypes.TEXT,
    },
    {
      tableName: "asset_commercial_details",
      timestamps: false,
    }
  );

  AssetCommercialDetail.associate = (models) => {
    AssetCommercialDetail.belongsTo(models.Asset, {
      foreignKey: "assetId",
      as: "asset",
    });
  };

  return AssetCommercialDetail;
};
