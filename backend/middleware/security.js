const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const env = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') return sanitizeHtml(value);
    if (Array.isArray(value)) return value.map(sanitize);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)]));
    }
    return value;
  };
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};

const corsMiddleware = cors({ origin: env.corsOrigin, credentials: true });

module.exports = { rateLimiter, helmet, corsMiddleware, sanitizeInput };
