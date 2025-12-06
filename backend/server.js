/*
 * AdaptBTC backend API server.
 *
 * This Express application provides RESTful endpoints for the learning
 * and tools portals. In the original implementation all routes were
 * concatenated on a single line and a hard‑coded session secret was
 * used. This refactored version adds formatting, comments and uses
 * environment variables for configuration.
 */

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware to parse JSON and URL‑encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session management. Use an environment variable for the
// secret to avoid hard‑coding sensitive values in source control.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change‑this‑secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      // 24 hour session lifetime
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

/**
 * Load JSON data from a file in the ``db`` directory.
 *
 * @param {string} file The filename to load
 * @returns {any} Parsed JSON contents
 */
function loadDb(file) {
  const filePath = path.join(__dirname, 'db', file);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Persist data to a JSON file in the ``db`` directory.
 *
 * @param {string} file The filename to write
 * @param {any} data The data to save
 */
function saveDb(file, data) {
  const filePath = path.join(__dirname, 'db', file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* -------------------------------------------------------------------
 * Learning portal endpoints
 *
 * Authentication is currently disabled, so these endpoints return
 * stubbed responses. If authentication is added later, logic can
 * be implemented here to validate user credentials and manage
 * sessions appropriately.
 */
app.post('/api/learning/register', (_req, res) => {
  res.json({ message: 'Auth disabled: learning portal is open access.' });
});

app.post('/api/learning/login', (_req, res) => {
  res.json({ message: 'Auth disabled: learning portal is open access.' });
});

app.post('/api/learning/logout', (_req, res) => {
  res.json({ message: 'No login active.' });
});

app.get('/api/learning/session', (_req, res) => {
  res.json({ loggedIn: false, note: 'Open access portal' });
});

app.get('/api/learning/progress', (_req, res) => {
  res.json({ progress: 'client‑side only' });
});

app.post('/api/learning/progress', (_req, res) => {
  res.json({ saved: false, note: 'Progress stays in your browser' });
});

/* -------------------------------------------------------------------
 * Tools portal endpoints
 *
 * Like the learning portal, these routes are open access. They
 * currently stub out functionality that could later interact with
 * user preferences stored on the server.
 */
app.post('/api/tools/register', (_req, res) => {
  res.json({ message: 'Auth disabled: tools are open access.' });
});

app.post('/api/tools/login', (_req, res) => {
  res.json({ message: 'Auth disabled: tools are open access.' });
});

app.post('/api/tools/logout', (_req, res) => {
  res.json({ message: 'No login active.' });
});

app.get('/api/tools/session', (_req, res) => {
  res.json({ loggedIn: false, note: 'Open access tools' });
});

app.post('/api/tools/preferences', (_req, res) => {
  res.json({ saved: false, note: 'Preferences remain local to this browser' });
});

/* -------------------------------------------------------------------
 * Static file serving
 *
 * The backend exposes the parent directory one level above itself
 * (i.e. the repository root) as a static directory. This allows the
 * learning and tools portals to access shared assets and HTML files
 * directly. Ensure that no sensitive files are stored in this tree.
 */
app.use(express.static(path.join(__dirname, '..')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AdaptBTC backend running on ${PORT}`);
});