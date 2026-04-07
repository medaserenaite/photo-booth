import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAMES_DIR = path.join(__dirname, '..', '..', 'frames');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

/**
 * Composite a frame PNG on top of a photo JPEG.
 * @param {string} photoPath  - Absolute path to the source photo JPEG
 * @param {string} frameSlug  - Frame filename without extension (e.g. "gold-party")
 *                              or "none" / falsy to skip compositing
 * @param {string} outputName - Filename for the saved output (no extension)
 * @returns {Promise<string>} Absolute path to the composited JPEG
 */
export async function compositeFrame(photoPath, frameSlug, outputName) {
  const outPath = path.join(UPLOADS_DIR, `${outputName}.jpg`);

  // Base image resized to target dimensions
  let pipeline = sharp(photoPath).resize(TARGET_WIDTH, TARGET_HEIGHT, {
    fit: 'cover',
    position: 'center',
  });

  // Composite frame if one is selected
  if (frameSlug && frameSlug !== 'none') {
    const framePath = path.join(FRAMES_DIR, `${frameSlug}.png`);

    if (!fs.existsSync(framePath)) {
      console.warn(`Frame not found: ${framePath} — skipping overlay`);
    } else {
      const frameBuffer = await sharp(framePath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'fill' })
        .toBuffer();

      pipeline = pipeline.composite([{ input: frameBuffer, blend: 'over' }]);
    }
  }

  await pipeline.jpeg({ quality: 85 }).toFile(outPath);
  return outPath;
}

/**
 * Save a base64 JPEG data-URL to disk as a plain JPEG file.
 * Returns the saved file path.
 */
export async function saveBase64Photo(dataUrl, filename) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const outPath = path.join(UPLOADS_DIR, filename);

  await sharp(buffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 92 })
    .toFile(outPath);

  return outPath;
}
