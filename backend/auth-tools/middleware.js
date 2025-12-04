function requireToolsSession(req, res, next) {
  if (!req.session || !req.session.toolsUser) {
    return res.status(401).json({ error: 'Login optional but required for this action' });
  }
  next();
}

module.exports = { requireToolsSession };
