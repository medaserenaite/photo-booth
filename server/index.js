import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDB } from './services/db.js';
import boothRouter from './routes/booth.js';
import photosRouter from './routes/photos.js';
import smsRouter from './routes/sms.js';
import galleryRouter from './routes/gallery.js';
import adminRouter from './routes/admin.js';

// Load .env from project root (one level up from server/)
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: isProd ? false : true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded / composited photos (public URL for Twilio MMS)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frame PNGs from project-root frames/ directory
app.use('/frames', express.static(path.join(__dirname, '..', 'frames')));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/booth', boothRouter);
app.use('/api/photos', photosRouter);
app.use('/api/sms', smsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Serve built React app in production ─────────────────────────────────────
if (isProd) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(clientDist, 'index.html'))
  );
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
initDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 Party Booth running → http://localhost:${PORT}`);
  if (!isProd) {
    console.log(`   API       → http://localhost:${PORT}/api`);
    console.log(`   Client dev → http://localhost:5173\n`);
  }
});
