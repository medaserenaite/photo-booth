import { useState, useEffect } from 'react';
import {
  adminLogin,
  fetchAdminStats,
  fetchAdminPhotos,
  adminResend,
  fetchAdminSettings,
  saveAdminSettings,
  clearSession,
  getDownloadZipUrl,
} from '../lib/api.js';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      await adminLogin(password);
      setAuthed(true);
    } catch {
      setLoginError('Wrong password.');
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card p-10 w-full max-w-sm flex flex-col gap-5 text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-party-purple text-lg"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" className="btn-primary">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard password={password} />;
}

function AdminDashboard({ password }) {
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [resendPhone, setResendPhone] = useState('');
  const [resendPhotoId, setResendPhotoId] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const [clearing, setClearing] = useState(false);

  async function load() {
    const [s, p, cfg] = await Promise.all([
      fetchAdminStats(password),
      fetchAdminPhotos(password, page),
      fetchAdminSettings(password),
    ]);
    setStats(s);
    setPhotos(p.photos);
    setTotal(p.total);
    setSettings(cfg);
  }

  useEffect(() => { load(); }, [page]); // eslint-disable-line

  async function handleSaveSettings(e) {
    e.preventDefault();
    await saveAdminSettings(password, settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  async function handleResend(e) {
    e.preventDefault();
    if (!resendPhotoId || !resendPhone) return;
    try {
      await adminResend(password, resendPhotoId, resendPhone);
      setResendMsg('Sent!');
    } catch (err) {
      setResendMsg(`Error: ${err.message}`);
    }
    setTimeout(() => setResendMsg(null), 3000);
  }

  async function handleClearSession() {
    if (!confirm('Delete all session data? This cannot be undone.')) return;
    setClearing(true);
    await clearSession(password);
    await load();
    setClearing(false);
  }

  return (
    <div className="min-h-screen bg-party-bg p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gradient">⚙️ Admin Panel</h1>
        <a href="/" className="btn-secondary text-sm px-4 py-2">← Booth</a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Photos" value={stats.totalPhotos} icon="📸" />
          <StatCard label="SMS Sent" value={stats.totalSent} icon="📤" />
          <StatCard label="Unique Phones" value={stats.uniquePhones} icon="📱" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Settings */}
        {settings && (
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Event Settings</h2>
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-white/60 block mb-1">Event Name</label>
                <input
                  type="text"
                  value={settings.event_name ?? ''}
                  onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-party-purple"
                  placeholder="Pop DeKegg's Tavern"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">
                  Booth Password
                  <span className="ml-2 text-white/30 font-normal">(leave blank for no password)</span>
                </label>
                <input
                  type="password"
                  value={settings.booth_password ?? ''}
                  onChange={(e) => setSettings({ ...settings, booth_password: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-party-purple"
                  placeholder="e.g. partytime2024"
                  autoComplete="off"
                />
              </div>
              <hr className="border-white/10" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-party-purple"
                  checked={settings.gallery_enabled === 'true'}
                  onChange={(e) =>
                    setSettings({ ...settings, gallery_enabled: String(e.target.checked) })
                  }
                />
                <span>Gallery Enabled</span>
              </label>
              <div>
                <label className="text-sm text-white/60 block mb-1">Gallery Slug</label>
                <input
                  type="text"
                  value={settings.gallery_slug ?? ''}
                  onChange={(e) => setSettings({ ...settings, gallery_slug: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-party-purple"
                  placeholder="jakes-party"
                />
              </div>
              <button type="submit" className="btn-primary">
                {settingsSaved ? '✓ Saved!' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

        {/* Actions */}
        <div className="card p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Actions</h2>

          {/* Resend */}
          <form onSubmit={handleResend} className="flex flex-col gap-2">
            <label className="text-sm text-white/60">Resend Photo</label>
            <input
              type="number"
              placeholder="Photo ID"
              value={resendPhotoId ?? ''}
              onChange={(e) => setResendPhotoId(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-party-purple"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={resendPhone}
              onChange={(e) => setResendPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-party-purple"
            />
            <button type="submit" className="btn-secondary">📤 Resend</button>
            {resendMsg && <p className="text-sm text-party-cyan">{resendMsg}</p>}
          </form>

          <hr className="border-white/10" />

          {/* Download zip — password passed as query param since headers aren't possible for <a> downloads */}
          <a
            href={`/api/admin/download-zip?pw=${encodeURIComponent(password)}`}
            download="party-photos.zip"
            className="btn-secondary text-center"
          >
            ⬇️ Download All Photos (ZIP)
          </a>

          {/* Clear session */}
          <button
            className="btn-danger"
            onClick={handleClearSession}
            disabled={clearing}
          >
            {clearing ? '…' : '🗑️ Clear Session'}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Photos ({total})</h2>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm px-4 py-2"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="flex items-center px-3 text-white/60 text-sm">p.{page}</span>
            <button
              className="btn-secondary text-sm px-4 py-2"
              onClick={() => setPage((p) => p + 1)}
              disabled={photos.length < 20}
            >
              Next →
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="text-white/40 text-center py-8">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <img
                  src={photo.url}
                  alt={`Photo ${photo.id}`}
                  className="w-full aspect-video object-cover rounded-xl ring-1 ring-white/10 group-hover:ring-party-pink/40 transition-all"
                  loading="lazy"
                />
                <div className="absolute top-1 left-1 bg-black/60 text-white/60 text-xs px-2 py-0.5 rounded-full">
                  #{photo.id}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                  <button
                    className="text-xs bg-party-purple/80 text-white px-2 py-1 rounded-lg"
                    onClick={() => setResendPhotoId(photo.id)}
                  >
                    Resend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-5 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-gradient">{value ?? '–'}</div>
      <div className="text-white/50 text-sm mt-1">{label}</div>
    </div>
  );
}
