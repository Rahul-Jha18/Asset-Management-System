// backend/controllers/assetHistoryController.js
const asyncHandler = require("express-async-handler");
const { AssetHistory } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Get history for a specific asset
 * GET /api/asset-history/asset/:assetId
 */
exports.getAssetHistory = asyncHandler(async (req, res) => {
  const { assetId } = req.params;
  const { branchId, limit = 100 } = req.query;

  if (!assetId) {
    return sendError(res, "Asset ID is required", 400);
  }

  const where = { assetId: Number(assetId) };

  if (branchId) where.branchId = Number(branchId);

  const history = await AssetHistory.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: Math.min(Number(limit) || 100, 1000),
  });

  return sendSuccess(res, history, "Asset history retrieved");
});

/**
 * Get history for a specific branch
 * GET /api/asset-history/branch/:branchId
 */
exports.getBranchHistory = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { assetType, limit = 500 } = req.query;

  if (!branchId) {
    return sendError(res, "Branch ID is required", 400);
  }

  const where = { branchId: Number(branchId) };

  if (assetType) where.assetType = assetType;

  const history = await AssetHistory.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: Math.min(Number(limit) || 500, 5000),
  });

  return sendSuccess(res, history, "Branch history retrieved");
});

/**
 * Get change summary for an asset
 * GET /api/asset-history/summary/:assetId
 */
exports.getAssetChangeSummary = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  if (!assetId) {
    return sendError(res, "Asset ID is required", 400);
  }

  const history = await AssetHistory.findAll({
    where: { assetId: Number(assetId) },
    order: [["createdAt", "DESC"]],
  });

  if (!history.length) {
    return sendSuccess(res, {
      assetId,
      createdAt: null,
      lastModified: null,
      totalChanges: 0,
      changes: [],
    });
  }

  const createdRecord = history[history.length - 1];
  const lastModified = history[0].createdAt;

  const changesByField = {};

  for (const record of history) {
    if (record.fieldName) {
      if (!changesByField[record.fieldName]) {
        changesByField[record.fieldName] = [];
      }

      changesByField[record.fieldName].push({
        oldValue: record.oldValue,
        newValue: record.newValue,
        changedAt: record.createdAt,
        changedBy: record.changedByName,
      });
    }
  }

  return sendSuccess(res, {
    assetId,
    createdAt: createdRecord.createdAt,
    lastModified,
    totalChanges: history.length,
    changesByField,
  });
});

/**
 * Get recent changes across all assets in a branch
 * GET /api/asset-history/recent-changes/:branchId
 */
exports.getRecentChanges = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { days = 30, limit = 100 } = req.query;

  if (!branchId) {
    return sendError(res, "Branch ID is required", 400);
  }

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(days));

  const history = await AssetHistory.findAll({
    where: {
      branchId: Number(branchId),
      createdAt: {
        [require("sequelize").Op.gte]: daysAgo,
      },
    },
    order: [["createdAt", "DESC"]],
    limit: Math.min(Number(limit) || 100, 1000),
  });

  return sendSuccess(res, history, `Recent changes in last ${days} days`);
});

/**
 * Get change stats for a branch
 * GET /api/asset-history/stats/:branchId
 */
exports.getBranchStats = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { days = 30 } = req.query;

  if (!branchId) {
    return sendError(res, "Branch ID is required", 400);
  }

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(days));

  const history = await AssetHistory.findAll({
    where: {
      branchId: Number(branchId),
      createdAt: {
        [require("sequelize").Op.gte]: daysAgo,
      },
    },
    attributes: [
      "changeType",
      "assetType",
      [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"],
    ],
    group: ["changeType", "assetType"],
    raw: true,
  });

  const stats = {
    branchId: Number(branchId),
    days: Number(days),
    byChangeType: {},
    byAssetType: {},
    total: 0,
  };

  for (const record of history) {
    const { changeType, assetType, count } = record;

    stats.byChangeType[changeType] = (stats.byChangeType[changeType] || 0) + count;
    stats.byAssetType[assetType] = (stats.byAssetType[assetType] || 0) + count;
    stats.total += count;
  }

  return sendSuccess(res, stats);
});

/**
 * Clear history for testing (admin only)
 * DELETE /api/asset-history/clear
 */
exports.clearHistory = asyncHandler(async (req, res) => {
  const { branchId, assetId } = req.query;

  let where = {};

  if (branchId) where.branchId = Number(branchId);
  if (assetId) where.assetId = Number(assetId);

  if (Object.keys(where).length === 0) {
    return sendError(res, "Please specify branchId and/or assetId to clear", 400);
  }

  const deleted = await AssetHistory.destroy({ where });

  return sendSuccess(res, {
    deleted,
    message: `${deleted} history records deleted`,
  });
});