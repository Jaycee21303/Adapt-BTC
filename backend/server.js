const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
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

// Learning portal routes (auth disabled)
app.post('/api/learning/register', (_req, res) => res.json({ message: 'Auth disabled: learning portal is open access.' }));
app.post('/api/learning/login', (_req, res) => res.json({ message: 'Auth disabled: learning portal is open access.' }));
app.post('/api/learning/logout', (_req, res) => res.json({ message: 'No login active.' }));
app.get('/api/learning/session', (_req, res) => res.json({ loggedIn: false, note: 'Open access portal' }));
app.get('/api/learning/progress', (_req, res) => res.json({ progress: 'client-side only' }));
app.post('/api/learning/progress', (_req, res) => res.json({ saved: false, note: 'Progress stays in your browser' }));

// Tools portal routes (auth disabled)
app.post('/api/tools/register', (_req, res) => res.json({ message: 'Auth disabled: tools are open access.' }));
app.post('/api/tools/login', (_req, res) => res.json({ message: 'Auth disabled: tools are open access.' }));
app.post('/api/tools/logout', (_req, res) => res.json({ message: 'No login active.' }));
app.get('/api/tools/session', (_req, res) => res.json({ loggedIn: false, note: 'Open access tools' }));
app.post('/api/tools/preferences', (_req, res) => res.json({ saved: false, note: 'Preferences remain local to this browser' }));

app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdaptBTC backend running on ${PORT}`));
