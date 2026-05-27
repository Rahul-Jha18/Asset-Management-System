const asyncHandler = require("express-async-handler");
const { validate } = require("../utils/validators");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { Op } = require("sequelize");

const db = require("../models");

const Branch = db.Branch;
const ServiceStation = db.ServiceStation;

const {
  BranchInfra,
  BranchConnectivity,
  BranchUps,
  Inverter,
  BranchScanner,
  BranchProjector,
  BranchPrinter,
  BranchDesktop,
  QrDesktopComputer,
  BranchLaptop,
  BranchCctv,
  Camera,
  BranchPanel,
  BranchIpPhone,
  BranchServer,
  BranchFirewallRouter,
  BranchSwitch,
  BranchExtraMonitor,

  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchUtilitySoftware,
  BranchServices,
  BranchLicenses,
  BranchWindowsOS,
  BranchOnlineConferenceTools,
  BranchWindowsServers,

  AssetSubCategory,
  AssetGroup,
} = db;

const pingDevice = require("../utils/pingDevice");

function sanitizeBranchBody(body) {
  return {
    name: body.name,
    manager_name: body.manager_name,
    gateway: body.gateway,
    contact: body.contact,
    branch_code: body.branch_code,
    region: body.region,
    service_station_id:
      body.service_station_id === "" || body.service_station_id === undefined
        ? null
        : body.service_station_id === null
        ? null
        : Number(body.service_station_id),
    remarks: body.remarks ?? null,
  };
}

const normalizeRole = (role) =>
  String(role || "").trim().toLowerCase().replace(/[_\s-]/g, "");

const branchQueryFilter = (req) => {
  if (normalizeRole(req.user?.role) !== "subadmin") return {};
  const stationId = Number(req.user?.service_station_id);
  if (!stationId) return { service_station_id: -999999 };
  return { service_station_id: stationId };
};

const getBranchByIdForUser = async (req, id, extraOptions = {}) => {
  const where = { id: Number(id), ...branchQueryFilter(req) };
  return await Branch.findOne({ where, ...extraOptions });
};

const makeSubCatInclude = () => ({
  model: AssetSubCategory,
  as: "subCategory",
  required: false,
  include: [{ model: AssetGroup, as: "group", required: false }],
});

async function updateOrCreate(model, branchId, data) {
  let record = await model.findOne({ where: { branchId } });
  if (!record) record = await model.create({ branchId });
  await record.update(data);
  return record;
}

function deviceCrud(model, includeSubCat = false) {
  return {
    list: asyncHandler(async (req, res) => {
      const { id: branchId } = req.params;
      const options = {
        where: { branchId },
        order: [["id", "ASC"]],
      };

      if (includeSubCat) options.include = [makeSubCatInclude()];

      const rows = await model.findAll(options);
      return sendSuccess(res, rows, "Fetched successfully");
    }),

    create: asyncHandler(async (req, res) => {
      const { id: branchId } = req.params;
      const row = await model.create({ branchId, ...req.body });
      return sendSuccess(res, row, "Created successfully", 201);
    }),

    update: asyncHandler(async (req, res) => {
      const { id: branchId, rowId } = req.params;
      const row = await model.findOne({ where: { id: rowId, branchId } });

      if (!row) return sendError(res, "Record not found", 404);

      await row.update(req.body);
      return sendSuccess(res, row, "Updated successfully");
    }),

    remove: asyncHandler(async (req, res) => {
      const { id: branchId, rowId } = req.params;
      const row = await model.findOne({ where: { id: rowId, branchId } });

      if (!row) return sendError(res, "Record not found", 404);

      await row.destroy();
      return sendSuccess(res, { ok: true }, "Deleted successfully");
    }),
  };
}

exports.getBranches = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const where = branchQueryFilter(req);

  const { count, rows } = await Branch.findAndCountAll({
    where,
    limit,
    offset,
    order: [["id", "ASC"]],
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name", "station_ext_no"],
        required: false,
      },
    ],
  });

  return sendPaginated(res, rows, page, limit, count, "Branches fetched successfully");
});

exports.getAllBranches = asyncHandler(async (req, res) => {
  const rows = await Branch.findAll({
    where: branchQueryFilter(req),
    order: [["id", "ASC"]],
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name", "station_ext_no"],
        required: false,
      },
    ],
  });

  return sendSuccess(res, rows, "Branches fetched successfully");
});

exports.getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await getBranchByIdForUser(req, id, {
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name", "manager_name", "manager_email", "contact"],
        required: false,
      },
      { model: BranchInfra, as: "infra", required: false },
      {
        model: BranchConnectivity,
        as: "connectivity",
        required: false,
        include: [makeSubCatInclude()],
      },
      {
        model: BranchUps,
        as: "ups",
        required: false,
        include: [makeSubCatInclude()],
      },
      {
        model: Inverter,
        as: "inverters",
        required: false,
        include: [makeSubCatInclude()],
      },
      {
        model: BranchOnlineConferenceTools,
        as: "onlineConferenceTools",
        required: false,
        include: [makeSubCatInclude()],
      },
    ],
  });

  if (!branch) return sendError(res, "Branch not found", 404);

  return sendSuccess(res, branch, "Branch fetched successfully");
});

exports.getBranchAssetsSummary = asyncHandler(async (req, res) => {
  const branchId = Number(req.params.id);

  if (!branchId) return sendError(res, "Invalid branch id", 400);

  const branch = await getBranchByIdForUser(req, branchId, {
    attributes: ["id", "branch_code"],
  });

  if (!branch) return sendError(res, "Branch not found", 404);

  const [
    scanners,
    projectors,
    printers,
    desktops,
    qrDesktopComputers,
    laptops,
    panels,
    ipphones,
    servers,
    firewallRouters,
    switches,
    extraMonitors,
    applicationSoftware,
    officeSoftware,
    securitySoftware,
    securitySoftwareInstalled,
    utilitySoftware,
    services,
    licenses,
    windowsOS,
    onlineConferenceTools,
    windowsServers,
    cctvs,
    connectivity,
    ups,
    inverters,
  ] = await Promise.all([
    BranchScanner.count({ where: { branchId } }),
    BranchProjector.count({ where: { branchId } }),
    BranchPrinter.count({ where: { branchId } }),
    BranchDesktop.count({ where: { branchId } }),
    QrDesktopComputer.count({ where: { branchId } }),
    BranchLaptop.count({ where: { branchId } }),
    BranchPanel.count({ where: { branchId } }),
    BranchIpPhone.count({ where: { branchId } }),
    BranchServer.count({ where: { branchId } }),
    BranchFirewallRouter.count({ where: { branchId } }),
    BranchSwitch.count({ where: { branchId } }),
    BranchExtraMonitor.count({ where: { branchId } }),
    BranchApplicationSoftware.count({ where: { branchId } }),
    BranchOfficeSoftware.count({ where: { branchId } }),
    BranchSecuritySoftware.count({ where: { branchId } }),
    BranchSecuritySoftwareInstalled.count({ where: { branchId } }),
    BranchUtilitySoftware.count({ where: { branchId } }),
    BranchServices.count({ where: { branchId } }),
    BranchLicenses.count({ where: { branchId } }),
    BranchWindowsOS.count({ where: { branchId } }),
    BranchOnlineConferenceTools.count({ where: { branchId } }),
    BranchWindowsServers.count({ where: { branchId } }),
    BranchCctv.count({ where: { branchId } }),
    BranchConnectivity.count({ where: { branchId } }),
    BranchUps.count({ where: { branchId } }),
    Inverter.count({ where: { branchId } }),
  ]);

  return sendSuccess(
    res,
    {
      scanners,
      projectors,
      printers,
      desktops,
      qrDesktopComputers,
      laptops,
      panels,
      ipphones,
      servers,
      firewallRouters,
      switches,
      extraMonitors,
      applicationSoftware,
      officeSoftware,
      securitySoftware,
      securitySoftwareInstalled,
      utilitySoftware,
      services,
      licenses,
      windowsOS,
      onlineConferenceTools,
      windowsServers,
      cctvs,
      connectivity,
      ups,
      inverters,
    },
    "Asset summary fetched"
  );
});

exports.getBranchesWithAssets = asyncHandler(async (req, res) => {
  const many = (model, as) => ({
    model,
    as,
    required: false,
    separate: true,
    order: [["id", "ASC"]],
    include: [makeSubCatInclude()],
  });

  const rows = await Branch.findAll({
    where: branchQueryFilter(req),
    order: [["id", "ASC"]],
    include: [
      {
        model: ServiceStation,
        as: "serviceStation",
        attributes: ["id", "name", "manager_name", "manager_email", "contact"],
        required: false,
      },
      { model: BranchInfra, as: "infra", required: false },
      {
        model: BranchConnectivity,
        as: "connectivity",
        required: false,
        separate: true,
        order: [["id", "ASC"]],
        include: [makeSubCatInclude()],
      },
      {
        model: BranchUps,
        as: "ups",
        required: false,
        separate: true,
        order: [["id", "ASC"]],
        include: [makeSubCatInclude()],
      },
      {
        model: Inverter,
        as: "inverters",
        required: false,
        separate: true,
        order: [["id", "ASC"]],
        include: [makeSubCatInclude()],
      },

      many(BranchScanner, "scanners"),
      many(BranchProjector, "projectors"),
      many(BranchPrinter, "printers"),
      many(BranchDesktop, "desktops"),
      many(QrDesktopComputer, "qrDesktopComputers"),
      many(BranchLaptop, "laptops"),
      many(BranchPanel, "panels"),
      many(BranchIpPhone, "ipphones"),
      many(BranchServer, "servers"),
      many(BranchFirewallRouter, "firewallRouters"),
      many(BranchSwitch, "switches"),
      many(BranchExtraMonitor, "extraMonitors"),

      {
        model: BranchCctv,
        as: "cctvs",
        required: false,
        separate: true,
        order: [["cctv_id", "ASC"]],
        include: [
          makeSubCatInclude(),
          {
            model: Camera,
            as: "cameras",
            required: false,
            separate: true,
            order: [["id", "ASC"]],
          },
        ],
      },

      many(BranchApplicationSoftware, "applicationSoftware"),
      many(BranchOfficeSoftware, "officeSoftware"),
      many(BranchSecuritySoftware, "securitySoftware"),
      many(BranchSecuritySoftwareInstalled, "securitySoftwareInstalled"),
      many(BranchUtilitySoftware, "utilitySoftware"),
      many(BranchServices, "services"),
      many(BranchLicenses, "licenses"),
      many(BranchWindowsOS, "windowsOS"),
      many(BranchOnlineConferenceTools, "onlineConferenceTools"),
      many(BranchWindowsServers, "windowsServers"),
    ],
  });

  return sendSuccess(res, rows, "Branches with assets fetched successfully");
});

exports.createBranch = asyncHandler(async (req, res) => {
  const { name, manager_name, gateway, contact, branch_code } = req.body;
  const { isValid, errors } = validate.branchInput(
    name,
    manager_name,
    gateway,
    contact,
    branch_code
  );

  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const exists = await Branch.findOne({ where: { name } });
  if (exists) return sendError(res, "Branch already exists", 409);

  const payload = sanitizeBranchBody(req.body);
  const branch = await Branch.create(payload);

  return sendSuccess(res, branch, "Branch created successfully", 201);
});

exports.updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await getBranchByIdForUser(req, id);

  if (!branch) return sendError(res, "Branch not found", 404);

  const { isValid, errors } = validate.branchInput(
    req.body.name,
    req.body.manager_name,
    req.body.gateway,
    req.body.contact,
    req.body.branch_code
  );

  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const existing = await Branch.findOne({
    where: { name: req.body.name, id: { [Op.ne]: id } },
  });

  if (existing) return sendError(res, "Branch name already exists", 409);

  const payload = sanitizeBranchBody(req.body);

  await branch.update(payload);

  return sendSuccess(res, branch, "Branch updated successfully");
});

exports.deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await getBranchByIdForUser(req, id);

  if (!branch) return sendError(res, "Branch not found", 404);

  await branch.destroy();

  return sendSuccess(res, {}, "Branch deleted successfully");
});

exports.pingDevice = asyncHandler(async (req, res) => {
  const { ip } = req.body;

  if (!ip) return sendError(res, "IP address is required", 400);

  const result = await pingDevice(ip);

  if (!result.success) return sendError(res, "Device not reachable", 200, result);

  return sendSuccess(res, result, "Ping successful");
});

exports.updateInfra = asyncHandler(async (req, res) => {
  const record = await updateOrCreate(BranchInfra, req.params.id, req.body);
  return sendSuccess(res, record, "Infra updated successfully");
});

exports.updateConnectivity = asyncHandler(async (req, res) => {
  const record = await updateOrCreate(BranchConnectivity, req.params.id, req.body);
  return sendSuccess(res, record, "Connectivity updated successfully");
});

exports.updateUps = asyncHandler(async (req, res) => {
  const record = await updateOrCreate(BranchUps, req.params.id, req.body);
  return sendSuccess(res, record, "UPS updated successfully");
});

exports.updateInverter = asyncHandler(async (req, res) => {
  const record = await updateOrCreate(Inverter, req.params.id, req.body);
  return sendSuccess(res, record, "Inverter updated successfully");
});

exports.connectivity = {
  list: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;

    const rows = await BranchConnectivity.findAll({
      where: { branchId },
      order: [["id", "ASC"]],
      include: [makeSubCatInclude()],
    });

    return sendSuccess(res, rows, "Fetched successfully");
  }),

  create: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;
    const row = await BranchConnectivity.create({ branchId, ...req.body });

    return sendSuccess(res, row, "Created successfully", 201);
  }),

  update: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await BranchConnectivity.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.update(req.body);

    return sendSuccess(res, row, "Updated successfully");
  }),

  remove: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await BranchConnectivity.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.destroy();

    return sendSuccess(res, { ok: true }, "Deleted successfully");
  }),
};

exports.ups = {
  list: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;

    const rows = await BranchUps.findAll({
      where: { branchId },
      order: [["id", "ASC"]],
      include: [makeSubCatInclude()],
    });

    return sendSuccess(res, rows, "Fetched successfully");
  }),

  create: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;
    const row = await BranchUps.create({ branchId, ...req.body });

    return sendSuccess(res, row, "Created successfully", 201);
  }),

  update: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await BranchUps.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.update(req.body);

    return sendSuccess(res, row, "Updated successfully");
  }),

  remove: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await BranchUps.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.destroy();

    return sendSuccess(res, { ok: true }, "Deleted successfully");
  }),
};

exports.inverters = {
  list: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;

    const rows = await Inverter.findAll({
      where: { branchId },
      order: [["id", "ASC"]],
      include: [makeSubCatInclude()],
    });

    return sendSuccess(res, rows, "Fetched successfully");
  }),

  create: asyncHandler(async (req, res) => {
    const { id: branchId } = req.params;
    const row = await Inverter.create({ branchId, ...req.body });

    return sendSuccess(res, row, "Created successfully", 201);
  }),

  update: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await Inverter.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.update(req.body);

    return sendSuccess(res, row, "Updated successfully");
  }),

  remove: asyncHandler(async (req, res) => {
    const { id: branchId, rowId } = req.params;
    const row = await Inverter.findOne({ where: { id: rowId, branchId } });

    if (!row) return sendError(res, "Record not found", 404);

    await row.destroy();

    return sendSuccess(res, { ok: true }, "Deleted successfully");
  }),
};

exports.scanners = deviceCrud(BranchScanner);
exports.projectors = deviceCrud(BranchProjector);
exports.printers = deviceCrud(BranchPrinter);
exports.desktops = deviceCrud(BranchDesktop);
exports.qrDesktopComputers = deviceCrud(QrDesktopComputer);
exports.laptops = deviceCrud(BranchLaptop);
exports.panels = deviceCrud(BranchPanel);
exports.ipphones = deviceCrud(BranchIpPhone);
exports.servers = deviceCrud(BranchServer);
exports.firewallRouters = deviceCrud(BranchFirewallRouter);
exports.switches = deviceCrud(BranchSwitch);
exports.extraMonitors = deviceCrud(BranchExtraMonitor);

exports.applicationSoftware = deviceCrud(BranchApplicationSoftware, true);
exports.officeSoftware = deviceCrud(BranchOfficeSoftware, true);
exports.securitySoftware = deviceCrud(BranchSecuritySoftware, true);
exports.securitySoftwareInstalled = deviceCrud(BranchSecuritySoftwareInstalled, true);
exports.utilitySoftware = deviceCrud(BranchUtilitySoftware, true);
exports.services = deviceCrud(BranchServices, true);
exports.licenses = deviceCrud(BranchLicenses, true);
exports.windowsOS = deviceCrud(BranchWindowsOS, true);
exports.onlineConferenceTools = deviceCrud(BranchOnlineConferenceTools, true);
exports.windowsServers = deviceCrud(BranchWindowsServers, true);

exports.cctvs = {
  list: asyncHandler(async (req, res) => {
    const branchId = Number(req.params.id);

    const branch = await Branch.findByPk(branchId);
    if (!branch) return sendError(res, "Branch not found", 404);

    const rows = await BranchCctv.findAll({
      where: { branchId },
      order: [["cctv_id", "ASC"]],
      include: [{ model: Camera, as: "cameras", required: false }],
    });

    return sendSuccess(res, rows, "Fetched successfully");
  }),

  create: asyncHandler(async (req, res) => {
    const branchId = Number(req.params.id);

    const branch = await Branch.findByPk(branchId);
    if (!branch) return sendError(res, "Branch not found", 404);

    const payload = {
      ...req.body,
      branchId,
      assetId: req.body.assetId === "" ? null : req.body.assetId ?? null,
      cctv_record_days: req.body.cctv_record_days === "" ? null : req.body.cctv_record_days,
      channel: req.body.channel === "" ? null : req.body.channel,
      purchase_date: req.body.purchase_date === "" ? null : req.body.purchase_date,
    };

    const row = await BranchCctv.create(payload);

    return sendSuccess(res, row, "Created successfully", 201);
  }),

  update: asyncHandler(async (req, res) => {
    const branchId = Number(req.params.id);

    const branch = await Branch.findByPk(branchId);
    if (!branch) return sendError(res, "Branch not found", 404);

    const row = await BranchCctv.findOne({
      where: { cctv_id: req.params.rowId, branchId },
    });

    if (!row) return sendError(res, "Record not found", 404);

    const payload = {
      ...req.body,
      assetId: req.body.assetId === "" ? null : req.body.assetId ?? null,
      cctv_record_days: req.body.cctv_record_days === "" ? null : req.body.cctv_record_days,
      channel: req.body.channel === "" ? null : req.body.channel,
      purchase_date: req.body.purchase_date === "" ? null : req.body.purchase_date,
    };

    await row.update(payload);

    return sendSuccess(res, row, "Updated successfully");
  }),

  remove: asyncHandler(async (req, res) => {
    const branchId = Number(req.params.id);

    const branch = await Branch.findByPk(branchId);
    if (!branch) return sendError(res, "Branch not found", 404);

    const row = await BranchCctv.findOne({
      where: { cctv_id: req.params.rowId, branchId },
    });

    if (!row) return sendError(res, "Record not found", 404);

    await row.destroy();

    return sendSuccess(res, { ok: true }, "Deleted successfully");
  }),
};

exports.cameras = {
  list: asyncHandler(async (req, res) => {
    const { cctvId } = req.params;

    const cctv = await BranchCctv.findByPk(cctvId, {
      include: [{ model: Camera, as: "cameras" }],
    });

    if (!cctv) return sendError(res, "CCTV not found", 404);

    return sendSuccess(res, cctv.cameras, "Cameras fetched successfully");
  }),

  create: asyncHandler(async (req, res) => {
    const cctvId = Number(req.params.cctvId);

    const cctv = await BranchCctv.findByPk(cctvId);
    if (!cctv) return sendError(res, "CCTV not found", 404);

    const camera = await Camera.create({
      ...req.body,
      cctv_id: cctvId,
    });

    return sendSuccess(res, camera, "Camera created successfully", 201);
  }),

  update: asyncHandler(async (req, res) => {
    const cctvId = Number(req.params.cctvId);
    const cameraId = Number(req.params.cameraId);

    const cctv = await BranchCctv.findByPk(cctvId);
    if (!cctv) return sendError(res, "CCTV not found", 404);

    const camera = await Camera.findOne({
      where: { id: cameraId, cctv_id: cctvId },
    });

    if (!camera) return sendError(res, "Camera not found", 404);

    await camera.update(req.body);

    return sendSuccess(res, camera, "Camera updated successfully");
  }),

  remove: asyncHandler(async (req, res) => {
    const cctvId = Number(req.params.cctvId);
    const cameraId = Number(req.params.cameraId);

    const cctv = await BranchCctv.findByPk(cctvId);
    if (!cctv) return sendError(res, "CCTV not found", 404);

    const camera = await Camera.findOne({
      where: { id: cameraId, cctv_id: cctvId },
    });

    if (!camera) return sendError(res, "Camera not found", 404);

    await camera.destroy();

    return sendSuccess(res, { ok: true }, "Camera deleted successfully");
  }),
};