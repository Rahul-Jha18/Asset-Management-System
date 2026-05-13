// backend/sync-db.js
require("dotenv").config();

const { sequelize } = require("./config/db");

// This loads ALL models + associations
require("./models"); // <-- this will run models/index.js

(async () => {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ DB connected");

    console.log("🔄 Syncing database (safe, non-destructive)...");
    await sequelize.sync({ alter: false, force: false });

    console.log("✅ Database sync complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error syncing database:", err);
    process.exit(1);
  }
})();
