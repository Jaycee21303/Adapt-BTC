function logoutLearning(req, res) {
  req.session.learningUser = null;
  res.json({ success: true });
}

module.exports = { logoutLearning };
