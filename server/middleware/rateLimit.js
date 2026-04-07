import { createHash } from 'crypto';

// In-memory store: phoneHash → send count (resets on server restart / per-session)
const sendCounts = new Map();

const MAX_SENDS_PER_PHONE = 3;

/**
 * Hash a phone number so we don't store raw PII in memory.
 */
export function hashPhone(phone) {
  return createHash('sha256').update(phone).digest('hex');
}

/**
 * Express middleware that rate-limits SMS sends.
 * Expects req.body.phone to be set before this middleware runs.
 */
export function smsRateLimit(req, res, next) {
  const phone = req.body?.phone;
  if (!phone) return next();

  const hash = hashPhone(phone);
  const count = sendCounts.get(hash) ?? 0;

  if (count >= MAX_SENDS_PER_PHONE) {
    return res.status(429).json({
      error: `Maximum ${MAX_SENDS_PER_PHONE} messages per phone number per session.`,
    });
  }

  // Attach hash to request for use in route handlers
  req.phoneHash = hash;
  req.phoneCount = count;
  next();
}

/**
 * Increment the send count for a phone (call after successful send).
 */
export function incrementPhone(phoneHash) {
  const count = sendCounts.get(phoneHash) ?? 0;
  sendCounts.set(phoneHash, count + 1);
}

/**
 * Reset all counters (used by admin clear-session).
 */
export function resetAllCounts() {
  sendCounts.clear();
}
