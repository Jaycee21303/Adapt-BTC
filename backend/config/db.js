const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { newDb } = require('pg-mem');
const env = require('./env');
const logger = require('../services/logger');

let pool;
let isInMemory = false;

if (env.useInMemoryDb) {
  const mem = newDb({ autoCreateForeignKeyIndices: true });
  const adapter = mem.adapters.createPg();
  pool = new adapter.Pool();
  isInMemory = true;
  logger.info('Using in-memory PostgreSQL (pg-mem) database for development/test');
} else {
  pool = new Pool({ connectionString: env.databaseUrl, ssl: env.databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined });
  logger.info('Using PostgreSQL database connection');
}

const query = (text, params) => pool.query(text, params);

const runSqlFile = async (fileName) => {
  const filePath = path.join(__dirname, '..', 'db', fileName);
  if (!fs.existsSync(filePath)) {
    logger.warn(`SQL file not found: ${filePath}`);
    return;
  }
  const sql = fs.readFileSync(filePath, 'utf-8');
  if (!sql.trim()) return;
  await query(sql);
};

const initDatabase = async () => {
  await runSqlFile('migrations.sql');
  if (env.shouldSeedOnStart) {
    await runSqlFile('seed.sql');
  }
};

module.exports = {
  pool,
  query,
  initDatabase,
  isInMemory,
};
