const { verifyPassword } = require('./hash');

async function loginTools(req, res, loadDb) {
  const { username, password } = req.body;
  const db = loadDb('users-tools.json');
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.toolsUser = username;
  res.json({ success: true, preferences: user.preferences || {} });
}

module.exports = { loginTools };
