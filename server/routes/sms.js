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
 * Accepts "(555) 123-4567", "5551234567", "+15551234567", etc.
 */
function toE164(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

/**
 * POST /api/sms/send
 * Body: { photoId: number, phone: string }
 *
 * 1. Fetch photo from DB
 * 2. Composite the frame onto the photo
 * 3. Send MMS via Twilio
 * 4. Log result to DB
 */
router.post('/send', smsRateLimit, async (req, res) => {
  const { photoId, phone } = req.body;

  if (!photoId || !phone) {
    return res.status(400).json({ error: 'photoId and phone are required' });
  }

  const e164 = toE164(phone);
  if (!e164) {
    return res.status(400).json({ error: 'Invalid US phone number' });
  }

  let photo;
  try {
    photo = photoQueries.findById(Number(photoId));
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
  } catch (err) {
    return res.status(500).json({ error: 'DB error fetching photo' });
  }

  const phoneHash = req.phoneHash ?? hashPhone(phone);

  try {
    // Composite the frame (or copy as-is if already composited)
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

    // Build public URL for Twilio
    const filename = path.basename(compositedPath);
    const imageUrl = `${process.env.PUBLIC_URL ?? 'http://localhost:3000'}/uploads/${filename}`;

    // Send MMS
    const body = buildSmsBody();
    await sendMMS(e164, imageUrl, body);

    // Log success
    smsQueries.insert(photo.id, phoneHash, 'sent');
    incrementPhone(phoneHash);

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('SMS send error:', err);
    smsQueries.insert(photo.id, phoneHash, 'failed', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to send SMS' });
  }
});

export default router;
