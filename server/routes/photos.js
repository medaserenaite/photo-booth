import { Router } from 'express';
import { randomUUID } from 'crypto';
import { saveBase64Photo, compositeFrame } from '../services/imageProcessor.js';
import { photoQueries } from '../services/db.js';

const router = Router();

/**
 * POST /api/photos
 * Body: { image: "data:image/jpeg;base64,...", frame: "gold-party" | "none" }
 * Saves the raw capture and records it in the DB.
 * Returns: { id, originalUrl }
 */
router.post('/', async (req, res) => {
  try {
    const { image, frame = 'none' } = req.body;

    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid or missing image data' });
    }

    const uuid = randomUUID();
    const origFilename = `orig_${uuid}.jpg`;
    const savedPath = await saveBase64Photo(image, origFilename);

    const id = photoQueries.insert(savedPath, frame);

    // Composite the frame onto the photo if one is selected
    if (frame && frame !== 'none') {
      const compositedPath = await compositeFrame(savedPath, frame, `comp_${uuid}`);
      photoQueries.updateComposited(id, compositedPath);
    }

    const publicUrl = `${process.env.PUBLIC_URL ?? ''}/uploads/${origFilename}`;

    res.status(201).json({ id, originalUrl: publicUrl });
  } catch (err) {
    console.error('POST /api/photos error:', err);
    res.status(500).json({ error: 'Failed to save photo' });
  }
});

/**
 * GET /api/photos/:id
 * Returns metadata for a single photo.
 */
router.get('/:id', (req, res) => {
  try {
    const photo = photoQueries.findById(Number(req.params.id));
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    console.error('GET /api/photos/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

export default router;
