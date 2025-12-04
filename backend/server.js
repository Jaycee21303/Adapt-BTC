const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const { registerLearning } = require('./auth-learning/register');
const { loginLearning } = require('./auth-learning/login');
const { logoutLearning } = require('./auth-learning/logout');
const { sessionLearning } = require('./auth-learning/session');
const { getProgress, saveProgress } = require('./auth-learning/progress');
const { requireLearningSession } = require('./auth-learning/middleware');
const { registerTools } = require('./auth-tools/register');
const { loginTools } = require('./auth-tools/login');
const { logoutTools } = require('./auth-tools/logout');
const { sessionTools } = require('./auth-tools/session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'ADAPTBTC_PORTAL_SECRET',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

function loadDb(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'db', file), 'utf-8'));
}
function saveDb(file, data) {
  fs.writeFileSync(path.join(__dirname, 'db', file), JSON.stringify(data, null, 2));
}

// Learning portal routes
app.post('/api/learning/register', (req, res) => registerLearning(req, res, loadDb, saveDb));
app.post('/api/learning/login', (req, res) => loginLearning(req, res, loadDb));
app.post('/api/learning/logout', logoutLearning);
app.get('/api/learning/session', sessionLearning);
app.get('/api/learning/progress', (req, res) => getProgress(req, res, loadDb));
app.post('/api/learning/progress', (req, res) => saveProgress(req, res, loadDb, saveDb));

// Tools portal routes (optional login)
app.post('/api/tools/register', (req, res) => registerTools(req, res, loadDb, saveDb));
app.post('/api/tools/login', (req, res) => loginTools(req, res, loadDb));
app.post('/api/tools/logout', logoutTools);
app.get('/api/tools/session', sessionTools);
app.post('/api/tools/preferences', (req, res) => {
  if (!req.session.toolsUser) return res.status(401).json({ error: 'Login required to save preferences' });
  const db = loadDb('users-tools.json');
  const user = db.users.find(u => u.username === req.session.toolsUser);
  user.preferences = req.body;
  saveDb('users-tools.json', db);
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdaptBTC backend running on ${PORT}`));
