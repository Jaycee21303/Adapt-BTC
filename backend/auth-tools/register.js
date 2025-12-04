const { hashPassword } = require('./hash');

async function registerTools(req, res, loadDb, saveDb) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const db = loadDb('users-tools.json');
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already exists' });
  const password_hash = await hashPassword(password);
  db.users.push({ username, password_hash, preferences: {} });
  saveDb('users-tools.json', db);
  req.session.toolsUser = username;
  res.json({ success: true });
}

module.exports = { registerTools };
