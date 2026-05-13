// backend/utils/assetHistoryTracker.js
const db = require("../models");
const { AssetHistory } = db;

/**
 * Compare old and new values and log differences to AssetHistory
 * @param {Object} params
 * @param {number} params.branchId - Branch ID
 * @param {number} params.assetId - Asset ID
 * @param {string} params.assetType - Type of asset (laptop, desktop, printer, etc.)
 * @param {Object} params.oldData - Previous data object
 * @param {Object} params.newData - New data object
 * @param {string} params.changeType - Type of change (CREATE, UPDATE, DELETE, TRANSFER, MAINTENANCE)
 * @param {number} params.userId - User ID who made the change
 * @param {string} params.userName - User name who made the change
 * @param {string} params.description - Description of the change
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Array>} Array of created history records
 */
async function trackAssetChange({
  branchId,
  assetId,
  assetType,
  oldData = {},
  newData = {},
  changeType = "UPDATE",
  userId = null,
  userName = null,
  description = null,
  metadata = null,
}) {
  try {
    const histories = [];

    // If no oldData (CREATE), log the new data
    if (!oldData || Object.keys(oldData).length === 0) {
      const hist = await AssetHistory.create({
        branchId,
        assetId,
        assetType,
        changeType: changeType || "CREATE",
        fieldName: null,
        oldValue: null,
        newValue: JSON.stringify(newData),
        changedBy: userId,
        changedByName: userName,
        description: description || `${assetType} created`,
        metadata,
      });
      histories.push(hist);
      return histories;
    }

    // For UPDATE, compare each field
    if (changeType === "UPDATE") {
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

      for (const key of allKeys) {
        const oldVal = oldData[key];
        const newVal = newData[key];

        // Skip if values are identical
        if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
          continue;
        }

        // Skip sensitive fields we don't want to track
        const skipFields = ["createdAt", "updatedAt", "created_at", "updated_at"];
        if (skipFields.includes(key)) {
          continue;
        }

        const hist = await AssetHistory.create({
          branchId,
          assetId,
          assetType,
          changeType: "UPDATE",
          fieldName: key,
          oldValue: formatValue(oldVal),
          newValue: formatValue(newVal),
          changedBy: userId,
          changedByName: userName,
          description:
            description ||
            `${key} changed from "${formatDisplay(oldVal)}" to "${formatDisplay(newVal)}"`,
          metadata: {
            ...(metadata || {}),
            field: key,
          },
        });
        histories.push(hist);
      }
    } else {
      // For DELETE, TRANSFER, MAINTENANCE - log single record
      const hist = await AssetHistory.create({
        branchId,
        assetId,
        assetType,
        changeType,
        fieldName: null,
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(newData),
        changedBy: userId,
        changedByName: userName,
        description: description || `${assetType} ${changeType.toLowerCase()}`,
        metadata,
      });
      histories.push(hist);
    }

    return histories;
  } catch (error) {
    console.error("Error tracking asset change:", error);
    // Don't throw - we don't want history tracking to break the main operation
    return [];
  }
}

/**
 * Get history for a specific asset
 * @param {number} assetId - Asset ID
 * @param {number} branchId - Branch ID (optional, for filtering)
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Array of history records
 */
async function getAssetHistory(assetId, branchId = null, limit = 100) {
  try {
    const where = { assetId };
    if (branchId) where.branchId = branchId;

    const history = await AssetHistory.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
    });

    return history;
  } catch (error) {
    console.error("Error fetching asset history:", error);
    return [];
  }
}

/**
 * Get history for a branch
 * @param {number} branchId - Branch ID
 * @param {string} assetType - Filter by asset type (optional)
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Array of history records
 */
async function getBranchHistory(branchId, assetType = null, limit = 500) {
  try {
    const where = { branchId };
    if (assetType) where.assetType = assetType;

    const history = await AssetHistory.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
    });

    return history;
  } catch (error) {
    console.error("Error fetching branch history:", error);
    return [];
  }
}

/**
 * Format value for display
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
function formatDisplay(value) {
  if (value === null || value === undefined) return "(empty)";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Format value for storage
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
function formatValue(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Create initial history record for imported assets
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Created history record
 */
async function trackAssetImport({
  branchId,
  assetId,
  assetType,
  assetData,
  userId = null,
  userName = "System",
}) {
  return trackAssetChange({
    branchId,
    assetId,
    assetType,
    oldData: {},
    newData: assetData,
    changeType: "CREATE",
    userId,
    userName,
    description: `${assetType} imported`,
  });
}

module.exports = {
  trackAssetChange,
  getAssetHistory,
  getBranchHistory,
  trackAssetImport,
  formatValue,
  formatDisplay,
};
