const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectDB } = require("./config/db");
const { startExpiryJob } = require("./jobs/expiryJob");
const { startNotificationCleanupJob } = require("./jobs/cleanupNotifications");
const { addAssetIdColumns } = require("./migrations/20260210-add-assetId-columns");
const { addServiceStationIdToUsers } = require("./migrations/20260402000000-add-service-station-id-to-users");

require("./models");

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.RUN_MIGRATION === "true") {
      await addAssetIdColumns();
      await addServiceStationIdToUsers();
    }
    startExpiryJob();
    startNotificationCleanupJob();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
};

startServer();