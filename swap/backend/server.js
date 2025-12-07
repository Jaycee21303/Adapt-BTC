/*
RENDER DEPLOYMENT SETTINGS:
- Runtime: Node 18
- Build Command: npm install
- Start Command: npm start
- Auto-Deploy: Enabled
- Environment Variables:
    SOLANA_RPC_1
    SOLANA_RPC_2
    EVM_RPC_1
    EVM_RPC_2
    FEE_SOL_WALLET
    FEE_EVM_WALLET
    FEE_BTC_WALLET
    NODE_ENV=production
*/

// Swap backend entrypoint for mounting Solana, EVM, and BTC (Thorchain) swap routes.

require('dotenv').config();
const express = require('express');
const quoteRoutes = require('./routes/quote');
const executeRoutes = require('./routes/execute');

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = ['https://adaptbtc.com', 'https://adaptbtc.onrender.com', 'https://swap.adaptbtc.com'];

const app = express();
app.locals.isProd = isProd;
app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Strict-Transport-Security', 'max-age=5184000');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
const PORT = process.env.PORT || process.env.SWAP_BACKEND_PORT || 8080;

// Middleware to parse JSON bodies for route payloads.
app.use(express.json({ limit: '100kb' }));

// Verbose logging only in development for insight.
if (!isProd) {
  app.use((req, _res, next) => {
    console.log(`[DEV] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount swap-specific routes (isolated from the main Adapt-BTC backend).
app.use('/quote', quoteRoutes);
app.use('/execute', executeRoutes);

// Simple health check for the swap backend
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', chain: 'multi', uptime: process.uptime() });
});

// Only start server when this file is executed directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Swap backend running on port ${PORT}`);
  });
}

module.exports = app;
