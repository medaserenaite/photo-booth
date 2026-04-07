import { Router } from 'express';
import { settingsQueries } from '../services/db.js';

const router = Router();

/**
 * Resolve the effective booth password.
 * DB value takes priority; falls back to env var.
 * Empty string in either = no password.
 */
function getEffectivePassword() {
  const fromDb = settingsQueries.get('booth_password');
  // Use || so empty string also falls through to env var
  return (fromDb || process.env.BOOTH_PASSWORD || '').trim();
}

/**
 * POST /api/booth/verify
 * Body: { password: string }
 */
router.post('/verify', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const stored = getEffectivePassword();

  if (!stored) {
    // No password configured — booth is open
    return res.json({ ok: true });
  }

  if (password !== stored) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  res.json({ ok: true });
});

/**
 * GET /api/booth/config
 * Returns public booth metadata. Does NOT return the password.
 */
router.get('/config', (_req, res) => {
  const eventName =
    settingsQueries.get('event_name') ||
    process.env.EVENT_NAME ||
    "Pop DeKegg's Tavern";

  const passwordRequired = getEffectivePassword().length > 0;

  res.json({ eventName, passwordRequired });
});

export default router;
