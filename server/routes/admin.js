import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { photoQueries, smsQueries, settingsQueries } from '../services/db.js';
import { compositeFrame } from '../services/imageProcessor.js';
import { sendMMS, buildSmsBody } from '../services/twilio.js';
import { resetAllCounts, hashPhone } from '../middleware/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  // Accept password from header (JSON requests) or query param (file downloads)
  const pw =
    req.headers['x-admin-password'] ??
    req.body?.password ??
    req.query?.pw;
  const expected = process.env.ADMIN_PASSWORD ?? 'change-me-123';
  if (pw !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * POST /api/admin/login
 * Body: { password }
 * Returns: { ok: true } or 401
 */
router.post('/login', (req, res) => {
  const pw = req.body?.password;
  const expected = process.env.ADMIN_PASSWORD ?? 'change-me-123';
  if (pw !== expected) return res.status(401).json({ error: 'Wrong password' });
  res.json({ ok: true });
});

/**
 * GET /api/admin/stats
 */
router.get('/stats', requireAdmin, (_req, res) => {
  try {
    res.json({
      totalPhotos: photoQueries.count(),
      totalSent: smsQueries.totalSent(),
      uniquePhones: smsQueries.uniquePhones(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/admin/photos?page=1&limit=20
 */
router.get('/photos', requireAdmin, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;
    const base = process.env.PUBLIC_URL ?? 'http://localhost:3000';

    const photos = photoQueries.findAll(limit, offset).map((p) => {
      const filePath = p.composited_path ?? p.original_path;
      const filename = path.basename(filePath);
      return { ...p, url: `${base}/uploads/${filename}` };
    });

    res.json({ photos, total: photoQueries.count(), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

/**
 * POST /api/admin/resend
 * Body: { photoId, phone }
 * Resend a photo to a (possibly different) number — bypasses rate limit.
 */
router.post('/resend', requireAdmin, async (req, res) => {
  const { photoId, phone } = req.body;
  if (!photoId || !phone) {
    return res.status(400).json({ error: 'photoId and phone required' });
  }

  const digits = phone.replace(/\D/g, '');
  const e164 =
    digits.length === 10 ? `+1${digits}` : digits.length === 11 ? `+${digits}` : null;
  if (!e164) return res.status(400).json({ error: 'Invalid phone number' });

  try {
    const photo = photoQueries.findById(Number(photoId));
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    let compositedPath = photo.composited_path;
    if (!compositedPath) {
      const outputName = `comp_${randomUUID()}`;
      compositedPath = await compositeFrame(photo.original_path, photo.frame_used, outputName);
      photoQueries.updateComposited(photo.id, compositedPath);
    }

    const filename = path.basename(compositedPath);
    const imageUrl = `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/uploads/${filename}`;
    await sendMMS(e164, imageUrl, buildSmsBody());

    const phoneHash = hashPhone(phone);
    smsQueries.insert(photo.id, phoneHash, 'sent');

    res.json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/settings
 */
router.get('/settings', requireAdmin, (_req, res) => {
  try {
    res.json(settingsQueries.getAll());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/admin/settings
 * Body: { gallery_enabled, gallery_slug, event_name, booth_password }
 */
router.post('/settings', requireAdmin, (req, res) => {
  try {
    const { gallery_enabled, gallery_slug, event_name, booth_password } = req.body;
    if (gallery_enabled !== undefined)
      settingsQueries.set('gallery_enabled', String(gallery_enabled));
    if (gallery_slug) settingsQueries.set('gallery_slug', gallery_slug.trim());
    if (event_name) settingsQueries.set('event_name', event_name.trim());
    // Empty string means "remove password" (open booth)
    if (booth_password !== undefined)
      settingsQueries.set('booth_password', booth_password.trim());
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * POST /api/admin/clear-session
 * Deletes all photos from DB (not from disk), resets SMS counts.
 */
router.post('/clear-session', requireAdmin, (_req, res) => {
  try {
    smsQueries.deleteAll();
    photoQueries.deleteAll();
    resetAllCounts();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

/**
 * GET /api/admin/download-zip
 * Streams a ZIP of all composited (or original) photos.
 */
router.get('/download-zip', requireAdmin, (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="party-photos.zip"');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    const photos = photoQueries.findAll(10000, 0);
    for (const photo of photos) {
      const filePath = photo.composited_path ?? photo.original_path;
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: path.basename(filePath) });
      }
    }

    archive.finalize();
  } catch (err) {
    console.error('Zip error:', err);
    res.status(500).json({ error: 'Failed to create zip' });
  }
});

export default router;
