const { verifyToken } = require('../utils/jwt');
const logger = require('../services/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  const tokenFromCookie = req.cookies && req.cookies.token ? req.cookies.token : null;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    logger.warn('Invalid auth token: %s', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || (req.user.role !== role && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  return next();
};

module.exports = { authMiddleware, requireRole };
