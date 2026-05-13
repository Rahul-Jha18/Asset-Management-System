// backend/models/BranchSoftware.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const withDbTimestamps = {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const BranchApplicationSoftware = sequelize.define(
  "BranchApplicationSoftware",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    software_name: { type: DataTypes.STRING(200), allowNull: false, field: "software_name" },
    software_category: { type: DataTypes.STRING(100), allowNull: true, field: "software_category" },
    version: { type: DataTypes.STRING(50), allowNull: true, field: "version" },
    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },

    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    quantity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1, field: "quantity" },

    purchase_date: { type: DataTypes.DATEONLY, allowNull: true, field: "purchase_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    assigned_to: { type: DataTypes.STRING(150), allowNull: true, field: "assigned_to" },
    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_application_software", ...withDbTimestamps }
);

const BranchOfficeSoftware = sequelize.define(
  "BranchOfficeSoftware",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    software_name: { type: DataTypes.STRING(200), allowNull: false, field: "software_name" },
    software_category: { type: DataTypes.STRING(100), allowNull: true, field: "software_category" },
    version: { type: DataTypes.STRING(50), allowNull: true, field: "version" },
    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },

    installed_on: { type: DataTypes.STRING(20), allowNull: true, field: "installed_on" },
    pc_name: { type: DataTypes.STRING(100), allowNull: true, field: "pc_name" },
    installed_by: { type: DataTypes.STRING(100), allowNull: true, field: "installed_by" },
    install_date: { type: DataTypes.DATEONLY, allowNull: true, field: "install_date" },

    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    quantity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1, field: "quantity" },

    purchase_date: { type: DataTypes.DATEONLY, allowNull: true, field: "purchase_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    assigned_to: { type: DataTypes.STRING(150), allowNull: true, field: "assigned_to" },
    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_office_software", ...withDbTimestamps }
);

const BranchUtilitySoftware = sequelize.define(
  "BranchUtilitySoftware",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    software_name: { type: DataTypes.STRING(200), allowNull: false, field: "software_name" },
    version: { type: DataTypes.STRING(50), allowNull: true, field: "version" },
    category: { type: DataTypes.STRING(100), allowNull: true, field: "category" },

    pc_name: { type: DataTypes.STRING(100), allowNull: true, field: "pc_name" },
    installed_by: { type: DataTypes.STRING(100), allowNull: true, field: "installed_by" },
    install_date: { type: DataTypes.DATEONLY, allowNull: true, field: "install_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_utility_software", ...withDbTimestamps }
);

const BranchServices = sequelize.define(
  "BranchServices",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    service_name: { type: DataTypes.STRING(200), allowNull: false, field: "service_name" },
    service_category: { type: DataTypes.STRING(100), allowNull: true, field: "service_category" },
    provider_name: { type: DataTypes.STRING(150), allowNull: true, field: "provider_name" },

    contract_no: { type: DataTypes.STRING(100), allowNull: true, field: "contract_no" },
    provider_contact: { type: DataTypes.STRING(150), allowNull: true, field: "provider_contact" },
    start_date: { type: DataTypes.DATEONLY, allowNull: true, field: "start_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_services", ...withDbTimestamps }
);

const BranchLicenses = sequelize.define(
  "BranchLicenses",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    license_name: { type: DataTypes.STRING(200), allowNull: false, field: "license_name" },
    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    quantity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1, field: "quantity" },

    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: true, field: "purchase_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },
    assigned_to: { type: DataTypes.STRING(150), allowNull: true, field: "assigned_to" },

    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_licenses", ...withDbTimestamps }
);

const BranchSecuritySoftware = sequelize.define(
  "BranchSecuritySoftware",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    product_name: { type: DataTypes.STRING(200), allowNull: false, field: "product_name" },
    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },
    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    total_nodes: { type: DataTypes.INTEGER, allowNull: true, field: "total_nodes" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_security_software", ...withDbTimestamps }
);

const BranchSecuritySoftwareInstalled = sequelize.define(
  "BranchSecuritySoftwareInstalled",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    product_name: { type: DataTypes.STRING(200), allowNull: false, field: "product_name" },
    version: { type: DataTypes.STRING(50), allowNull: true, field: "version" },
    pc_name: { type: DataTypes.STRING(100), allowNull: true, field: "pc_name" },

    real_time_protection: { type: DataTypes.STRING(50), allowNull: true, field: "real_time_protection" },
    last_update_date: { type: DataTypes.DATEONLY, allowNull: true, field: "last_update_date" },
    installed_by: { type: DataTypes.STRING(100), allowNull: true, field: "installed_by" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },

    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_security_software_installed", ...withDbTimestamps }
);

const BranchWindowsOS = sequelize.define(
  "BranchWindowsOS",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    os_version: { type: DataTypes.STRING(100), allowNull: true, field: "os_version" },
    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    activation_status: { type: DataTypes.STRING(50), allowNull: true, field: "activation_status" },
    installed_date: { type: DataTypes.DATEONLY, allowNull: true, field: "installed_date" },
    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },
    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_windows_os", ...withDbTimestamps }
);

const BranchOnlineConferenceTools = sequelize.define(
  "BranchOnlineConferenceTools",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    tool_name: { type: DataTypes.STRING(200), allowNull: false, field: "tool_name" },
    vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },
    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    no_of_users: { type: DataTypes.INTEGER, allowNull: true, field: "no_of_users" },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: true, field: "purchase_date" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },
    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_online_conference_tools", ...withDbTimestamps }
);

const BranchWindowsServers = sequelize.define(
  "BranchWindowsServers",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: "id" },
    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branchId" },
    sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

    server_name: { type: DataTypes.STRING(150), allowNull: true, field: "server_name" },
    server_role: { type: DataTypes.STRING(100), allowNull: true, field: "server_role" },
    os_version: { type: DataTypes.STRING(100), allowNull: true, field: "os_version" },
    license_type: { type: DataTypes.STRING(50), allowNull: true, field: "license_type" },
    license_key: { type: DataTypes.STRING(255), allowNull: true, field: "license_key" },
    cores_licensed: { type: DataTypes.INTEGER, allowNull: true, field: "cores_licensed" },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },
    remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
  },
  { tableName: "branch_windows_servers", ...withDbTimestamps }
);

module.exports = {
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