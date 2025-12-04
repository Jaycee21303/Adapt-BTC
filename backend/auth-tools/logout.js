function logoutTools(req, res) {
  req.session.toolsUser = null;
  res.json({ success: true });
}
module.exports = { logoutTools };
