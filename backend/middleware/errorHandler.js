const logger = require('../services/logger');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
};

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error: %s', err.stack || err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
};

module.exports = { notFoundHandler, errorHandler };
