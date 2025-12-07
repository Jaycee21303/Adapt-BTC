// Centralized logger for swap backend events.
// Future enhancement: pipe to external provider (Datadog, Logtail, etc.).

function logSwapEvent(type, data = {}) {
  const timestamp = new Date().toISOString();
  // Basic console logging for now; structured for easy forwarding later.
  console.log(`[${timestamp}] ${type}:`, data);
}

function logPerformance(eventName, ms) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [PERF] ${eventName}: ${ms}ms`);
}

module.exports = { logSwapEvent, logPerformance };
