function getProgress(req, res, loadDb) {
  if (!req.session.learningUser) return res.status(401).json({ error: 'Auth required' });
  const db = loadDb('users-learning.json');
  const user = db.users.find(u => u.username === req.session.learningUser);
  res.json(user?.progress || { lessons:{}, quizzes:{}, certificates:[] });
}

function saveProgress(req, res, loadDb, saveDb) {
  if (!req.session.learningUser) return res.status(401).json({ error: 'Auth required' });
  const db = loadDb('users-learning.json');
  const user = db.users.find(u => u.username === req.session.learningUser);
  user.progress = req.body;
  saveDb('users-learning.json', db);
  res.json({ success: true });
}

module.exports = { getProgress, saveProgress };
