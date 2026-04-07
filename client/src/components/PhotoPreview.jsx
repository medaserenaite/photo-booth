import { useState } from 'react';
import { uploadPhoto } from '../lib/api.js';

export default function PhotoPreview({ image, frame, frames, onFrameChange, onRetake, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const { id } = await uploadPhoto(image, frame.slug);
      onConfirm(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-5">
      <div className="text-center animate-fade-in">
        <h2 className="step-title text-gradient">A worthy portrait! ⚓</h2>
        <p className="step-subtitle italic">Shall this portrait be added to the gallery?</p>
      </div>

      {/* Photo with frame overlay */}
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-2 ring-white/10">
        <img
          src={image}
          alt="Captured photo"
          className="w-full block"
          style={{ transform: 'scaleX(-1)' }} // match the mirrored preview
        />
        {frame && frame.slug !== 'none' && frame.thumbnail && (
          <img
            src={frame.thumbnail}
            alt={frame.label}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />
        )}
      </div>

      {/* Frame switcher at preview stage */}
      {frames && frames.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 max-w-3xl w-full hide-scrollbar">
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
      <div className="flex gap-4">
        <button className="btn-secondary" onClick={onRetake} disabled={loading}>
          🔄 Sit Again
        </button>
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
            '🗡️ Commission This Portrait'
          )}
        </button>
      </div>
    </div>
  );
}
