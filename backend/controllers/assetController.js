// backend/controllers/assetController.js
const crypto = require("crypto");
const { Op } = require("sequelize");

const {
  sequelize,
  Asset,
  AssetTechnicalDetail,
  AssetCommercialDetail,
  AssetLicenseDetail,
  BrandedOption,
  AssetGroup,
  AssetSubCategory,
  Department,
  AssetRemark,
} = require("../models");

// ---------------------------------------------------------------------
// CREATE ASSET  (POST /api/assets)
// ---------------------------------------------------------------------
exports.createAsset = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { asset, technical, commercial, license } = req.body;

    // 1) Create main asset
    const newAsset = await Asset.create(
      {
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        brandedOptionCode: asset.brandedOptionCode,
        groupId: asset.groupId,
        subCategoryCode: asset.subCategoryCode,
        brand: asset.brand,
        branch: asset.branch,
        departmentId: asset.departmentId || null,
        userAllocated: asset.userAllocated || null,
        purchaseDate: asset.purchaseDate || null,
        warrantyExp: asset.warrantyExp || null,
        status: asset.status || "Active",
        assetCondition: asset.assetCondition || "Good",
      },
      { transaction: t }
    );

    // 2) technical details
    if (technical) {
      await AssetTechnicalDetail.create(
        {
          assetId: newAsset.id,
          cpu: technical.cpu || null,
          ram: technical.ram || null,
          storage: technical.storage || null,
          os: technical.os || null,
          ipAddress: technical.ipAddress || null,
          domainName: technical.domainName || null,
          serialNo: technical.serialNo || null,
          otherSpecs: technical.otherSpecs || null,
        },
        { transaction: t }
      );
    }

    // 3) commercial details
    if (commercial) {
      await AssetCommercialDetail.create(
        {
          assetId: newAsset.id,
          vendorName: commercial.vendorName || null,
          poNo: commercial.poNo || null,
          invoiceNo: commercial.invoiceNo || null,
          amount: commercial.amount || null,
          amcVendor: commercial.amcVendor || null,
          amcExp: commercial.amcExp || null,
          remarks: commercial.remarks || null,
        },
        { transaction: t }
      );
    }

    // 4) license details
    if (license) {
      const keyHash = license.licenseKey
        ? crypto.createHash("sha256").update(license.licenseKey).digest("hex")
        : null;

      await AssetLicenseDetail.create(
        {
          assetId: newAsset.id,
          noOfLicenses: license.noOfLicenses || null,
          licenseKeyHash: keyHash,
          licenseExp: license.licenseExp || null,
          licenseNotes: license.notes || null,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ id: newAsset.id });
  } catch (err) {
    await t.rollback();
    console.error("createAsset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// UPDATE ASSET (PUT /api/assets/:id)
//  - requires updateRemark in body
//  - stores updatedBy and remark to AssetRemark
// ---------------------------------------------------------------------
exports.updateAsset = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const assetId = req.params.id;
    const { asset, technical, commercial, license, updateRemark, updatedBy } =
      req.body;

    if (!updateRemark || !updateRemark.trim()) {
      return res
        .status(400)
        .json({ message: "Update remark is required for audit trail." });
    }

    const updatedByFinal =
      updatedBy ||
      req.user?.employeeId ||
      req.user?.username ||
      req.user?.email ||
      "SYSTEM";

    const existing = await Asset.findByPk(assetId, { transaction: t });
    if (!existing) {
      await t.rollback();
      return res.status(404).json({ message: "Asset not found" });
    }

    // 1) update main asset details
    if (asset) {
      await existing.update(
        {
          assetCode: asset.assetCode ?? existing.assetCode,
          assetName: asset.assetName ?? existing.assetName,
          brandedOptionCode: asset.brandedOptionCode ?? existing.brandedOptionCode,
          groupId: asset.groupId ?? existing.groupId,
          subCategoryCode: asset.subCategoryCode ?? existing.subCategoryCode,
          brand: asset.brand ?? existing.brand,
          branch: asset.branch ?? existing.branch,
          departmentId:
            asset.departmentId !== undefined
              ? asset.departmentId
              : existing.departmentId,
          userAllocated:
            asset.userAllocated !== undefined
              ? asset.userAllocated
              : existing.userAllocated,
          purchaseDate: asset.purchaseDate ?? existing.purchaseDate,
          warrantyExp: asset.warrantyExp ?? existing.warrantyExp,
          status: asset.status ?? existing.status,
          assetCondition: asset.assetCondition ?? existing.assetCondition,
        },
        { transaction: t }
      );
    }

    // 2) technical details upsert
    if (technical) {
      const tech = await AssetTechnicalDetail.findOne({
        where: { assetId },
        transaction: t,
      });
      if (tech) {
        await tech.update(
          {
            cpu: technical.cpu ?? tech.cpu,
            ram: technical.ram ?? tech.ram,
            storage: technical.storage ?? tech.storage,
            os: technical.os ?? tech.os,
            ipAddress: technical.ipAddress ?? tech.ipAddress,
            domainName: technical.domainName ?? tech.domainName,
            serialNo: technical.serialNo ?? tech.serialNo,
            otherSpecs: technical.otherSpecs ?? tech.otherSpecs,
          },
          { transaction: t }
        );
      } else {
        await AssetTechnicalDetail.create(
          {
            assetId,
            cpu: technical.cpu || null,
            ram: technical.ram || null,
            storage: technical.storage || null,
            os: technical.os || null,
            ipAddress: technical.ipAddress || null,
            domainName: technical.domainName || null,
            serialNo: technical.serialNo || null,
            otherSpecs: technical.otherSpecs || null,
          },
          { transaction: t }
        );
      }
    }

    // 3) commercial details upsert
    if (commercial) {
      const comm = await AssetCommercialDetail.findOne({
        where: { assetId },
        transaction: t,
      });
      if (comm) {
        await comm.update(
          {
            vendorName: commercial.vendorName ?? comm.vendorName,
            poNo: commercial.poNo ?? comm.poNo,
            invoiceNo: commercial.invoiceNo ?? comm.invoiceNo,
            amount: commercial.amount ?? comm.amount,
            amcVendor: commercial.amcVendor ?? comm.amcVendor,
            amcExp: commercial.amcExp ?? comm.amcExp,
            remarks: commercial.remarks ?? comm.remarks,
          },
          { transaction: t }
        );
      } else {
        await AssetCommercialDetail.create(
          {
            assetId,
            vendorName: commercial.vendorName || null,
            poNo: commercial.poNo || null,
            invoiceNo: commercial.invoiceNo || null,
            amount: commercial.amount || null,
            amcVendor: commercial.amcVendor || null,
            amcExp: commercial.amcExp || null,
            remarks: commercial.remarks || null,
          },
          { transaction: t }
        );
      }
    }

    // 4) license details upsert
    if (license) {
      const lic = await AssetLicenseDetail.findOne({
        where: { assetId },
        transaction: t,
      });

      const keyHash = license.licenseKey
        ? crypto.createHash("sha256").update(license.licenseKey).digest("hex")
        : lic?.licenseKeyHash || null;

      if (lic) {
        await lic.update(
          {
            noOfLicenses:
              license.noOfLicenses !== undefined
                ? license.noOfLicenses
                : lic.noOfLicenses,
            licenseKeyHash: keyHash,
            licenseExp: license.licenseExp ?? lic.licenseExp,
            licenseNotes: license.notes ?? lic.licenseNotes,
          },
          { transaction: t }
        );
      } else {
        await AssetLicenseDetail.create(
          {
            assetId,
            noOfLicenses: license.noOfLicenses || null,
            licenseKeyHash: keyHash,
            licenseExp: license.licenseExp || null,
            licenseNotes: license.notes || null,
          },
          { transaction: t }
        );
      }
    }

    // 5) create remark row
    await AssetRemark.create(
      {
        assetId,
        remarks: updateRemark.trim(),
        updatedBy: updatedByFinal,
        dateUpdated: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Asset updated and remark recorded." });
  } catch (err) {
    await t.rollback();
    console.error("updateAsset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// GET ALL ASSETS (GET /api/assets)
// ---------------------------------------------------------------------
exports.getAssets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const {
      brandedOption,
      department,
      group,
      subCategory,
      status,
      condition,
      search,
      branch,
    } = req.query;

    const where = {};

    if (brandedOption) where.brandedOptionCode = brandedOption;
    if (department) where.departmentId = department;
    if (group) where.groupId = group;
    if (subCategory) where.subCategoryCode = subCategory;
    if (status) where.status = status;
    if (condition) where.assetCondition = condition;
    if (branch) where.branch = branch;

    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { assetCode: like },
        { assetName: like },
        { branch: like },
        { brand: like },
        { userAllocated: like },
      ];
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [
        { model: BrandedOption, as: "brandedOption", attributes: ["name"] },
        { model: AssetGroup, as: "group", attributes: ["name"] },
        { model: AssetSubCategory, as: "subCategory", attributes: ["name"] },
        { model: Department, as: "department", attributes: ["name"] },
      ],
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const { sendPaginated } = require('../utils/response');
    return sendPaginated(res, rows, page, limit, count, 'Assets fetched successfully');
  } catch (err) {
    console.error("getAssets error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// GET SINGLE ASSET BY ID (GET /api/assets/:id)
//  - fetch remarks separately to avoid alias issues
// ---------------------------------------------------------------------
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: BrandedOption, as: "brandedOption" },
        { model: AssetGroup, as: "group" },
        { model: AssetSubCategory, as: "subCategory" },
        { model: Department, as: "department" },
        { model: AssetTechnicalDetail, as: "technical" },
        { model: AssetCommercialDetail, as: "commercial" },
        { model: AssetLicenseDetail, as: "license" },
      ],
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Fetch remarks separately (no need for association alias)
    const remarks = await AssetRemark.findAll({
      where: { assetId: asset.id },
      order: [["dateUpdated", "DESC"]],
    });

    const assetJson = asset.toJSON();
    assetJson.remarks = remarks;

    res.json(assetJson);
  } catch (err) {
    console.error("getAssetById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// DELETE ASSET (DELETE /api/assets/:id)
// ---------------------------------------------------------------------
exports.deleteAsset = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const assetId = req.params.id;

    const existing = await Asset.findByPk(assetId, { transaction: t });
    if (!existing) {
      await t.rollback();
      return res.status(404).json({ message: "Asset not found" });
    }

    // Delete children first (safe side if no CASCADE)
    await AssetTechnicalDetail.destroy({ where: { assetId }, transaction: t });
    await AssetCommercialDetail.destroy({ where: { assetId }, transaction: t });
    await AssetLicenseDetail.destroy({ where: { assetId }, transaction: t });
    await AssetRemark.destroy({ where: { assetId }, transaction: t });

    await existing.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Asset deleted successfully." });
  } catch (err) {
    await t.rollback();
    console.error("deleteAsset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
