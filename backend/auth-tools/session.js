function sessionTools(req, res) {
  if (req.session && req.session.toolsUser) {
    return res.json({ loggedIn: true, username: req.session.toolsUser });
  }
  res.json({ loggedIn: false });
}
module.exports = { sessionTools };
