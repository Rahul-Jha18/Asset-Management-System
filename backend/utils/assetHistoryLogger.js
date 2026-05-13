// backend/utils/assetHistoryLogger.js
const { AssetHistory } = require("../models");

/**
 * Log asset changes to history table
 * @param {number} branchId - Branch ID
 * @param {number} assetId - Asset ID
 * @param {string} assetType - Type of asset (laptop, desktop, etc.)
 * @param {object} oldData - Old data before update
 * @param {object} newData - New data after update
 * @param {object} user - User object with id and name
 * @param {string} changeType - Type of change (CREATE, UPDATE, DELETE, TRANSFER)
 */
async function logAssetChange(branchId, assetId, assetType, oldData, newData, user, changeType = "UPDATE") {
  if (!branchId || !assetId || !assetType) {
    console.error("Missing required fields for history logging:", { branchId, assetId, assetType });
    return;
  }

  try {
    const changedFields = [];

    // Compare all fields
    for (const key in newData) {
      // Skip internal fields
      if (
        [
          "id",
          "branchId",
          "createdAt",
          "updatedAt",
          "created_at",
          "updated_at",
          "section",
        ].includes(key)
      ) {
        continue;
      }

      const oldValue = oldData[key];
      const newValue = newData[key];

      // Only log if value actually changed
      if (oldValue !== newValue) {
        changedFields.push({
          fieldName: key,
          oldValue: oldValue === null ? null : String(oldValue),
          newValue: newValue === null ? null : String(newValue),
        });
      }
    }

    // If no fields changed, don't create history entry
    if (changedFields.length === 0) {
      return;
    }

    // Create a history entry for each changed field
    for (const field of changedFields) {
      await AssetHistory.create({
        branchId: Number(branchId),
        assetId: Number(assetId),
        assetType,
        changeType,
        fieldName: field.fieldName,
        oldValue: field.oldValue,
        newValue: field.newValue,
        changedBy: user?.id || null,
        changedByName: user?.name || user?.username || "System",
        description: `${field.fieldName}: ${field.oldValue} → ${field.newValue}`,
        metadata: {
          assetType,
          branchId,
          assetId,
        },
      });
    }

    console.log(`Logged ${changedFields.length} changes for asset ${assetId}`);
  } catch (error) {
    console.error("Error logging asset change:", error);
    // Don't throw - fail silently so update continues
  }
}

/**
 * Log asset deletion
 */
async function logAssetDeletion(branchId, assetId, assetType, deletedData, user) {
  try {
    await AssetHistory.create({
      branchId: Number(branchId),
      assetId: Number(assetId),
      assetType,
      changeType: "DELETE",
      fieldName: null,
      oldValue: JSON.stringify(deletedData),
      newValue: null,
      changedBy: user?.id || null,
      changedByName: user?.name || user?.username || "System",
      description: `Asset deleted`,
      metadata: {
        assetType,
        branchId,
        assetId,
        deletedData: deletedData,
      },
    });

    console.log(`Logged deletion for asset ${assetId}`);
  } catch (error) {
    console.error("Error logging asset deletion:", error);
  }
}

/**
 * Log asset creation
 */
async function logAssetCreation(branchId, assetId, assetType, createdData, user) {
  try {
    await AssetHistory.create({
      branchId: Number(branchId),
      assetId: Number(assetId),
      assetType,
      changeType: "CREATE",
      fieldName: null,
      oldValue: null,
      newValue: JSON.stringify(createdData),
      changedBy: user?.id || null,
      changedByName: user?.name || user?.username || "System",
      description: `Asset created`,
      metadata: {
        assetType,
        branchId,
        assetId,
      },
    });

    console.log(`Logged creation for asset ${assetId}`);
  } catch (error) {
    console.error("Error logging asset creation:", error);
  }
}

module.exports = {
  logAssetChange,
  logAssetDeletion,
  logAssetCreation,
};
