function requireLearningSession(req, res, next) {
  if (!req.session || !req.session.learningUser) {
    return res.status(401).json({ error: 'Auth required' });
  }
  next();
}

module.exports = { requireLearningSession };
