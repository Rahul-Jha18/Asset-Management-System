// backend/controllers/assetMetaController.js
const asyncHandler = require("express-async-handler");
const { sequelize } = require("../config/db");
const { AssetGroup, AssetSubCategory } = require("../models");

exports.getAssetGroups = asyncHandler(async (req, res) => {
  const [rows] = await sequelize.query(
    "SELECT id, name FROM asset_groups ORDER BY name ASC"
  );
  res.json({ data: rows });
});

exports.createAssetGroup = asyncHandler(async (req, res) => {
  const { id, name } = req.body;

  // Validate required fields
  if (!id || !name) {
    return res.status(400).json({ message: "ID and Name are required" });
  }

  const idUpper = String(id).trim().toUpperCase();
  const nameUpper = String(name).trim().toUpperCase();

  if (idUpper.length !== 1 || !/^[A-Z]$/.test(idUpper)) {
    return res.status(400).json({ message: "ID must be a single character (A-Z)" });
  }

  if (nameUpper.length === 0 || nameUpper.length > 100) {
    return res.status(400).json({ message: "Name must be between 1-100 characters" });
  }

  // Check if ID already exists
  const existingId = await AssetGroup.findByPk(idUpper);
  if (existingId) {
    return res.status(400).json({ message: "ID already exists" });
  }

  const group = await AssetGroup.create({
    id: idUpper,
    name: nameUpper,
  });

  res.status(201).json({ data: group, message: "Category created successfully" });
});

exports.getAssetSubCategories = asyncHandler(async (req, res) => {
  const { groupId } = req.query; // H/I/L/S/C

  if (groupId) {
    const [rows] = await sequelize.query(
      "SELECT code, group_id, name FROM asset_sub_categories WHERE group_id = ? ORDER BY name ASC",
      { replacements: [groupId] }
    );
    return res.json({ data: rows });
  }

  const [rows] = await sequelize.query(
    "SELECT code, group_id, name FROM asset_sub_categories ORDER BY name ASC"
  );
  res.json({ data: rows });
});

exports.createAssetSubCategory = asyncHandler(async (req, res) => {
  const { code, groupId, name } = req.body;

  // Validate required fields
  if (!code || !groupId || !name) {
    return res.status(400).json({ message: "Code, Group ID, and Name are required" });
  }

  const codeUpper = String(code).trim().toUpperCase();
  const groupIdUpper = String(groupId).trim().toUpperCase();
  const nameUpper = String(name).trim().toUpperCase();

  if (codeUpper.length === 0 || codeUpper.length > 5) {
    return res.status(400).json({ message: "Code must be 1-5 characters" });
  }

  if (groupIdUpper.length !== 1) {
    return res.status(400).json({ message: "Group ID must be a single character matching an existing category" });
  }

  if (nameUpper.length === 0 || nameUpper.length > 100) {
    return res.status(400).json({ message: "Name must be between 1-100 characters" });
  }

  // Check if code already exists
  const existingCode = await AssetSubCategory.findByPk(codeUpper);
  if (existingCode) {
    return res.status(400).json({ message: "Code already exists" });
  }

  // Check if group exists
  const groupExists = await AssetGroup.findByPk(groupIdUpper);
  if (!groupExists) {
    return res.status(400).json({ message: "Group ID does not exist" });
  }

  const subCategory = await AssetSubCategory.create({
    code: codeUpper,
    groupId: groupIdUpper,
    name: nameUpper,
  });

  res.status(201).json({ data: subCategory, message: "Sub-category created successfully" });
});
