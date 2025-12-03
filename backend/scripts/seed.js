const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('../services/logger');

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@adaptbtc.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['Platform Admin', adminEmail, passwordHash]
  );
};

(async () => {
  try {
    const seedSql = require('fs').readFileSync(require('path').join(__dirname, '..', 'db', 'seed.sql'), 'utf-8');
    if (seedSql.trim()) {
      await db.query(seedSql);
    }
    await createAdmin();
    logger.info('Seed data applied successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed', err);
    process.exit(1);
  }
})();
