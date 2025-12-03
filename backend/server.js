const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');
const { rateLimiter, helmet, corsMiddleware, sanitizeInput } = require('./middleware/security');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./services/logger');
const { initDatabase } = require('./config/db');
const { STORAGE_DIR } = require('./utils/pdf');

const app = express();

app.use(helmet());
app.use(rateLimiter);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(morgan('dev'));
app.use('/certificates', express.static(STORAGE_DIR));

app.use('/api', routes);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await initDatabase();
  app.listen(env.port, () => logger.info(`AdaptBTC backend listening on port ${env.port}`));
};

if (require.main === module) {
  start();
}

module.exports = app;
