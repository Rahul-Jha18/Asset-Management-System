// backend/controllers/branchContoller.js
const asyncHandler = require("express-async-handler");
const { validate } = require("../utils/validators");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");

const Branch = require("../models/Branch");
const ServiceStation = require("../models/ServiceStation");

// ✅ FIXED IMPORT (matches your file name)
const infraModels = require("../models/BranchInfra");

const {
  BranchInfra,
  BranchScanner,
  BranchProjector,
  BranchPrinter,
  BranchDesktop,
  BranchLaptop,
  BranchCctv,
  BranchPanel,
  BranchIpPhone,
} = infraModels;

// Helper: sanitize payload (avoid service_station old field, keep FK)
function sanitizeBranchBody(body) {
  return {
    name: body.name,
    manager_name: body.manager_name,
    address: body.address,
    contact: body.contact,
    ext_no: body.ext_no,
    region: body.region,
    service_station_id:
      body.service_station_id === "" || body.service_station_id === undefined
        ? null
        : body.service_station_id === null
        ? null
        : Number(body.service_station_id),
  };
}

// GET ALL BRANCHES (with pagination) + service station join
exports.getBranches = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const { count, rows } = await Branch.findAndCountAll({
    limit,
    offset,
    order: [["id", "ASC"]],
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  return sendPaginated(res, rows, page, limit, count, "Branches fetched successfully");
});

// GET ONE BRANCH + ALL INFRA/DEVICES (multi) + service station join
exports.getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByPk(id, {
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name", "manager_name", "manager_email", "contact"],
        required: false,
      },

      { model: BranchInfra, as: "infra" },

      { model: BranchScanner, as: "scanners" },
      { model: BranchProjector, as: "projectors" },
      { model: BranchPrinter, as: "printers" },
      { model: BranchDesktop, as: "desktops" },
      { model: BranchLaptop, as: "laptops" },
      { model: BranchCctv, as: "cctvs" },
      { model: BranchPanel, as: "panels" },
      { model: BranchIpPhone, as: "ipphones" },
    ],
  });

  if (!branch) return sendError(res, "Branch not found", 404);
  return sendSuccess(res, branch, "Branch fetched successfully");
});

// CREATE BRANCH
exports.createBranch = asyncHandler(async (req, res) => {
  const { name, manager_name, address, contact } = req.body;

  const { isValid, errors } = validate.branchInput(name, manager_name, address, contact);
  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const exists = await Branch.findOne({ where: { name } });
  if (exists) return sendError(res, "Branch already exists", 409);

  const payload = sanitizeBranchBody(req.body);

  const branch = await Branch.create(payload);
  return sendSuccess(res, branch, "Branch created successfully", 201);
});

// UPDATE BRANCH
exports.updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, manager_name, address, contact } = req.body;

  const branch = await Branch.findByPk(id);
  if (!branch) return sendError(res, "Branch not found", 404);

  const { isValid, errors } = validate.branchInput(name, manager_name, address, contact);
  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const payload = sanitizeBranchBody(req.body);

  await branch.update(payload);
  return sendSuccess(res, branch, "Branch updated successfully");
});

// DELETE BRANCH
exports.deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByPk(id);
  if (!branch) return sendError(res, "Branch not found", 404);

  await branch.destroy();
  return sendSuccess(res, {}, "Branch deleted successfully");
});

// ================= INFRA (single record per branch) =================
async function updateOrCreate(model, branchId, data) {
  let record = await model.findOne({ where: { branchId } });
  if (!record) record = await model.create({ branchId });
  await record.update(data);
  return record;
}

exports.updateInfra = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const infra = await updateOrCreate(BranchInfra, id, req.body);
  res.json(infra);
});

// ================= DEVICE CRUD (multi rows per branch) =================
function deviceCrud(model) {
  return {
    list: asyncHandler(async (req, res) => {
      const { id: branchId } = req.params;
      const rows = await model.findAll({ where: { branchId }, order: [["id", "ASC"]] });
      res.json(rows);
    }),

    create: asyncHandler(async (req, res) => {
      const { id: branchId } = req.params;
      const row = await model.create({ branchId, ...req.body });
      res.status(201).json(row);
    }),

    update: asyncHandler(async (req, res) => {
      const { id: branchId, rowId } = req.params;
      const row = await model.findOne({ where: { id: rowId, branchId } });
      if (!row) return sendError(res, "Record not found", 404);
      await row.update(req.body);
      res.json(row);
    }),

    remove: asyncHandler(async (req, res) => {
      const { id: branchId, rowId } = req.params;
      const row = await model.findOne({ where: { id: rowId, branchId } });
      if (!row) return sendError(res, "Record not found", 404);
      await row.destroy();
      res.json({ ok: true });
    }),
  };
}

exports.scanners = deviceCrud(BranchScanner);
exports.projectors = deviceCrud(BranchProjector);
exports.printers = deviceCrud(BranchPrinter);
exports.desktops = deviceCrud(BranchDesktop);
exports.laptops = deviceCrud(BranchLaptop);
exports.cctvs = deviceCrud(BranchCctv);
exports.panels = deviceCrud(BranchPanel);
exports.ipphones = deviceCrud(BranchIpPhone);
