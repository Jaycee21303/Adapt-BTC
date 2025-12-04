function sessionLearning(req, res) {
  if (req.session && req.session.learningUser) {
    return res.json({ loggedIn: true, username: req.session.learningUser });
  }
  res.json({ loggedIn: false });
}

module.exports = { sessionLearning };
