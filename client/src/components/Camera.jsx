import { useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera.js';

const MAX_SHOTS = 3;
const TIMER_OPTIONS = [3, 5, 10];
const AUTO_PAUSE_MS = 2000;

export default function Camera({ frame, onCapture, onBack, initialShots = [] }) {
  const {
    videoRef, canvasRef, status, error,
    countdown, flash, startCamera, stopCamera, startCountdown,
  } = useCamera();

  const [shots, setShots]             = useState(initialShots);
  const [timerLength, setTimerLength] = useState(3);
  const [autoRestart, setAutoRestart] = useState(true);
  const [capturing, setCapturing]     = useState(false);
  const [gettingReady, setGettingReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  async function handleCapture() {
    if (status !== 'ready' || capturing) return;
    setCapturing(true);

    let currentShots = [...shots];

    while (currentShots.length < MAX_SHOTS) {
      const dataUrl = await startCountdown(timerLength);
      if (dataUrl) {
        currentShots = [...currentShots, dataUrl];
        setShots(currentShots);
      }

      if (!autoRestart || currentShots.length >= MAX_SHOTS) break;

      setGettingReady(true);
      await new Promise(r => setTimeout(r, AUTO_PAUSE_MS));
      setGettingReady(false);
    }

    setCapturing(false);

    // Auto-advance to review when all slots are filled
    if (currentShots.length >= MAX_SHOTS) {
      onCapture(currentShots);
    }
  }

  function removeShot(i) {
    setShots(prev => prev.filter((_, idx) => idx !== i));
  }

  const canCapture = status === 'ready' && !capturing && shots.length < MAX_SHOTS;
  const remaining  = MAX_SHOTS - shots.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <h2 className="step-title text-gradient">Face the Portrait Artist</h2>

      {/* Camera + shot strip */}
      <div className="flex gap-4 w-full max-w-5xl items-start">

        {/* Viewfinder */}
        <div
          className="flex-1 min-w-0 camera-container shadow-2xl shadow-black/80"
          style={{ boxShadow: '0 0 0 2px rgba(200,134,10,0.15), 0 20px 60px rgba(0,0,0,0.8)' }}
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <span className="text-5xl">🚫</span>
              <p className="text-red-400 text-lg font-semibold">{error}</p>
              <button className="btn-secondary" onClick={startCamera}>Try Again</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="camera-video" playsInline muted autoPlay />

              {frame && frame.slug !== 'none' && frame.thumbnail && (
                <img src={frame.thumbnail} alt={frame.label} className="camera-frame-overlay" draggable={false} />
              )}

              {flash && <div className="camera-flash" />}

              {countdown !== null && (
                <div className="countdown-number" key={countdown}>{countdown}</div>
              )}

              {gettingReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl animate-pulse">📸</span>
                    <span className="text-amber-200/80 text-lg font-semibold italic">Get ready…</span>
                  </div>
                </div>
              )}

              {status === 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl animate-flicker">🕯️</span>
                    <span className="text-amber-200/60 text-sm italic">Preparing the portrait room…</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Shot strip */}
        <div className="flex flex-col gap-3 w-28 flex-shrink-0 pt-1">
          {Array.from({ length: MAX_SHOTS }, (_, i) => {
            const shot = shots[i];
            return shot ? (
              <div key={i} className="relative rounded-xl overflow-hidden ring-2 ring-amber-500/60 shadow-lg">
                <img src={shot} alt={`Shot ${i + 1}`} className="w-full block" style={{ transform: 'scaleX(-1)' }} />
                {frame && frame.slug !== 'none' && frame.thumbnail && (
                  <img src={frame.thumbnail} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none" />
                )}
                <div className="absolute top-1 left-1 bg-black/60 text-amber-200 text-xs font-bold px-1.5 py-0.5 rounded-md">
                  #{i + 1}
                </div>
                {!capturing && (
                  <button
                    onClick={() => removeShot(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-900/80 text-white/70 hover:text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div
                key={i}
                className="aspect-video rounded-xl flex items-center justify-center"
                style={{ border: '2px dashed rgba(200,134,10,0.2)', background: 'rgba(0,0,0,0.3)' }}
              >
                <span className="text-amber-900/50 text-xs font-medium">#{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Settings row */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-amber-200/50 font-medium">⏱ Timer:</span>
          <div className="flex gap-1">
            {TIMER_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setTimerLength(s)}
                disabled={capturing}
                className="px-3 py-1 rounded-lg font-semibold transition-all duration-150"
                style={{
                  background: timerLength === s ? 'rgba(200,134,10,0.35)' : 'rgba(255,255,255,0.05)',
                  boxShadow:  timerLength === s ? '0 0 0 1.5px rgba(200,134,10,0.7)' : '0 0 0 1px rgba(255,255,255,0.08)',
                  color:      timerLength === s ? '#f5e6c8' : 'rgba(245,230,200,0.4)',
                }}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <span className="text-amber-900/30 hidden sm:block">·</span>

        <div className="flex items-center gap-2">
          <span className="text-amber-200/50 font-medium">📷 Mode:</span>
          <div className="flex gap-1">
            {[{ value: true, label: '⟳ Auto' }, { value: false, label: '▶ Manual' }].map(({ value, label }) => (
              <button
                key={label}
                onClick={() => setAutoRestart(value)}
                disabled={capturing}
                className="px-3 py-1 rounded-lg font-semibold transition-all duration-150"
                style={{
                  background: autoRestart === value ? 'rgba(200,134,10,0.35)' : 'rgba(255,255,255,0.05)',
                  boxShadow:  autoRestart === value ? '0 0 0 1.5px rgba(200,134,10,0.7)' : '0 0 0 1px rgba(255,255,255,0.08)',
                  color:      autoRestart === value ? '#f5e6c8' : 'rgba(245,230,200,0.4)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button className="btn-secondary" onClick={onBack} disabled={capturing}>← Back</button>

        <button
          className="btn-primary px-10 text-lg"
          onClick={handleCapture}
          disabled={!canCapture}
        >
          {shots.length >= MAX_SHOTS
            ? '✓ All Shots Taken'
            : `🗡️ Shot ${shots.length + 1} of ${MAX_SHOTS}`}
        </button>

        {shots.length > 0 && !capturing && (
          <button
            className="btn-primary px-8 text-lg"
            onClick={() => onCapture(shots)}
            style={{ background: 'rgba(20,140,60,0.25)', boxShadow: '0 0 0 1px rgba(40,200,80,0.3)' }}
          >
            ✓ Use {shots.length} {shots.length === 1 ? 'Photo' : 'Photos'} →
          </button>
        )}
      </div>

      <p className="text-amber-900/50 text-sm italic">
        Frame: <span className="text-amber-700/70">{frame.label}</span>
        {shots.length > 0 && remaining > 0 && (
          <span className="text-amber-700/50 ml-3">· {remaining} more available</span>
        )}
      </p>
    </div>
  );
}
