import { Router } from 'express';
import path from 'path';
import { photoQueries, settingsQueries } from '../services/db.js';

const router = Router();

function buildPhotoResponse(photo) {
  const base = process.env.PUBLIC_URL ?? 'http://localhost:3000';
  const filePath = photo.composited_path ?? photo.original_path;
  const filename = path.basename(filePath);
  return {
    id: photo.id,
    url: `${base}/uploads/${filename}`,
    frame: photo.frame_used,
    createdAt: photo.created_at,
  };
}

/**
 * GET /api/gallery/:slug
 * Returns paginated photos for a gallery slug.
 * Query params: ?page=1&limit=20
 */
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const galleryEnabled = settingsQueries.get('gallery_enabled');
    if (galleryEnabled === 'false') {
      return res.status(403).json({ error: 'Gallery is currently disabled' });
    }

    const currentSlug = settingsQueries.get('gallery_slug') ?? 'party';
    if (slug !== currentSlug) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const photos = photoQueries.findAll(limit, offset);
    const total = photoQueries.count();

    res.json({
      photos: photos.map(buildPhotoResponse),
      total,
      page,
      limit,
      hasMore: offset + photos.length < total,
      eventName: settingsQueries.get('event_name') ?? process.env.EVENT_NAME ?? "Pop DeKegg's Tavern",
      slug: currentSlug,
    });
  } catch (err) {
    console.error('GET /api/gallery/:slug error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

/**
 * GET /api/gallery
 * Returns gallery metadata (slug, enabled, event name) — used by the frontend
 * to redirect users to the correct gallery URL.
 */
router.get('/', (_req, res) => {
  try {
    const settings = settingsQueries.getAll();
    res.json({
      slug: settings.gallery_slug ?? 'party',
      enabled: settings.gallery_enabled !== 'false',
      eventName: settings.event_name ?? process.env.EVENT_NAME ?? "Pop DeKegg's Tavern",
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery info' });
  }
});

export default router;
