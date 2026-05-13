// backend/models/BranchInfra.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/* ─── Infrastructure ─── */
const BranchInfra = sequelize.define(
  "BranchInfra",
  {
    id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId:        { type: DataTypes.INTEGER, allowNull: false, unique: true },
    total_staff:     { type: DataTypes.INTEGER },
    biometrics_status: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
      defaultValue: "No",
    },
  },
  { tableName: "branch_infra", timestamps: true }
);

/* ─── Connectivity (MULTI per branch — unique constraint removed) ─── */
const BranchConnectivity = sequelize.define(
  "BranchConnectivity",
  {
    id:                      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // NOTE: unique removed → multiple connectivity records per branch are now allowed
    branchId:                { type: DataTypes.INTEGER, allowNull: false },
    assetId:                 { type: DataTypes.STRING(100), allowNull: true },
    sub_category_code:       { type: DataTypes.STRING(5),   allowNull: true },
    connectivity_status:     { type: DataTypes.STRING(20),  allowNull: true },
    connectivity_network:    { type: DataTypes.STRING(100), allowNull: true },
    connectivity_lan_ip:     { type: DataTypes.STRING(50),  allowNull: true },
    connectivity_wlink:      { type: DataTypes.STRING(150), allowNull: true },
    connectivity_lan_switch: { type: DataTypes.STRING(100), allowNull: true },
    connectivity_wifi:       { type: DataTypes.STRING(100), allowNull: true },
    installed_year:          { type: DataTypes.INTEGER,     allowNull: true },
    location:                { type: DataTypes.STRING(150), allowNull: true },
    remarks:                 { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "branch_connectivity", timestamps: true }
);

/* ─── UPS (MULTI per branch — unique constraint removed, new fields added) ─── */
const BranchUps = sequelize.define(
  "BranchUps",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // NOTE: unique removed → multiple UPS records per branch are now allowed
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    sub_category_code: { type: DataTypes.STRING(5),   allowNull: true },
    ups_model:         { type: DataTypes.STRING(100), allowNull: true },
    ups_backup_time:   { type: DataTypes.STRING(50),  allowNull: true },
    ups_installer:     { type: DataTypes.STRING(100), allowNull: true },
    ups_rating:        { type: DataTypes.STRING(50),  allowNull: true },
    battery_rating:    { type: DataTypes.STRING(50),  allowNull: true },
    ups_purchase_year: { type: DataTypes.INTEGER,     allowNull: true },
    ups_status:        { type: DataTypes.STRING(20),  allowNull: true },
    // ── new fields ──────────────────────────────────────────────────────────
    assigned_user:     { type: DataTypes.STRING(255), allowNull: true },
    name:              { type: DataTypes.STRING(150), allowNull: true },
    location:          { type: DataTypes.STRING(150), allowNull: true },
    ip_address:        { type: DataTypes.STRING(50),  allowNull: true },
    warranty_years:    { type: DataTypes.INTEGER,     allowNull: true },
    expiry_date:       { type: DataTypes.DATEONLY,    allowNull: true },
    // ────────────────────────────────────────────────────────────────────────
    remarks:           { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "branch_ups", timestamps: true }
);

/* ─── Scanner ─── */
const BranchScanner = sequelize.define(
  "BranchScanner",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5),   allowNull: true },
    scanner_name:      { type: DataTypes.STRING,      allowNull: true },
    scanner_model:     { type: DataTypes.STRING,      allowNull: true },
    assigned_user:     { type: DataTypes.STRING,      allowNull: true },
    location:          { type: DataTypes.STRING(150), allowNull: true },
    remarks:           { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "branch_scanners", timestamps: true }
);

/* ─── Projector ─── */
const BranchProjector = sequelize.define(
  "BranchProjector",
  {
    id:                     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:                { type: DataTypes.STRING(100), allowNull: true },
    branchId:               { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code:      { type: DataTypes.STRING(5),  allowNull: true },
    projector_name:         { type: DataTypes.STRING, allowNull: true },
    projector_model:        { type: DataTypes.STRING, allowNull: true },
    projector_purchase_date:{ type: DataTypes.DATE,   allowNull: true },
    projector_status:       { type: DataTypes.STRING, allowNull: true },
    location:               { type: DataTypes.STRING, allowNull: true },
    warranty_years:         { type: DataTypes.INTEGER, allowNull: true, defaultValue: 3 },
    remarks:                { type: DataTypes.TEXT,   allowNull: true },
  },
  { tableName: "branch_projectors", timestamps: true }
);

/* ─── Printer ─── */
const BranchPrinter = sequelize.define(
  "BranchPrinter",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5),  allowNull: true },
    assigned_user:     { type: DataTypes.STRING, allowNull: true },
    name:              { type: DataTypes.STRING, allowNull: true },
    printer_name:      { type: DataTypes.STRING, allowNull: true },
    printer_model:     { type: DataTypes.STRING, allowNull: true },
    printer_type:      { type: DataTypes.STRING(50), allowNull: true },
    printer_status:    { type: DataTypes.ENUM("Active","Down"), defaultValue: "Active" },
    location:          { type: DataTypes.STRING, allowNull: true },
    ip_address:        { type: DataTypes.STRING, allowNull: true },
    remarks:           { type: DataTypes.TEXT,   allowNull: true },
  },
  { tableName: "branch_printers", timestamps: true }
);

/* ─── Desktop ─── */
const BranchDesktop = sequelize.define(
  "BranchDesktop",
  {
    id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sub_category_code:    { type: DataTypes.STRING(5),   allowNull: true },
    branchId:             { type: DataTypes.INTEGER, allowNull: false },
    assetId:              { type: DataTypes.STRING(100), allowNull: true },
    desktop_ids:          { type: DataTypes.TEXT,        allowNull: true },
    desktop_brand:        { type: DataTypes.STRING(100), allowNull: true },
    desktop_ram:          { type: DataTypes.STRING(50),  allowNull: true },
    desktop_ssd:          { type: DataTypes.STRING(50),  allowNull: true },
    desktop_processor:    { type: DataTypes.STRING(100), allowNull: true },
    window_version:       { type: DataTypes.STRING(100), allowNull: true },
    window_gen:           { type: DataTypes.STRING(20),  allowNull: true },
    system_model:         { type: DataTypes.STRING(150), allowNull: true },
    userName:             { type: DataTypes.STRING(100), allowNull: true },
    location:             { type: DataTypes.STRING(150), allowNull: true },
    ip_address:           { type: DataTypes.STRING(50),  allowNull: true },
    status:               { type: DataTypes.STRING(20),  allowNull: true },
    expiry_date:          { type: DataTypes.DATEONLY,    allowNull: true },
    monitor_name:         { type: DataTypes.STRING(100), allowNull: true },
    monitor_asset_code:   { type: DataTypes.STRING(100), allowNull: true },
    monitor_brand:        { type: DataTypes.STRING(100), allowNull: true },
    monitor_size:         { type: DataTypes.STRING(20),  allowNull: true },
    monitor_location:     { type: DataTypes.STRING(100), allowNull: true },
    monitor_status:       { type: DataTypes.STRING(50),  allowNull: true },
    remarks:              { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "branch_desktops", timestamps: true }
);

/* ─── QR Desktop Computer ─── */
const QrDesktopComputer = sequelize.define(
  "QrDesktopComputer",
  {
    id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sub_category_code:    { type: DataTypes.STRING(5),   allowNull: true },
    branchId:             { type: DataTypes.INTEGER, allowNull: false },
    assetId:              { type: DataTypes.STRING(100), allowNull: true },
    desktop_ids:          { type: DataTypes.TEXT,        allowNull: true },
    desktop_brand:        { type: DataTypes.STRING(100), allowNull: true },
    desktop_ram:          { type: DataTypes.STRING(50),  allowNull: true },
    desktop_ssd:          { type: DataTypes.STRING(50),  allowNull: true },
    desktop_processor:    { type: DataTypes.STRING(100), allowNull: true },
    window_version:       { type: DataTypes.STRING(100), allowNull: true },
    window_gen:           { type: DataTypes.STRING(20),  allowNull: true },
    system_model:         { type: DataTypes.STRING(150), allowNull: true },
    userName:             { type: DataTypes.STRING(100), allowNull: true },
    location:             { type: DataTypes.STRING(150), allowNull: true },
    ip_address:           { type: DataTypes.STRING(50),  allowNull: true },
    status:               { type: DataTypes.STRING(20),  allowNull: true },
    expiry_date:          { type: DataTypes.DATEONLY,    allowNull: true },
    monitor_name:         { type: DataTypes.STRING(100), allowNull: true },
    monitor_asset_code:   { type: DataTypes.STRING(100), allowNull: true },
    monitor_brand:        { type: DataTypes.STRING(100), allowNull: true },
    monitor_size:         { type: DataTypes.STRING(20),  allowNull: true },
    monitor_location:     { type: DataTypes.STRING(100), allowNull: true },
    monitor_status:       { type: DataTypes.STRING(50),  allowNull: true },
    remarks:              { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "qr_desktop_computer", timestamps: true }
);

/* ─── Laptop ─── */
const BranchLaptop = sequelize.define(
  "BranchLaptop",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    laptop_brand:      { type: DataTypes.STRING, allowNull: true },
    name:              { type: DataTypes.STRING, allowNull: true },
    laptop_user:       { type: DataTypes.STRING, allowNull: true },
    laptop_ram:        { type: DataTypes.STRING, allowNull: true },
    laptop_ssd:        { type: DataTypes.STRING, allowNull: true },
    laptop_processor:  { type: DataTypes.STRING, allowNull: true },
    location:          { type: DataTypes.STRING, allowNull: true },
    ip_address:        { type: DataTypes.STRING, allowNull: true },
    status:            { type: DataTypes.STRING(20), allowNull: true },
    remarks:           { type: DataTypes.TEXT,   allowNull: true },
  },
  { tableName: "branch_laptops", timestamps: true }
);

/* ─── CCTV ─── */
const BranchCctv = sequelize.define(
  "BranchCctv",
  {
    cctv_id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    assetId:           { type: DataTypes.STRING(50), allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    cctv_brand:        { type: DataTypes.STRING, allowNull: true },
    cctv_nvr_ip:       { type: DataTypes.STRING, allowNull: true },
    cctv_record_days:  { type: DataTypes.INTEGER, allowNull: true },
    capacity:          { type: DataTypes.STRING(50), allowNull: true },
    channel:           { type: DataTypes.INTEGER, allowNull: true },
    vendor:            { type: DataTypes.STRING(150), allowNull: true },
    purchase_date:     { type: DataTypes.DATEONLY, allowNull: true },
    remarks:           { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "branch_cctv", timestamps: true }
);

/* ─── Camera (child of CCTV) ─── */
const Camera = sequelize.define(
  "Camera",
  {
    id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cctv_asset_id: { type: DataTypes.STRING(50), allowNull: false },
    camera_model:  { type: DataTypes.STRING, allowNull: true },
    location:      { type: DataTypes.STRING, allowNull: true },
    cctv_status:   { type: DataTypes.ENUM("On","Off","Repair"), defaultValue: "On" },
    remarks:       { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "camera", timestamps: false }
);

/* ─── Panel ─── */
const BranchPanel = sequelize.define(
  "BranchPanel",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5), allowNull: true },
    panel_name:        { type: DataTypes.STRING, allowNull: true },
    panel_brand:       { type: DataTypes.STRING, allowNull: true },
    panel_user:        { type: DataTypes.STRING, allowNull: true },
    panel_ip:          { type: DataTypes.STRING, allowNull: true },
    panel_purchase_year:{ type: DataTypes.INTEGER, allowNull: true },
    panel_status:      { type: DataTypes.STRING, allowNull: true },
    location:          { type: DataTypes.STRING, allowNull: true },
    warranty_years:    { type: DataTypes.INTEGER, allowNull: true, defaultValue: 2 },
    remarks:           { type: DataTypes.TEXT,   allowNull: true },
  },
  { tableName: "branch_panels", timestamps: true }
);

/* ─── IP Phone ─── */
const BranchIpPhone = sequelize.define(
  "BranchIpPhone",
  {
    id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:              { type: DataTypes.STRING(100), allowNull: true },
    branchId:             { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code:    { type: DataTypes.STRING(5),  allowNull: true },
    ip_telephone_ext_no:  { type: DataTypes.STRING, allowNull: true },
    ip_telephone_ip:      { type: DataTypes.STRING, allowNull: true },
    ip_telephone_status:  { type: DataTypes.STRING, allowNull: true },
    assigned_user:        { type: DataTypes.STRING, allowNull: true },
    model:                { type: DataTypes.STRING, allowNull: true },
    brand:                { type: DataTypes.STRING, allowNull: true },
    location:             { type: DataTypes.STRING, allowNull: true },
    remarks:              { type: DataTypes.TEXT,   allowNull: true },
  },
  { tableName: "branch_ip_phones", timestamps: true }
);

/* ─── Server ─── */
const BranchServer = sequelize.define(
  "BranchServer",
  {
    id:                     { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    branchId:               { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code:      { type: DataTypes.STRING(5),   allowNull: true },
    brand:                  { type: DataTypes.STRING(100), allowNull: false },
    ip_address:             { type: DataTypes.STRING(45),  allowNull: false },
    location:               { type: DataTypes.STRING(150), allowNull: true },
    model_no:               { type: DataTypes.STRING(100), allowNull: true },
    purchase_date:          { type: DataTypes.DATEONLY,    allowNull: true },
    vendor:                 { type: DataTypes.STRING(150), allowNull: true },
    specification:          { type: DataTypes.TEXT,        allowNull: true },
    storage:                { type: DataTypes.STRING(100), allowNull: true },
    memory:                 { type: DataTypes.STRING(100), allowNull: true },
    windows_server_version: { type: DataTypes.STRING(100), allowNull: true },
    virtualization:         { type: DataTypes.ENUM("Yes","No"), allowNull: false, defaultValue: "No" },
    remarks:                { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "server",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/* ─── Firewall / Router ─── */
const BranchFirewallRouter = sequelize.define(
  "BranchFirewallRouter",
  {
    id:                    { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    branchId:              { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code:     { type: DataTypes.STRING(5),   allowNull: true },
    brand:                 { type: DataTypes.STRING(100), allowNull: false },
    model:                 { type: DataTypes.STRING(100), allowNull: false },
    purchase_date:         { type: DataTypes.DATEONLY,    allowNull: true },
    vendor:                { type: DataTypes.STRING(150), allowNull: true },
    license_expiry:        { type: DataTypes.DATEONLY,    allowNull: true },
    remarks:               { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "firewall_router", timestamps: true }
);

/* ─── Switch ─── */
const BranchSwitch = sequelize.define(
  "BranchSwitch",
  {
    id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId:           { type: DataTypes.STRING(100), allowNull: true },
    branchId:          { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code: { type: DataTypes.STRING(5),   allowNull: true },
    asset_name:        { type: DataTypes.STRING(255), allowNull: true },
    model:             { type: DataTypes.STRING(255), allowNull: true },
    type:              { type: DataTypes.STRING(255), allowNull: true },
    brand:             { type: DataTypes.STRING(255), allowNull: true },
    location:          { type: DataTypes.STRING(255), allowNull: true },
    port:              { type: DataTypes.STRING(255), allowNull: true },
    assigned_user:     { type: DataTypes.STRING(255), allowNull: true },
    remarks:           { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "switch", timestamps: true }
);

/* ─── Extra Monitor ─── */
const BranchExtraMonitor = sequelize.define(
  "BranchExtraMonitor",
  {
    id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branchId:             { type: DataTypes.INTEGER, allowNull: false },
    sub_category_code:    { type: DataTypes.STRING(5),   allowNull: true },
    assetId:              { type: DataTypes.STRING(100), allowNull: true },
    monitor_name:         { type: DataTypes.STRING(150), allowNull: true },
    monitor_brand:        { type: DataTypes.STRING(100), allowNull: true },
    monitor_size:         { type: DataTypes.STRING(50),  allowNull: true },
    monitor_location:     { type: DataTypes.STRING(150), allowNull: true },
    monitor_status:       { type: DataTypes.STRING(50),  allowNull: true },
    system_model:         { type: DataTypes.STRING(150), allowNull: true },
    assigned_user:        { type: DataTypes.STRING(255), allowNull: true },
    remarks:              { type: DataTypes.TEXT,        allowNull: true },
  },
  { tableName: "extra_monitor", timestamps: true }
);
module.exports = {
  BranchInfra,
  BranchConnectivity,
  BranchUps,
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
};