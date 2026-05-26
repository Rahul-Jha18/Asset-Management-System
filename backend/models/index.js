const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AssetGroupDef = require("./AssetGroup");
const AssetSubCategoryDef = require("./AssetSubCategory");
const AssetTransferDef = require("./AssetTransfer");
const AssetMaintenanceLogDef = require("./AssetMaintenanceLog");
const AssetHistoryDef = require("./AssetHistory");
const NotificationDef = require("./Notification");

const BrandedOption = require("./BrandedOption");
const Department = require("./Department");
const User = require("./User");
const ServiceStation = require("./ServiceStation");
const Request = require("./Request");
const SupportTicket = require("./SupportTicket");

const Branch = require("./Branch");
const { BranchUps, Inverter } = require("./BranchUps");
const BranchConnectivity = require("./BranchConnectivity");

const {
  BranchInfra,
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
} = require("./BranchInfra");

const {
  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchUtilitySoftware,
  BranchServices,
  BranchLicenses,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchWindowsOS,
  BranchOnlineConferenceTools,
  BranchWindowsServers,
} = require("./BranchSoftware");

const isSequelizeModel = (x) =>
  x &&
  (x.prototype instanceof Sequelize.Model ||
    (typeof x === "function" && x.sequelize && typeof x.getTableName === "function"));

const initModel = (def) => {
  if (!def) return null;
  if (isSequelizeModel(def)) return def;
  if (typeof def === "function") return def(sequelize, DataTypes);
  return null;
};

const AssetGroup = initModel(AssetGroupDef);
const AssetSubCategory = initModel(AssetSubCategoryDef);
const AssetTransfer = initModel(AssetTransferDef);
const AssetMaintenanceLog = initModel(AssetMaintenanceLogDef);
const AssetHistory = initModel(AssetHistoryDef);
const Notification = initModel(NotificationDef);

const db = {
  sequelize,
  Sequelize,

  AssetGroup,
  AssetSubCategory,
  AssetTransfer,
  AssetMaintenanceLog,
  AssetHistory,
  Notification,

  BrandedOption,
  Department,
  User,
  ServiceStation,
  Request,
  SupportTicket,

  Branch,
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
  BranchUtilitySoftware,
  BranchServices,
  BranchLicenses,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchWindowsOS,
  BranchOnlineConferenceTools,
  BranchWindowsServers,
};

if (ServiceStation && Branch && !Branch.associations?.serviceStation) {
  Branch.belongsTo(ServiceStation, { foreignKey: "service_station_id", as: "serviceStation" });
}

if (ServiceStation && Branch && !ServiceStation.associations?.branches) {
  ServiceStation.hasMany(Branch, { foreignKey: "service_station_id", as: "branches" });
}

if (ServiceStation && User && !User.associations?.serviceStation) {
  User.belongsTo(ServiceStation, { foreignKey: "service_station_id", as: "serviceStation" });
}

if (ServiceStation && User && !ServiceStation.associations?.users) {
  ServiceStation.hasMany(User, { foreignKey: "service_station_id", as: "users" });
}

if (Branch && BranchInfra && !Branch.associations?.infra) {
  Branch.hasOne(BranchInfra, { foreignKey: "branchId", as: "infra" });
  BranchInfra.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

if (Branch && BranchConnectivity && !Branch.associations?.connectivity) {
  Branch.hasMany(BranchConnectivity, { foreignKey: "branchId", as: "connectivity" });
  BranchConnectivity.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

if (Branch && BranchUps && !Branch.associations?.ups) {
  Branch.hasMany(BranchUps, { foreignKey: "branchId", as: "ups" });
  BranchUps.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

if (Branch && Inverter && !Branch.associations?.inverters) {
  Branch.hasMany(Inverter, { foreignKey: "branchId", as: "inverters" });
  Inverter.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

const ensureHasMany = (parent, child, as) => {
  if (!parent || !child) return;

  if (!parent.associations?.[as]) {
    parent.hasMany(child, { foreignKey: "branchId", as });
    child.belongsTo(parent, { foreignKey: "branchId", as: "branch" });
  }
};

ensureHasMany(Branch, BranchProjector, "projectors");
ensureHasMany(Branch, BranchScanner, "scanners");
ensureHasMany(Branch, BranchPrinter, "printers");
ensureHasMany(Branch, BranchDesktop, "desktops");
ensureHasMany(Branch, QrDesktopComputer, "qrDesktopComputers");
ensureHasMany(Branch, BranchLaptop, "laptops");
ensureHasMany(Branch, BranchPanel, "panels");
ensureHasMany(Branch, BranchIpPhone, "ipphones");
ensureHasMany(Branch, BranchServer, "servers");
ensureHasMany(Branch, BranchFirewallRouter, "firewallRouters");
ensureHasMany(Branch, BranchSwitch, "switches");
ensureHasMany(Branch, BranchExtraMonitor, "extraMonitors");

if (Branch && BranchCctv && !Branch.associations?.cctvs) {
  Branch.hasMany(BranchCctv, { foreignKey: "branchId", as: "cctvs" });
  BranchCctv.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

if (BranchCctv && Camera && !BranchCctv.associations?.cameras) {
  BranchCctv.hasMany(Camera, {
    foreignKey: "cctv_id",
    sourceKey: "cctv_id",
    as: "cameras",
  });

  Camera.belongsTo(BranchCctv, {
    foreignKey: "cctv_id",
    targetKey: "cctv_id",
    as: "cctv",
  });
}

ensureHasMany(Branch, BranchApplicationSoftware, "applicationSoftware");
ensureHasMany(Branch, BranchOfficeSoftware, "officeSoftware");
ensureHasMany(Branch, BranchSecuritySoftware, "securitySoftware");
ensureHasMany(Branch, BranchSecuritySoftwareInstalled, "securitySoftwareInstalled");
ensureHasMany(Branch, BranchUtilitySoftware, "utilitySoftware");
ensureHasMany(Branch, BranchServices, "services");
ensureHasMany(Branch, BranchLicenses, "licenses");
ensureHasMany(Branch, BranchWindowsOS, "windowsOS");
ensureHasMany(Branch, BranchOnlineConferenceTools, "onlineConferenceTools");
ensureHasMany(Branch, BranchWindowsServers, "windowsServers");

if (AssetTransfer && Branch && !AssetTransfer.associations?.fromBranch) {
  AssetTransfer.belongsTo(Branch, { foreignKey: "fromBranchId", as: "fromBranch" });
}

if (AssetTransfer && Branch && !AssetTransfer.associations?.toBranch) {
  AssetTransfer.belongsTo(Branch, { foreignKey: "toBranchId", as: "toBranch" });
}

if (AssetGroup && AssetSubCategory && !AssetSubCategory.associations?.group) {
  AssetSubCategory.belongsTo(AssetGroup, {
    foreignKey: "groupId",
    targetKey: "id",
    as: "group",
  });
}

if (AssetGroup && AssetSubCategory && !AssetGroup.associations?.subCategories) {
  AssetGroup.hasMany(AssetSubCategory, {
    foreignKey: "groupId",
    sourceKey: "id",
    as: "subCategories",
  });
}

const attachSubCategory = (Model) => {
  if (!Model || !AssetSubCategory) return;
  if (Model.associations?.subCategory) return;

  Model.belongsTo(AssetSubCategory, {
    foreignKey: "sub_category_code",
    targetKey: "code",
    as: "subCategory",
  });
};

[
  BranchLaptop,
  BranchDesktop,
  QrDesktopComputer,
  BranchPrinter,
  BranchScanner,
  BranchProjector,
  BranchUps,
  Inverter,
  BranchCctv,
  BranchPanel,
  BranchIpPhone,
  BranchConnectivity,
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
].forEach(attachSubCategory);

if (AssetMaintenanceLog && Branch && !AssetMaintenanceLog.associations?.branch) {
  AssetMaintenanceLog.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
}

if (AssetMaintenanceLog && Branch && !Branch.associations?.maintenanceLogs) {
  Branch.hasMany(AssetMaintenanceLog, { foreignKey: "branchId", as: "maintenanceLogs" });
}

if (Notification && User && !Notification.associations?.user) {
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
}

if (Notification && User && !User.associations?.notifications) {
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
}

module.exports = db;