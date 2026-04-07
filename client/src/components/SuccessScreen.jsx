import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { fetchGalleryInfo } from '../lib/api.js';

const AUTO_RESTART_SEC = 10;

export default function SuccessScreen({ onRestart }) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESTART_SEC);
  const [gallerySlug, setGallerySlug] = useState(null);

  useEffect(() => {
    fetchGalleryInfo()
      .then((d) => d.enabled && setGallerySlug(d.slug))
      .catch(() => {});
  }, []);

  // Gold coin / ember confetti burst
  useEffect(() => {
    const end = Date.now() + 2500;
    const colors = ['#C8860A', '#F4D03F', '#8B1A1A', '#D4570C', '#f5e6c8'];

    function burst() {
      confetti({ particleCount: 50, angle: 60,  spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(burst);
    }

    burst();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) { onRestart(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onRestart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 animate-fade-in">
      <div className="text-8xl animate-bounce-slow">🦅</div>

      <div>
        <h2 className="text-4xl md:text-6xl font-black text-gradient mb-3">
          Portrait Dispatched!
        </h2>
        <p className="text-xl text-amber-200/60 italic">
          Thy raven is on its way — check thy phone. 🕯️
        </p>
      </div>

      {gallerySlug && (
        <div className="card px-8 py-5 flex flex-col items-center gap-2">
          <p className="text-amber-200/40 text-sm italic">View all portraits at:</p>
          <a
            href={`/gallery/${gallerySlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 text-lg font-bold hover:underline"
          >
            {window.location.host}/gallery/{gallerySlug}
          </a>
        </div>
      )}

      {/* Countdown ring */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-16">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke="rgba(200,134,10,0.1)" strokeWidth="5" fill="none" />
            <circle
              cx="32" cy="32" r="28"
              stroke="#C8860A"
              strokeWidth="5"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - secondsLeft / AUTO_RESTART_SEC)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-amber-200">
            {secondsLeft}
          </span>
        </div>
        <p className="text-amber-900/50 text-sm italic">Returning to the tavern in {secondsLeft}s</p>
      </div>

      <button className="btn-primary" onClick={onRestart}>
        🗡️ Capture Another Suspect
      </button>
    </div>
  );
}
