import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { compositeFrame } from '../services/imageProcessor.js';
import { sendMMS, buildSmsBody } from '../services/twilio.js';
import { photoQueries, smsQueries } from '../services/db.js';
import { smsRateLimit, incrementPhone, hashPhone } from '../middleware/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * Normalise a US phone number to E.164 format (+1XXXXXXXXXX).
 */
function toE164(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

/**
 * POST /api/sms/send
 * Body: { photoIds: number[], phone: string }
 *
 * Composites each photo with its frame, then sends one MMS
 * containing all images (Twilio supports up to 10 mediaUrls).
 */
router.post('/send', smsRateLimit, async (req, res) => {
  const { photoIds, photoId, phone } = req.body;

  // Accept either photoIds[] (multi) or legacy photoId (single)
  const ids = Array.isArray(photoIds) && photoIds.length > 0
    ? photoIds
    : photoId != null ? [photoId] : null;

  if (!ids || ids.length === 0 || !phone) {
    return res.status(400).json({ error: 'photoIds and phone are required' });
  }

  const e164 = toE164(phone);
  if (!e164) {
    return res.status(400).json({ error: 'Invalid US phone number' });
  }

  const phoneHash = req.phoneHash ?? hashPhone(phone);
  const baseUrl = process.env.PUBLIC_URL ?? 'http://localhost:3000';

  try {
    // Composite every photo and collect public URLs
    const imageUrls = [];

    for (const id of ids) {
      const photo = photoQueries.findById(Number(id));
      if (!photo) return res.status(404).json({ error: `Photo ${id} not found` });

      let compositedPath = photo.composited_path;
      if (!compositedPath) {
        const outputName = `comp_${randomUUID()}`;
        compositedPath = await compositeFrame(
          photo.original_path,
          photo.frame_used,
          outputName
        );
        photoQueries.updateComposited(photo.id, compositedPath);
      }

      imageUrls.push(`${baseUrl}/uploads/${path.basename(compositedPath)}`);
    }

    // Send one MMS with all images
    const body = buildSmsBody();
    await sendMMS(e164, imageUrls, body);

    // Log against the first photo
    smsQueries.insert(ids[0], phoneHash, 'sent');
    incrementPhone(phoneHash);

    res.json({ success: true, imageUrls });
  } catch (err) {
    console.error('SMS send error:', err);
    smsQueries.insert(ids[0], phoneHash, 'failed', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to send SMS' });
  }
});

export default router;
