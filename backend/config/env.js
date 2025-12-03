const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/adaptbtc',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test',
  shouldSeedOnStart: process.env.SEED_ON_START === 'true' || process.env.NODE_ENV === 'test',
};

module.exports = env;
