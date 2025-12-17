// backend/models/Asset.js
module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define(
    "Asset",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      assetCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "asset_code",
      },
      assetName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: "asset_name",
      },
      brandedOptionCode: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        field: "branded_option_code",
      },
      groupId: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        field: "group_id",
      },
      subCategoryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: "sub_category_code",
      },
      brand: DataTypes.STRING(100),
      branch: DataTypes.STRING(100),
      departmentId: {
        type: DataTypes.STRING(10),
        field: "department_id",
      },
      userAllocated: {
        type: DataTypes.STRING(100),
        field: "user_allocated",
      },
      purchaseDate: {
        type: DataTypes.DATEONLY,
        field: "purchase_date",
      },
      warrantyExp: {
        type: DataTypes.DATEONLY,
        field: "warranty_exp",
      },
      status: {
        type: DataTypes.ENUM("Active", "Repair", "Disposed"),
        defaultValue: "Active",
      },
      assetCondition: {
        type: DataTypes.ENUM("New", "Good", "Moderate", "Repair", "Scrap"),
        defaultValue: "Good",
        field: "asset_condition",
      },
    },
    {
      tableName: "assets",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Asset.associate = (models) => {
    Asset.belongsTo(models.BrandedOption, {
      foreignKey: "brandedOptionCode",
      as: "brandedOption",
    });
    Asset.belongsTo(models.AssetGroup, {
      foreignKey: "groupId",
      as: "group",
    });
    Asset.belongsTo(models.AssetSubCategory, {
      foreignKey: "subCategoryCode",
      as: "subCategory",
    });
    Asset.belongsTo(models.Department, {
      foreignKey: "departmentId",
      as: "department",
    });

    Asset.hasOne(models.AssetTechnicalDetail, {
      foreignKey: "assetId",
      as: "technical",
    });
    Asset.hasOne(models.AssetCommercialDetail, {
      foreignKey: "assetId",
      as: "commercial",
    });
    Asset.hasOne(models.AssetLicenseDetail, {
      foreignKey: "assetId",
      as: "license",
    });

    // 👇 NEW: one asset → many remarks
     Asset.hasMany(models.AssetRemark, {
    foreignKey: "assetId",
    as: "remarks",
  });
};

  return Asset;
};
