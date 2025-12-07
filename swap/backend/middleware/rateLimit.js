// Simple in-memory rate limiter for quote and execute endpoints.
// Designed for lightweight protection; should be replaced with Redis/Upstash for production scale.

const WINDOW_MS = 30_000; // 30 seconds
const QUOTE_LIMIT = 30; // per IP per window
const EXEC_LIMIT = 10; // per IP per window

const buckets = new Map();

function prune(ip) {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry) return [];

  const recent = entry.filter((timestamp) => now - timestamp < WINDOW_MS);
  buckets.set(ip, recent);
  return recent;
}

function rateLimiterFactory(limit) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = prune(ip);

    if (recent.length >= limit) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
    }

    buckets.set(ip, [...recent, now]);
    return next();
  };
}

const rateLimitQuotes = rateLimiterFactory(QUOTE_LIMIT);
const rateLimitExecute = rateLimiterFactory(EXEC_LIMIT);

module.exports = {
  rateLimitQuotes,
  rateLimitExecute,
};
