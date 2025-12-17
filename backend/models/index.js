// backend/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Existing imports
const AssetModel = require("./Asset");
const AssetTechnicalDetailModel = require("./AssetTechnicalDetail");
const AssetCommercialDetailModel = require("./AssetCommercialDetail");
const AssetLicenseDetailModel = require("./AssetLicenseDetail");
const BrandedOptionModel = require("./BrandedOption");
const AssetGroupModel = require("./AssetGroup");
const AssetSubCategoryModel = require("./AssetSubCategory");
const DepartmentModel = require("./Department");

// ✅ NEW
const AssetRemarkModel = require("./AssetRemark");

// Init models
const Asset = AssetModel(sequelize, DataTypes);
const AssetTechnicalDetail = AssetTechnicalDetailModel(sequelize, DataTypes);
const AssetCommercialDetail = AssetCommercialDetailModel(sequelize, DataTypes);
const AssetLicenseDetail = AssetLicenseDetailModel(sequelize, DataTypes);
const BrandedOption = BrandedOptionModel(sequelize, DataTypes);
const AssetGroup = AssetGroupModel(sequelize, DataTypes);
const AssetSubCategory = AssetSubCategoryModel(sequelize, DataTypes);
const Department = DepartmentModel(sequelize, DataTypes);

// ✅ NEW
const AssetRemark = AssetRemarkModel(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,

  Asset,
  AssetTechnicalDetail,
  AssetCommercialDetail,
  AssetLicenseDetail,
  BrandedOption,
  AssetGroup,
  AssetSubCategory,
  Department,

  AssetRemark, // ✅ expose model
};

// Run .associate if present
[
  Asset,
  AssetTechnicalDetail,
  AssetCommercialDetail,
  AssetLicenseDetail,
  BrandedOption,
  AssetGroup,
  AssetSubCategory,
  Department,
  AssetRemark,     // ✅ include here
].forEach((model) => {
  if (model && typeof model.associate === "function") {
    model.associate(db);
  }
});

module.exports = db;
