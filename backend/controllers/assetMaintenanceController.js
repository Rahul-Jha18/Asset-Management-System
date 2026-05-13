// backend/controllers/assetMaintenanceController.js
const db = require("../models");
const AssetMaintenanceLog = db.AssetMaintenanceLog;

// safe decimal converter
const toDecimalOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

exports.getLogs = async (req, res) => {
  try {
    const { branchId, section, assetId } = req.query;

    if (!branchId || !section || !assetId) {
      return res.status(400).json({
        message: "branchId, section and assetId are required",
      });
    }

    const rows = await AssetMaintenanceLog.findAll({
      where: {
        branchId: Number(branchId),
        section: String(section).toLowerCase(),
        assetId: Number(assetId),
      },
      order: [["created_at", "DESC"]],
    });

    return res.json({ data: rows });
  } catch (err) {
    console.error("getLogs error:", err);
    return res.status(500).json({ message: "Failed to fetch maintenance logs" });
  }
};

exports.createLog = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.branchId || !body.section || !body.assetId) {
      return res.status(400).json({
        message: "branchId, section and assetId are required",
      });
    }

    const payload = {
      branchId: Number(body.branchId),
      section: String(body.section).toLowerCase(),
      assetId: Number(body.assetId),
      sub_category_code: body.sub_category_code || null,

      maintenance_type: body.maintenance_type || "Repair",
      issue_title: body.issue_title || null,
      issue_details: body.issue_details || null,
      action_taken: body.action_taken || null,

      vendor_name: body.vendor_name || null,
      ticket_no: body.ticket_no || null,

      start_date: body.start_date || null,
      end_date: body.end_date || null,

      downtime_hours: toDecimalOrNull(body.downtime_hours),
      cost: toDecimalOrNull(body.cost),

      status: body.status || "Open",
      created_by: body.created_by || null,
      remarks: body.remarks || null,
    };

    const created = await AssetMaintenanceLog.create(payload);
    return res.status(201).json({ data: created });
  } catch (err) {
    console.error("createLog error:", err);
    return res.status(500).json({ message: "Failed to add maintenance log" });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const row = await AssetMaintenanceLog.findByPk(id);
    if (!row) return res.status(404).json({ message: "Maintenance log not found" });

    const body = req.body || {};

    const payload = {
      // allow update
      maintenance_type: body.maintenance_type ?? row.maintenance_type,
      issue_title: body.issue_title ?? row.issue_title,
      issue_details: body.issue_details ?? row.issue_details,
      action_taken: body.action_taken ?? row.action_taken,

      vendor_name: body.vendor_name ?? row.vendor_name,
      ticket_no: body.ticket_no ?? row.ticket_no,

      start_date: body.start_date ?? row.start_date,
      end_date: body.end_date ?? row.end_date,

      downtime_hours: body.downtime_hours === undefined ? row.downtime_hours : toDecimalOrNull(body.downtime_hours),
      cost: body.cost === undefined ? row.cost : toDecimalOrNull(body.cost),

      status: body.status ?? row.status,
      remarks: body.remarks ?? row.remarks,
      created_by: body.created_by ?? row.created_by,
    };

    await row.update(payload);
    return res.json({ data: row });
  } catch (err) {
    console.error("updateLog error:", err);
    return res.status(500).json({ message: "Failed to update maintenance log" });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const row = await AssetMaintenanceLog.findByPk(id);
    if (!row) return res.status(404).json({ message: "Maintenance log not found" });

    await row.destroy();
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteLog error:", err);
    return res.status(500).json({ message: "Failed to delete maintenance log" });
  }
};
