const { hashPassword } = require('./hash');

async function registerLearning(req, res, loadDb, saveDb) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const db = loadDb('users-learning.json');
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }
  const password_hash = await hashPassword(password);
  db.users.push({ username, password_hash, progress: { lessons: {}, quizzes: {}, certificates: [] } });
  saveDb('users-learning.json', db);
  req.session.learningUser = username;
  res.json({ success: true });
}

module.exports = { registerLearning };
