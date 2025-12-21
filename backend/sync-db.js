// syncDb.js  (or whatever name you already use)
const { sequelize } = require('./config/db');

// ✅ load all models so associations are registered
require('./models/User');
require('./models/Branch');
require('./models/Device');
require('./models/branchInfra');
// require('./models/Request'); // only if you have this

(async () => {
  try {
    console.log('🔄 Syncing database (non-destructive)...');

    // ✅ SAFE: will create missing tables, but NOT drop data
    await sequelize.authenticate();
    await sequelize.sync(); // ⬅️ no { force }, no { alter }

    console.log('✅ Database sync complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing database:', err);
    process.exit(1);
  }
})();