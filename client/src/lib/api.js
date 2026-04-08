const BASE = '/api';

// ── Booth ─────────────────────────────────────────────────────────────────────
export const fetchBoothConfig = () => request('GET', '/booth/config');
export const verifyBoothPassword = (password) =>
  request('POST', '/booth/verify', { password });

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Photos ────────────────────────────────────────────────────────────────────
export const uploadPhoto = (image, frame) =>
  request('POST', '/photos', { image, frame });

// ── SMS ───────────────────────────────────────────────────────────────────────
export const sendSMS = (photoIds, phone) =>
  request('POST', '/sms/send', { photoIds: Array.isArray(photoIds) ? photoIds : [photoIds], phone });

// ── Gallery ───────────────────────────────────────────────────────────────────
export const fetchGalleryInfo = () =>
  request('GET', '/gallery');

export const fetchGallery = (slug, page = 1, limit = 20) =>
  request('GET', `/gallery/${slug}?page=${page}&limit=${limit}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
function adminHeaders(password) {
  return { 'Content-Type': 'application/json', 'x-admin-password': password };
}

async function adminRequest(method, path, password, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: adminHeaders(password),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const adminLogin = (password) =>
  request('POST', '/admin/login', { password });

export const fetchAdminStats = (pw) =>
  adminRequest('GET', '/admin/stats', pw);

export const fetchAdminPhotos = (pw, page = 1) =>
  adminRequest('GET', `/admin/photos?page=${page}`, pw);

export const adminResend = (pw, photoId, phone) =>
  adminRequest('POST', '/admin/resend', pw, { photoId, phone });

export const fetchAdminSettings = (pw) =>
  adminRequest('GET', '/admin/settings', pw);

export const saveAdminSettings = (pw, settings) =>
  adminRequest('POST', '/admin/settings', pw, settings);

export const clearSession = (pw) =>
  adminRequest('POST', '/admin/clear-session', pw);

export const getDownloadZipUrl = () => `${BASE}/admin/download-zip`;
