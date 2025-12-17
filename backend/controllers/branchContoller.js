// backend/controllers/branchContoller.js
const asyncHandler = require('express-async-handler');
const path = require('path');
const { validate } = require('../utils/validators');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const Branch = require('../models/Branch');

const infraModels = require(path.join(__dirname, '..', 'models', 'branchInfra'));
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

// GET ALL BRANCHES (with pagination)
exports.getBranches = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const { count, rows } = await Branch.findAndCountAll({
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  return sendPaginated(res, rows, page, limit, count, 'Branches fetched successfully');
});

// GET ONE BRANCH + ALL INFRA
exports.getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByPk(id, {
    include: [
      { model: BranchInfra, as: 'infra' },
      { model: BranchScanner, as: 'scanner' },
      { model: BranchProjector, as: 'projector' },
      { model: BranchPrinter, as: 'printer' },
      { model: BranchDesktop, as: 'desktop' },
      { model: BranchLaptop, as: 'laptop' },
      { model: BranchCctv, as: 'cctv' },
      { model: BranchPanel, as: 'panel' },
      { model: BranchIpPhone, as: 'ipphone' },
    ],
  });

  if (!branch) {
    return sendError(res, 'Branch not found', 404);
  }

  return sendSuccess(res, branch, 'Branch fetched successfully');
});

// CREATE BRANCH
exports.createBranch = asyncHandler(async (req, res) => {
  const { name, manager_name, address, contact } = req.body;

  // Validate input
  const { isValid, errors } = validate.branchInput(name, manager_name, address, contact);
  if (!isValid) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  const exists = await Branch.findOne({ where: { name } });
  if (exists) {
    return sendError(res, 'Branch already exists', 409);
  }

  const branch = await Branch.create(req.body);
  return sendSuccess(res, branch, 'Branch created successfully', 201);
});

// UPDATE BRANCH
exports.updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, manager_name, address, contact } = req.body;

  const branch = await Branch.findByPk(id);
  if (!branch) {
    return sendError(res, 'Branch not found', 404);
  }

  // Validate input
  const { isValid, errors } = validate.branchInput(name, manager_name, address, contact);
  if (!isValid) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  await branch.update(req.body);
  return sendSuccess(res, branch, 'Branch updated successfully');
});

// DELETE BRANCH
exports.deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByPk(id);
  if (!branch) {
    return sendError(res, 'Branch not found', 404);
  }

  await branch.destroy();
  return sendSuccess(res, {}, 'Branch deleted successfully');
});

// ================= HELP: UPDATE OR CREATE =================
async function updateOrCreate(model, branchId, data) {
  let record = await model.findOne({ where: { branchId } });
  if (!record) {
    record = await model.create({ branchId });
  }
  await record.update(data);
  return record;
}

// ================= UPDATE EACH INFRA SECTION =================
exports.updateInfra = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const infra = await updateOrCreate(BranchInfra, id, req.body);
  res.json(infra);
});

exports.updateScanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const scanner = await updateOrCreate(BranchScanner, id, req.body);
  res.json(scanner);
});

exports.updateProjector = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projector = await updateOrCreate(BranchProjector, id, req.body);
  res.json(projector);
});

exports.updatePrinter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const printer = await updateOrCreate(BranchPrinter, id, req.body);
  res.json(printer);
});

exports.updateDesktop = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const desktop = await updateOrCreate(BranchDesktop, id, req.body);
  res.json(desktop);
});

exports.updateLaptop = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const laptop = await updateOrCreate(BranchLaptop, id, req.body);
  res.json(laptop);
});

exports.updateCctv = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cctv = await updateOrCreate(BranchCctv, id, req.body);
  res.json(cctv);
});

exports.updatePanel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const panel = await updateOrCreate(BranchPanel, id, req.body);
  res.json(panel);
});

exports.updateIpPhone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipphone = await updateOrCreate(BranchIpPhone, id, req.body);
  res.json(ipphone);
});
