const logger = require('../services/logger');

const validateRequest = (schema) => (req, res, next) => {
  const payload = { ...req.body, ...req.params, ...req.query };
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    logger.warn('Validation failed: %s', JSON.stringify(parsed.error.format()));
    return res.status(400).json({ success: false, message: 'Invalid request payload', details: parsed.error.flatten() });
  }
  req.validated = parsed.data;
  return next();
};

module.exports = validateRequest;
