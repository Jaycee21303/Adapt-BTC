const { verifyPassword } = require('./hash');

async function loginLearning(req, res, loadDb) {
  const { username, password } = req.body;
  const db = loadDb('users-learning.json');
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.learningUser = username;
  res.json({ success: true });
}

module.exports = { loginLearning };
