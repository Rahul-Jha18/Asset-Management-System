const db = require("../models");

async function addAssetIdColumns() {
  try {
    console.log("Starting migration: add assetId columns...");

    const queryInterface = db.sequelize.getQueryInterface();

    const tables = [
      "branch_infra",
      "branch_connectivity",
      "branch_ups",
      "branch_scanners",
      "branch_projectors",
      "branch_printers",
      "branch_desktops",
      "branch_laptops",
      "branch_cctv",
      "branch_panels",
      "branch_ip_phones",
      "branch_application_software",
      "branch_office_software",
      "branch_utility_software",
      "branch_services",
      "branch_licenses",
      "branch_security_software",
      "branch_security_software_installed",
      "branch_windows_os",
      "branch_windows_servers",
    ];

    for (const tableName of tables) {
      try {
        const tableDefinition = await queryInterface.describeTable(tableName);

        if (!tableDefinition.assetId) {
          await queryInterface.addColumn(tableName, "assetId", {
            type: db.Sequelize.STRING(100),
            allowNull: true,
            comment: "Custom asset ID (e.g., DC1, L001)",
          });
          console.log(`Added assetId to ${tableName}`);
        } else {
          console.log(`assetId already exists in ${tableName}`);
        }
      } catch (err) {
        console.warn(`Could not process ${tableName}: ${err.message}`);
      }
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  }
}

module.exports = { addAssetIdColumns };