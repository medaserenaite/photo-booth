import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGallery, fetchGalleryInfo } from '../lib/api.js';

const POLL_INTERVAL = 30_000;

export default function Gallery() {
  const { slug: slugParam } = useParams();
  const [slug, setSlug] = useState(slugParam ?? null);
  const [eventName, setEventName] = useState('The Tavern');
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (slug) return;
    fetchGalleryInfo()
      .then((d) => {
        if (d.enabled) setSlug(d.slug);
        else setError('The portrait gallery is currently closed.');
      })
      .catch(() => setError('Could not reach the gallery.'));
  }, [slug]);

  const loadPage = useCallback(
    async (pageNum, replace = false) => {
      if (!slug || loading) return;
      setLoading(true);
      try {
        const data = await fetchGallery(slug, pageNum, 20);
        setEventName(data.eventName ?? 'The Tavern');
        setPhotos((prev) => (replace ? data.photos : [...prev, ...data.photos]));
        setHasMore(data.hasMore);
        setPage(pageNum);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [slug, loading]
  );

  useEffect(() => {
    if (slug) loadPage(1, true);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      if (slug && !lightbox) loadPage(1, true);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [slug, lightbox, loadPage]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading) loadPage(page + 1); },
      { rootMargin: '200px' }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page, loadPage]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (error && !photos.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
        <span className="text-6xl animate-flicker">🕯️</span>
        <p className="text-red-400/80 text-lg italic">{error}</p>
        <Link to="/" className="btn-secondary">← Back to the Tavern</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0704' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b border-amber-900/20 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,7,4,0.85)' }}>
        <div>
          <h1 className="text-xl font-black text-gradient">🖼️ {eventName}</h1>
          <p className="text-amber-900/50 text-xs italic">
            {photos.length} portrait{photos.length !== 1 ? 's' : ''} · refreshes every 30s
          </p>
        </div>
        <Link to="/" className="btn-secondary text-sm px-4 py-2">
          ⚓ Booth
        </Link>
      </header>

      {/* Initial loading */}
      {initialLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl animate-flicker">🕯️</span>
            <p className="text-amber-900/50 text-sm italic">Lighting the lanterns…</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && photos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-6">
          <span className="text-7xl">🖼️</span>
          <p className="text-amber-200/40 text-xl italic">
            No portraits yet — be the first suspect!
          </p>
          <Link to="/" className="btn-primary">Enter the Tavern ⚓</Link>
        </div>
      )}

      {/* Masonry grid */}
      {photos.length > 0 && (
        <main className="flex-1 p-4">
          <div className="flex justify-center mb-6">
            <Link to="/?start=frame" className="btn-primary text-lg px-8 py-4">
              ⚓ Sit for Another Portrait
            </Link>
          </div>
          <div className="masonry-grid max-w-7xl mx-auto">
            {photos.map((photo) => (
              <GalleryPhoto key={photo.id} photo={photo} onClick={() => setLightbox(photo)} />
            ))}
          </div>

          <div ref={loaderRef} className="flex justify-center py-8">
            {loading && !initialLoading && (
              <span className="text-3xl animate-flicker">🕯️</span>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-amber-900/20 px-6 py-5 text-center text-amber-900/40 text-sm italic">
        Portrait Gallery · {eventName} ·{' '}
        <Link to="/" className="hover:text-amber-600/60 transition-colors">
          Sit for thy portrait →
        </Link>
      </footer>

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function GalleryPhoto({ photo, onClick }) {
  return (
    <div className="masonry-item group cursor-pointer" onClick={onClick}>
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(26,16,8,0.6)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          border: '1px solid rgba(200,134,10,0.08)',
        }}
      >
        <img
          src={photo.url}
          alt="Portrait"
          className="w-full block group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}>
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
            <span className="text-amber-200/70 text-xs italic">
              {new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-amber-400/60 text-xs">🔍 View</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose }) {
  function download() {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `portrait-${photo.id}.jpg`;
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Candlelight vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      <img
        src={photo.url}
        alt="Portrait"
        className="relative max-w-full max-h-[78vh] rounded-2xl object-contain"
        style={{ boxShadow: '0 0 60px rgba(200,134,10,0.15), 0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="relative flex gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
        <button className="btn-primary" onClick={download}>
          ⬇️ Save Portrait
        </button>
        <button className="btn-secondary" onClick={onClose}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}
