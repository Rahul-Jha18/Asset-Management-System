const asyncHandler = require("express-async-handler");
const db = require("../models");
const { sendError, sendSuccess } = require("../utils/response");
const { logAssetChange } = require("../utils/assetHistoryLogger");

const sectionConfigMap = {
  desktop: { model: () => db.BranchDesktop, pk: "id", userField: "userName" },
  laptop: { model: () => db.BranchLaptop, pk: "id", userField: "laptop_user" },
  printer: { model: () => db.BranchPrinter, pk: "id", userField: "assigned_user" },
  scanner: { model: () => db.BranchScanner, pk: "id", userField: "assigned_user" },
  projector: { model: () => db.BranchProjector, pk: "id", userField: null },
  panel: { model: () => db.BranchPanel, pk: "id", userField: "panel_user" },
  ipphone: { model: () => db.BranchIpPhone, pk: "id", userField: "assigned_user" },
  cctv: { model: () => db.BranchCctv, pk: "cctv_id", userField: null },
  server: { model: () => db.BranchServer, pk: "id", userField: null },
  firewall_router: { model: () => db.BranchFirewallRouter, pk: "id", userField: null },
  switch: { model: () => db.BranchSwitch, pk: "id", userField: "assigned_user" },
  extra_monitor: { model: () => db.BranchExtraMonitor, pk: "id", userField: "assigned_user" },
  connectivity: { model: () => db.BranchConnectivity, pk: "id", userField: null },
  ups: { model: () => db.BranchUps, pk: "id", userField: "assigned_user" },
  inverter: { model: () => db.Inverter, pk: "id", userField: "assigned_user" },

  application_software: { model: () => db.BranchApplicationSoftware, pk: "id", userField: "assigned_to" },
  office_software: { model: () => db.BranchOfficeSoftware, pk: "id", userField: "assigned_to" },
  utility_software: { model: () => db.BranchUtilitySoftware, pk: "id", userField: null },
  security_software: { model: () => db.BranchSecuritySoftware, pk: "id", userField: null },
  security_software_installed: { model: () => db.BranchSecuritySoftwareInstalled, pk: "id", userField: null },
  services: { model: () => db.BranchServices, pk: "id", userField: null },
  licenses: { model: () => db.BranchLicenses, pk: "id", userField: "assigned_to" },
  windows_os: { model: () => db.BranchWindowsOS, pk: "id", userField: null },
  windows_servers: { model: () => db.BranchWindowsServers, pk: "id", userField: null },
};

const allowedSections = new Set(Object.keys(sectionConfigMap));

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === "") return null;

  // IMPORTANT: reject names like "Rahul Jha"
  if (typeof value === "string" && value.trim() !== "" && !/^\d+$/.test(value.trim())) {
    return null;
  }

  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

exports.transferAsset = asyncHandler(async (req, res) => {
  const {
    section,
    assetId,
    fromBranchId,
    toBranchId,
    transferType = "branch",
    fromUserId = null,
    fromUserName = null,
    toUserId = null,
    toUserName = null,
    reason = null,
    remarks = null,
    transferredBy = null,
  } = req.body;

  const key = String(section || "").trim().toLowerCase();

  if (!allowedSections.has(key)) {
    return sendError(
      res,
      `Invalid section for transfer. Allowed: ${Array.from(allowedSections).join(", ")}`,
      400
    );
  }

  if (!["branch", "user", "both"].includes(String(transferType))) {
    return sendError(res, "transferType must be one of: branch, user, both", 400);
  }

  const cfg = sectionConfigMap[key];
  const Model = cfg?.model?.();
  const pk = cfg?.pk || "id";
  const userField = cfg?.userField || null;

  if (!Model) {
    return sendError(res, "Model not found for section", 500);
  }

  const aId = Number(assetId);
  const fromId = Number(fromBranchId);
  const targetBranchId = transferType === "user" ? fromId : Number(toBranchId);

  if (!Number.isFinite(aId) || !Number.isFinite(fromId)) {
    return sendError(res, "assetId and fromBranchId must be valid numbers", 400);
  }

  if ((transferType === "branch" || transferType === "both") && !Number.isFinite(targetBranchId)) {
    return sendError(res, "toBranchId must be a valid number for branch/both transfer", 400);
  }

  if ((transferType === "branch" || transferType === "both") && fromId === targetBranchId) {
    return sendError(res, "Target branch must be different", 400);
  }

  const normalizedFromUserId = toNullableInt(fromUserId);
  let normalizedToUserId = toNullableInt(toUserId);

  const normalizedFromUserName = String(fromUserName ?? "").trim() || null;
  let normalizedToUserName = String(toUserName ?? "").trim() || null;

  // If frontend accidentally sends name inside toUserId, move it to toUserName
  if (!normalizedToUserId && typeof toUserId === "string" && toUserId.trim() && !normalizedToUserName) {
    normalizedToUserName = toUserId.trim();
  }

  if ((transferType === "user" || transferType === "both") && !normalizedToUserId && !normalizedToUserName) {
    return sendError(res, "toUserId or toUserName is required for user/both transfer", 400);
  }

  if (db.Branch && (transferType === "branch" || transferType === "both")) {
    const [fromBranch, toBranch] = await Promise.all([
      db.Branch.findByPk(fromId),
      db.Branch.findByPk(targetBranchId),
    ]);

    if (!fromBranch) return sendError(res, "Source branch not found", 404);
    if (!toBranch) return sendError(res, "Target branch not found", 404);
  }

  const whereClause = {
    [pk]: aId,
    branchId: fromId,
  };

  const asset = await Model.findOne({ where: whereClause });

  if (!asset) {
    return sendError(res, `Asset not found in source branch for section "${key}"`, 404);
  }

  const oldData = asset.toJSON();
  const updatePayload = {};

  if (transferType === "branch" || transferType === "both") {
    updatePayload.branchId = targetBranchId;
  }

  if ((transferType === "user" || transferType === "both") && userField) {
    updatePayload[userField] = normalizedToUserName || oldData[userField] || null;
  }

  if (remarks !== undefined) {
    updatePayload.remarks = remarks;
  }

  const t = await db.sequelize.transaction();

  try {
    await asset.update(updatePayload, { transaction: t });

    const newData = asset.toJSON();

    const assetCode =
      asset.assetId ||
      asset.assetCode ||
      `${key.toUpperCase()}-${aId}`;

    if (db.AssetTransfer) {
      await db.AssetTransfer.create(
        {
          assetCode,
          section: key,
          assetId: aId,
          transferType,

          fromBranchId: fromId,
          toBranchId: transferType === "user" ? fromId : targetBranchId,

          fromUserId: normalizedFromUserId,
          fromUserName:
            normalizedFromUserName ||
            (userField ? oldData[userField] || null : null),

          toUserId: normalizedToUserId,
          toUserName:
            normalizedToUserName ||
            (userField ? newData[userField] || null : null),

          reason: reason ?? remarks ?? null,
          remarks: remarks ?? null,
          transferredBy: transferredBy ?? req.user?.name ?? null,
        },
        { transaction: t }
      );
    }

    const user = req.user || {
      id: null,
      name: transferredBy || "System",
      username: transferredBy || "system",
    };

    await logAssetChange(fromId, aId, key, oldData, newData, user, "TRANSFER", t);

    if ((transferType === "branch" || transferType === "both") && fromId !== targetBranchId) {
      await logAssetChange(targetBranchId, aId, key, oldData, newData, user, "TRANSFER", t);
    }

    await t.commit();

    return sendSuccess(
      res,
      {
        section: key,
        assetCode,
        transferType,
        transferredAsset: asset,
        fromBranchId: fromId,
        toBranchId: transferType === "user" ? fromId : targetBranchId,
        fromUserId: normalizedFromUserId,
        fromUserName:
          normalizedFromUserName ||
          (userField ? oldData[userField] || null : null),
        toUserId: normalizedToUserId,
        toUserName:
          normalizedToUserName ||
          (userField ? asset[userField] || null : null),
      },
      "Asset transferred successfully"
    );
  } catch (err) {
    await t.rollback();
    throw err;
  }
});

exports.getAssetTransferHistory = asyncHandler(async (req, res) => {
  const { assetCode, section, assetId } = req.query;

  if (!db.AssetTransfer) {
    return sendError(res, "AssetTransfer model not found", 500);
  }

  const where = {};

  if (assetCode) where.assetCode = assetCode;
  if (section) where.section = String(section).trim().toLowerCase();
  if (assetId && !Number.isNaN(Number(assetId))) where.assetId = Number(assetId);

  const rows = await db.AssetTransfer.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return sendSuccess(res, rows, "Asset transfer history fetched successfully");
});