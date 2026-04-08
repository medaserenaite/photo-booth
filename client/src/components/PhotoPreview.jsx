import { useState } from 'react';
import { uploadPhoto } from '../lib/api.js';

export default function PhotoPreview({ images, frame, frames, onFrameChange, onRetake, onConfirm }) {
  // Local editable copy — user can delete individual shots here
  const [localImages, setLocalImages] = useState(images);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  function removePhoto(i) {
    setLocalImages(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        localImages.map(img => uploadPhoto(img, frame.slug))
      );
      onConfirm(results.map(r => r.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const count    = localImages.length;
  const isSingle = count === 1;
  const isEmpty  = count === 0;

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center animate-fade-in">
          <span className="text-6xl">🕯️</span>
          <h2 className="step-title text-gradient mt-4">All portraits removed</h2>
          <p className="step-subtitle italic">Sit again for a new session</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary" onClick={() => onRetake([])}>
            🔄 Retake All
          </button>
        </div>
      </div>
    );
  }

  // ── Normal preview ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-5">
      <div className="text-center animate-fade-in">
        <h2 className="step-title text-gradient">
          {isSingle ? 'A worthy portrait! ⚓' : `${count} worthy portraits! ⚓`}
        </h2>
        <p className="step-subtitle italic">
          Review {isSingle ? 'thy portrait' : 'thy portraits'} — remove any you'd like to retake
        </p>
      </div>

      {/* Photo strip */}
      <div className={`flex gap-4 w-full justify-center overflow-x-auto pb-1 ${isSingle ? 'max-w-3xl' : 'max-w-5xl'}`}>
        {localImages.map((image, i) => (
          <div
            key={i}
            className={`relative flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-2 ring-white/10 group ${
              isSingle ? 'w-full' : 'w-72'
            }`}
          >
            {/* Shot number badge */}
            {!isSingle && (
              <div className="absolute top-2 left-2 z-10 bg-black/60 text-amber-200 text-xs font-bold px-2 py-1 rounded-lg">
                #{i + 1}
              </div>
            )}

            <img
              src={image}
              alt={`Portrait ${i + 1}`}
              className="w-full block"
              style={{ transform: 'scaleX(-1)' }}
            />

            {frame && frame.slug !== 'none' && frame.thumbnail && (
              <img
                src={frame.thumbnail}
                alt={frame.label}
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
            )}

            {/* Remove button — appears on hover */}
            <button
              onClick={() => removePhoto(i)}
              disabled={loading}
              className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-red-900/90 text-white/70 hover:text-white font-bold w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-lg"
              title="Remove this photo"
            >
              ×
            </button>

            {/* Remove label on mobile (always visible) */}
            <button
              onClick={() => removePhoto(i)}
              disabled={loading}
              className="absolute bottom-0 inset-x-0 z-10 bg-black/60 hover:bg-red-900/80 text-white/60 hover:text-white text-xs font-semibold py-1.5 transition-all duration-150 sm:hidden"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Frame switcher */}
      {frames && frames.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 max-w-5xl w-full hide-scrollbar">
          {frames.map((f) => (
            <button
              key={f.slug}
              onClick={() => onFrameChange(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                ${frame.slug === f.slug
                  ? 'bg-party-pink/30 ring-2 ring-party-pink text-white'
                  : 'bg-white/5 ring-1 ring-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-xl">
          {error} — please try again.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Retake missing (shown when some photos were removed) */}
        {count < images.length && (
          <button
            className="btn-secondary"
            onClick={() => onRetake(localImages)}
            disabled={loading}
          >
            📸 Retake {images.length - count} Missing
          </button>
        )}

        {/* Retake all */}
        <button
          className="btn-secondary"
          onClick={() => onRetake([])}
          disabled={loading}
        >
          🔄 Retake All
        </button>

        {/* Confirm */}
        <button
          className="btn-primary px-10"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            `🗡️ Commission ${isSingle ? 'This Portrait' : 'These Portraits'}`
          )}
        </button>
      </div>
    </div>
  );
}
