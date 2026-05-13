// backend/controllers/assetController.js
const asyncHandler = require("express-async-handler");
const { AssetGroup, AssetSubCategory, sequelize } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

// Create Group + Subcategory
exports.createGroupAndSubcategory = asyncHandler(async (req, res) => {
  const { groupName, subCategoryName, subCategoryCode } = req.body;

  if (!groupName || !subCategoryName || !subCategoryCode)
    return sendError(res, "All fields are required", 400);

  let t;
  try {
    t = await sequelize.transaction();

    //  Create or find the group
    const [group, createdGroup] = await AssetGroup.findOrCreate({
      where: { name: groupName },
      defaults: { id: groupName[0].toUpperCase(), name: groupName },
      transaction: t,
    });

    //  Create subcategory
    const [subCategory, createdSubCat] = await AssetSubCategory.findOrCreate({
      where: { code: subCategoryCode },
      defaults: {
        code: subCategoryCode,
        groupId: group.id,
        name: subCategoryName,
      },
      transaction: t,
    });

    await t.commit();
    return sendSuccess(res, { group, subCategory }, "Group & Subcategory created successfully", 201);
  } catch (err) {
    if (t) await t.rollback();
    console.error(err);
    return sendError(res, "Failed to create group or subcategory", 500);
  }
});
