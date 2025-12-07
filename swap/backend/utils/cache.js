// Simple in-memory caching utility for short-lived quote responses.
// Not intended for long-term persistence; resets on process restart.

const cache = new Map();

function setCache(key, value, ttlMs) {
  const expires = Date.now() + ttlMs;
  cache.set(key, { value, expires });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

module.exports = { setCache, getCache };
