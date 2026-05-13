const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();

const branchController = require("../controllers/branchContoller");
const db = require("../models");
const Branch = db.Branch;

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin, adminOnly } = require("../middleware/adminMiddleware");

const normalizeRole = (role) =>
  String(role || "").trim().toLowerCase().replace(/[_\s-]/g, "");

const authorizeBranchAccess = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const branchId = Number(id);

  if (!branchId) return res.status(404).json({ message: "Branch not found" });

  if (normalizeRole(req.user?.role) === "subadmin") {
    const stationId = Number(req.user?.service_station_id);

    if (!stationId) return res.status(404).json({ message: "Branch not found" });

    const branch = await Branch.findOne({
      where: { id: branchId, service_station_id: stationId },
    });

    if (!branch) return res.status(404).json({ message: "Branch not found" });

    req.branch = branch;
    return next();
  }

  const branch = await Branch.findByPk(branchId);

  if (!branch) return res.status(404).json({ message: "Branch not found" });

  req.branch = branch;
  next();
});

router.get("/with-assets/all", protect, branchController.getBranchesWithAssets);
router.get("/all", protect, branchController.getAllBranches);

router.use("/:id", protect, authorizeBranchAccess);

router.get("/:id/assets-summary", protect, branchController.getBranchAssetsSummary);
router.post("/ping", protect, branchController.pingDevice);

router.get("/", protect, branchController.getBranches);
router.get("/:id", protect, branchController.getBranchById);

router.post("/", protect, adminOrSubadmin, branchController.createBranch);
router.put("/:id", protect, adminOrSubadmin, branchController.updateBranch);
router.delete("/:id", protect, adminOnly, branchController.deleteBranch);

router.put("/:id/infra", protect, adminOrSubadmin, branchController.updateInfra);

// Connectivity
router.get("/:id/connectivity", protect, branchController.connectivity.list);
router.post("/:id/connectivity", protect, adminOrSubadmin, branchController.connectivity.create);
router.put("/:id/connectivity/:rowId", protect, adminOrSubadmin, branchController.connectivity.update);
router.delete("/:id/connectivity/:rowId", protect, adminOrSubadmin, branchController.connectivity.remove);

// legacy
router.put("/:id/connectivity", protect, adminOrSubadmin, branchController.updateConnectivity);

// UPS
router.get("/:id/ups", protect, branchController.ups.list);
router.post("/:id/ups", protect, adminOrSubadmin, branchController.ups.create);
router.put("/:id/ups/:rowId", protect, adminOrSubadmin, branchController.ups.update);
router.delete("/:id/ups/:rowId", protect, adminOrSubadmin, branchController.ups.remove);

// legacy
router.put("/:id/ups", protect, adminOrSubadmin, branchController.updateUps);

// Inverter
router.get("/:id/inverters", protect, branchController.inverters.list);
router.post("/:id/inverters", protect, adminOrSubadmin, branchController.inverters.create);
router.put("/:id/inverters/:rowId", protect, adminOrSubadmin, branchController.inverters.update);
router.delete("/:id/inverters/:rowId", protect, adminOrSubadmin, branchController.inverters.remove);

// legacy
router.put("/:id/inverters", protect, adminOrSubadmin, branchController.updateInverter);

router.get("/:id/scanners", protect, branchController.scanners.list);
router.post("/:id/scanners", protect, adminOrSubadmin, branchController.scanners.create);
router.put("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.update);
router.delete("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.remove);

router.get("/:id/projectors", protect, branchController.projectors.list);
router.post("/:id/projectors", protect, adminOrSubadmin, branchController.projectors.create);
router.put("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.update);
router.delete("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.remove);

router.get("/:id/printers", protect, branchController.printers.list);
router.post("/:id/printers", protect, adminOrSubadmin, branchController.printers.create);
router.put("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.update);
router.delete("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.remove);

router.get("/:id/desktops", protect, branchController.desktops.list);
router.post("/:id/desktops", protect, adminOrSubadmin, branchController.desktops.create);
router.put("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.update);
router.delete("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.remove);

// QR Desktop Computer
router.get("/:id/qr-desktop-computers", protect, branchController.qrDesktopComputers.list);
router.post("/:id/qr-desktop-computers", protect, adminOrSubadmin, branchController.qrDesktopComputers.create);
router.put("/:id/qr-desktop-computers/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.update);
router.delete("/:id/qr-desktop-computers/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.remove);

// QR Desktop Computer aliases
router.get("/:id/qr_desktop_computer", protect, branchController.qrDesktopComputers.list);
router.post("/:id/qr_desktop_computer", protect, adminOrSubadmin, branchController.qrDesktopComputers.create);
router.put("/:id/qr_desktop_computer/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.update);
router.delete("/:id/qr_desktop_computer/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.remove);

router.get("/:id/qr_desktop_computers", protect, branchController.qrDesktopComputers.list);
router.post("/:id/qr_desktop_computers", protect, adminOrSubadmin, branchController.qrDesktopComputers.create);
router.put("/:id/qr_desktop_computers/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.update);
router.delete("/:id/qr_desktop_computers/:rowId", protect, adminOrSubadmin, branchController.qrDesktopComputers.remove);

router.get("/:id/laptops", protect, branchController.laptops.list);
router.post("/:id/laptops", protect, adminOrSubadmin, branchController.laptops.create);
router.put("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.update);
router.delete("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.remove);

router.get("/:id/cctvs", protect, branchController.cctvs.list);
router.post("/:id/cctvs", protect, adminOrSubadmin, branchController.cctvs.create);
router.put("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.update);
router.delete("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.remove);

router.get("/cctvs/:cctvId/cameras", protect, branchController.cameras.list);
router.post("/cctvs/:cctvId/cameras", protect, adminOrSubadmin, branchController.cameras.create);
router.put("/cctvs/:cctvId/cameras/:cameraId", protect, adminOrSubadmin, branchController.cameras.update);
router.delete("/cctvs/:cctvId/cameras/:cameraId", protect, adminOrSubadmin, branchController.cameras.remove);

router.get("/:id/panels", protect, branchController.panels.list);
router.post("/:id/panels", protect, adminOrSubadmin, branchController.panels.create);
router.put("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.update);
router.delete("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.remove);

router.get("/:id/ipphones", protect, branchController.ipphones.list);
router.post("/:id/ipphones", protect, adminOrSubadmin, branchController.ipphones.create);
router.put("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.update);
router.delete("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.remove);

router.get("/:id/servers", protect, branchController.servers.list);
router.post("/:id/servers", protect, adminOrSubadmin, branchController.servers.create);
router.put("/:id/servers/:rowId", protect, adminOrSubadmin, branchController.servers.update);
router.delete("/:id/servers/:rowId", protect, adminOrSubadmin, branchController.servers.remove);

router.get("/:id/firewall-routers", protect, branchController.firewallRouters.list);
router.post("/:id/firewall-routers", protect, adminOrSubadmin, branchController.firewallRouters.create);
router.put("/:id/firewall-routers/:rowId", protect, adminOrSubadmin, branchController.firewallRouters.update);
router.delete("/:id/firewall-routers/:rowId", protect, adminOrSubadmin, branchController.firewallRouters.remove);

router.get("/:id/switches", protect, branchController.switches.list);
router.post("/:id/switches", protect, adminOrSubadmin, branchController.switches.create);
router.put("/:id/switches/:rowId", protect, adminOrSubadmin, branchController.switches.update);
router.delete("/:id/switches/:rowId", protect, adminOrSubadmin, branchController.switches.remove);

router.get("/:id/extra-monitors", protect, branchController.extraMonitors.list);
router.post("/:id/extra-monitors", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra-monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra-monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

// aliases
router.get("/:id/extra-monitor", protect, branchController.extraMonitors.list);
router.post("/:id/extra-monitor", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra-monitor/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra-monitor/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

router.get("/:id/extra_monitors", protect, branchController.extraMonitors.list);
router.post("/:id/extra_monitors", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra_monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra_monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

router.get("/:id/application-software", protect, branchController.applicationSoftware.list);
router.post("/:id/application-software", protect, adminOrSubadmin, branchController.applicationSoftware.create);
router.put("/:id/application-software/:rowId", protect, adminOrSubadmin, branchController.applicationSoftware.update);
router.delete("/:id/application-software/:rowId", protect, adminOrSubadmin, branchController.applicationSoftware.remove);

router.get("/:id/office-software", protect, branchController.officeSoftware.list);
router.post("/:id/office-software", protect, adminOrSubadmin, branchController.officeSoftware.create);
router.put("/:id/office-software/:rowId", protect, adminOrSubadmin, branchController.officeSoftware.update);
router.delete("/:id/office-software/:rowId", protect, adminOrSubadmin, branchController.officeSoftware.remove);

router.get("/:id/security-software", protect, branchController.securitySoftware.list);
router.post("/:id/security-software", protect, adminOrSubadmin, branchController.securitySoftware.create);
router.put("/:id/security-software/:rowId", protect, adminOrSubadmin, branchController.securitySoftware.update);
router.delete("/:id/security-software/:rowId", protect, adminOrSubadmin, branchController.securitySoftware.remove);

router.get("/:id/security-software-installed", protect, branchController.securitySoftwareInstalled.list);
router.post("/:id/security-software-installed", protect, adminOrSubadmin, branchController.securitySoftwareInstalled.create);
router.put("/:id/security-software-installed/:rowId", protect, adminOrSubadmin, branchController.securitySoftwareInstalled.update);
router.delete("/:id/security-software-installed/:rowId", protect, adminOrSubadmin, branchController.securitySoftwareInstalled.remove);

router.get("/:id/utility-software", protect, branchController.utilitySoftware.list);
router.post("/:id/utility-software", protect, adminOrSubadmin, branchController.utilitySoftware.create);
router.put("/:id/utility-software/:rowId", protect, adminOrSubadmin, branchController.utilitySoftware.update);
router.delete("/:id/utility-software/:rowId", protect, adminOrSubadmin, branchController.utilitySoftware.remove);

router.get("/:id/services", protect, branchController.services.list);
router.post("/:id/services", protect, adminOrSubadmin, branchController.services.create);
router.put("/:id/services/:rowId", protect, adminOrSubadmin, branchController.services.update);
router.delete("/:id/services/:rowId", protect, adminOrSubadmin, branchController.services.remove);

router.get("/:id/licenses", protect, branchController.licenses.list);
router.post("/:id/licenses", protect, adminOrSubadmin, branchController.licenses.create);
router.put("/:id/licenses/:rowId", protect, adminOrSubadmin, branchController.licenses.update);
router.delete("/:id/licenses/:rowId", protect, adminOrSubadmin, branchController.licenses.remove);

router.get("/:id/windows-os", protect, branchController.windowsOS.list);
router.post("/:id/windows-os", protect, adminOrSubadmin, branchController.windowsOS.create);
router.put("/:id/windows-os/:rowId", protect, adminOrSubadmin, branchController.windowsOS.update);
router.delete("/:id/windows-os/:rowId", protect, adminOrSubadmin, branchController.windowsOS.remove);

router.get("/:id/windows-servers", protect, branchController.windowsServers.list);
router.post("/:id/windows-servers", protect, adminOrSubadmin, branchController.windowsServers.create);
router.put("/:id/windows-servers/:rowId", protect, adminOrSubadmin, branchController.windowsServers.update);
router.delete("/:id/windows-servers/:rowId", protect, adminOrSubadmin, branchController.windowsServers.remove);

router.get("/:id/online-conference-tools", protect, branchController.onlineConferenceTools.list);
router.post("/:id/online-conference-tools", protect, adminOrSubadmin, branchController.onlineConferenceTools.create);
router.put("/:id/online-conference-tools/:rowId", protect, adminOrSubadmin, branchController.onlineConferenceTools.update);
router.delete("/:id/online-conference-tools/:rowId", protect, adminOrSubadmin, branchController.onlineConferenceTools.remove);

module.exports = router;