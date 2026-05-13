const db = require("../models");

async function addServiceStationIdToUsers() {
  try {
    console.log("Starting migration: add service_station_id to users...");

    const queryInterface = db.sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable("users");

    if (!tableDefinition.service_station_id) {
      await queryInterface.addColumn("users", "service_station_id", {
        type: db.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "service_stations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      console.log("Added service_station_id to users");
    } else {
      console.log("service_station_id already exists on users");
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  }
}

module.exports = { addServiceStationIdToUsers };
