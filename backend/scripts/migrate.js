const { initDatabase } = require('../config/db');
const logger = require('../services/logger');

(async () => {
  try {
    await initDatabase();
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed', err);
    process.exit(1);
  }
})();
