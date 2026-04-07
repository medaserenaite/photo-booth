// Uses the built-in Node.js SQLite module (available since Node 22.5)
// No native compilation required.
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'party-booth.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db;

export function initDB() {
  db = new DatabaseSync(DB_PATH);

  db.exec(`PRAGMA journal_mode = WAL`);
  db.exec(`PRAGMA foreign_keys = ON`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      original_path   TEXT    NOT NULL,
      composited_path TEXT,
      frame_used      TEXT    DEFAULT 'none',
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sms_log (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_id      INTEGER,
      phone_hash    TEXT    NOT NULL,
      status        TEXT    NOT NULL,
      error_message TEXT,
      sent_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (photo_id) REFERENCES photos(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const upsertIgnore  = db.prepare('INSERT OR IGNORE   INTO settings (key, value) VALUES (?, ?)');
  const upsertReplace = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  // If an env var is explicitly set, it always wins (overrides whatever is in the DB).
  // If no env var is set, fall back to INSERT OR IGNORE so admin-panel changes are preserved.
  function syncSetting(key, envValue, fallback) {
    // Only treat env var as "set" if it's a non-empty string
    if (envValue !== undefined && envValue !== null && envValue.trim() !== '') {
      upsertReplace.run(key, envValue.trim()); // env var present → overwrite DB
    } else {
      upsertIgnore.run(key, fallback);         // empty/absent → keep existing DB value or use fallback
    }
  }

  syncSetting('gallery_enabled', process.env.GALLERY_ENABLED,  'true');
  syncSetting('gallery_slug',    process.env.GALLERY_SLUG,     'party');
  syncSetting('event_name',      process.env.EVENT_NAME,       "Pop DeKegg's Tavern");
  syncSetting('booth_password',  process.env.BOOTH_PASSWORD,   '');

  console.log('Database ready:', DB_PATH);
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialised — call initDB() first');
  return db;
}

// ── Photos ────────────────────────────────────────────────────────────────────
export const photoQueries = {
  insert(originalPath, frameUsed = 'none') {
    const stmt = getDB().prepare(
      'INSERT INTO photos (original_path, frame_used) VALUES (?, ?)'
    );
    const r = stmt.run(originalPath, frameUsed);
    return r.lastInsertRowid;
  },

  updateComposited(id, compositedPath) {
    getDB()
      .prepare('UPDATE photos SET composited_path = ? WHERE id = ?')
      .run(compositedPath, id);
  },

  findById(id) {
    return getDB().prepare('SELECT * FROM photos WHERE id = ?').get(id);
  },

  findAll(limit = 20, offset = 0) {
    return getDB()
      .prepare('SELECT * FROM photos ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset);
  },

  count() {
    return getDB().prepare('SELECT COUNT(*) as c FROM photos').get().c;
  },

  deleteAll() {
    getDB().prepare('DELETE FROM photos').run();
  },
};

// ── SMS Log ───────────────────────────────────────────────────────────────────
export const smsQueries = {
  insert(photoId, phoneHash, status, errorMessage = null) {
    const r = getDB()
      .prepare(
        'INSERT INTO sms_log (photo_id, phone_hash, status, error_message) VALUES (?, ?, ?, ?)'
      )
      .run(photoId, phoneHash, status, errorMessage);
    return r.lastInsertRowid;
  },

  countByPhone(phoneHash) {
    return getDB()
      .prepare(
        "SELECT COUNT(*) as c FROM sms_log WHERE phone_hash = ? AND status = 'sent'"
      )
      .get(phoneHash).c;
  },

  totalSent() {
    return getDB()
      .prepare("SELECT COUNT(*) as c FROM sms_log WHERE status = 'sent'")
      .get().c;
  },

  uniquePhones() {
    return getDB()
      .prepare(
        "SELECT COUNT(DISTINCT phone_hash) as c FROM sms_log WHERE status = 'sent'"
      )
      .get().c;
  },

  deleteAll() {
    getDB().prepare('DELETE FROM sms_log').run();
  },
};

// ── Settings ─────────────────────────────────────────────────────────────────
export const settingsQueries = {
  get(key) {
    const row = getDB()
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(key);
    return row?.value ?? null;
  },

  set(key, value) {
    getDB()
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(key, String(value));
  },

  getAll() {
    const rows = getDB().prepare('SELECT key, value FROM settings').all();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
};
