const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Branch = require("./Branch");

const BranchInfra = sequelize.define(
  "BranchInfra",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },

    total_staff: { type: DataTypes.INTEGER },
    connectivity_status: { type: DataTypes.STRING },
    connectivity_wlink: { type: DataTypes.STRING },
    connectivity_lan_ip: { type: DataTypes.STRING },
    connectivity_lan_switch: { type: DataTypes.STRING },
    connectivity_network: { type: DataTypes.STRING },
    connectivity_wifi: { type: DataTypes.STRING },
    biometrics_ip: { type: DataTypes.STRING },

    // UPS (stored inside infra)
    ups_total_no: { type: DataTypes.INTEGER },
    ups_model: { type: DataTypes.STRING },
    ups_backup_time: { type: DataTypes.STRING },
    ups_installer: { type: DataTypes.STRING },
    ups_rating: { type: DataTypes.STRING },
    battery_rating: { type: DataTypes.STRING },
    ups_purchase_year: { type: DataTypes.INTEGER },
  },
  {
    tableName: "branch_infra",
    timestamps: true,
  }
);

const BranchScanner = sequelize.define(
  "BranchScanner",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    scanner_name: { type: DataTypes.STRING },
    scanner_model: { type: DataTypes.STRING },
    scanner_number: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
  },
  { tableName: "branch_scanners", timestamps: true }
);

const BranchProjector = sequelize.define(
  "BranchProjector",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    projector_name: { type: DataTypes.STRING },
    projector_model: { type: DataTypes.STRING },
    projector_purchase_date: { type: DataTypes.DATE },
    projector_status: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
  },
  { tableName: "branch_projectors", timestamps: true }
);

const BranchPrinter = sequelize.define(
  "BranchPrinter",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    printer_name: { type: DataTypes.STRING, allowNull: true },
    printer_model: { type: DataTypes.STRING, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    printer_type: { type: DataTypes.ENUM("USB", "Network"), defaultValue: "USB" },
    printer_status: { type: DataTypes.ENUM("Active", "Down"), defaultValue: "Active" },
  },
  { tableName: "branch_printers", timestamps: true }
);

const BranchDesktop = sequelize.define(
  "BranchDesktop",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    desktop_total_no: { type: DataTypes.INTEGER },
    desktop_brand: { type: DataTypes.STRING },
    desktop_ram: { type: DataTypes.STRING },
    desktop_ssd: { type: DataTypes.STRING },
    desktop_purchase_date: { type: DataTypes.DATE },
    desktop_fiscal_year: { type: DataTypes.STRING },
    desktop_processor: { type: DataTypes.STRING },
    desktop_domain: { type: DataTypes.STRING },
    desktop_ids: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
  },
  { tableName: "branch_desktops", timestamps: true }
);

const BranchLaptop = sequelize.define(
  "BranchLaptop",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    laptop_total_no: { type: DataTypes.INTEGER },
    laptop_brand: { type: DataTypes.STRING },
    laptop_ram: { type: DataTypes.STRING },
    laptop_ssd: { type: DataTypes.STRING },
    laptop_processor: { type: DataTypes.STRING },
    laptop_domain: { type: DataTypes.STRING },
    laptop_user: { type: DataTypes.STRING },
    laptop_purchase_date: { type: DataTypes.DATE },
    laptop_fiscal_year: { type: DataTypes.STRING },
    laptop_ids: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
  },
  { tableName: "branch_laptops", timestamps: true }
);

const BranchCctv = sequelize.define(
  "BranchCctv",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    cctv_total_no: { type: DataTypes.INTEGER },
    cctv_nvr_ip: { type: DataTypes.STRING },
    cctv_camera_ip: { type: DataTypes.STRING },
    cctv_installed_year: { type: DataTypes.INTEGER },
    cctv_record_days: { type: DataTypes.INTEGER },
    cctv_nvr_details: { type: DataTypes.TEXT },
  },
  { tableName: "branch_cctv", timestamps: true }
);

const BranchPanel = sequelize.define(
  "BranchPanel",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    panel_ip: { type: DataTypes.STRING },
    panel_name: { type: DataTypes.STRING },
    panel_brand: { type: DataTypes.STRING },
    panel_user: { type: DataTypes.STRING },
    panel_purchase_year: { type: DataTypes.INTEGER },
    panel_status: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    remarks: { type: DataTypes.TEXT },
  },
  { tableName: "branch_panels", timestamps: true }
);

const BranchIpPhone = sequelize.define(
  "BranchIpPhone",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId: { type: DataTypes.INTEGER, allowNull: false },
    ip_telephone_status: { type: DataTypes.STRING },
    ip_telephone_ip: { type: DataTypes.STRING },
    ip_telephone_ext_no: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
  },
  { tableName: "branch_ip_phones", timestamps: true }
);

// Associations
Branch.hasOne(BranchInfra, { foreignKey: "branchId", as: "infra" });
BranchInfra.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

Branch.hasMany(BranchScanner, { foreignKey: "branchId", as: "scanners" });
Branch.hasMany(BranchProjector, { foreignKey: "branchId", as: "projectors" });
Branch.hasMany(BranchPrinter, { foreignKey: "branchId", as: "printers" });
Branch.hasMany(BranchDesktop, { foreignKey: "branchId", as: "desktops" });
Branch.hasMany(BranchLaptop, { foreignKey: "branchId", as: "laptops" });
Branch.hasMany(BranchCctv, { foreignKey: "branchId", as: "cctvs" });
Branch.hasMany(BranchPanel, { foreignKey: "branchId", as: "panels" });
Branch.hasMany(BranchIpPhone, { foreignKey: "branchId", as: "ipphones" });

module.exports = {
  BranchInfra,
  BranchScanner,
  BranchProjector,
  BranchPrinter,
  BranchDesktop,
  BranchLaptop,
  BranchCctv,
  BranchPanel,
  BranchIpPhone,
};
