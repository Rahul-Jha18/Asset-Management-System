// backend/jobs/cleanupNotifications.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("../models");

const { Notification } = db;

// Runs daily at 02:10 AM server time
function startNotificationCleanupJob() {
  cron.schedule("10 2 * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const deleted = await Notification.destroy({
        where: {
          createdAt: { [Op.lt]: cutoff },
        },
      });

      console.log(`[Cleanup] Notifications deleted: ${deleted}`);
    } catch (err) {
      console.error("[Cleanup] Failed:", err?.message || err);
    }
  });
}

module.exports = { startNotificationCleanupJob };
