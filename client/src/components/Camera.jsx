import { useEffect } from 'react';
import { useCamera } from '../hooks/useCamera.js';

export default function Camera({ frame, onCapture, onBack }) {
  const {
    videoRef,
    canvasRef,
    status,
    error,
    countdown,
    flash,
    startCamera,
    stopCamera,
    startCountdown,
  } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  async function handleCapture() {
    if (status !== 'ready') return;
    const dataUrl = await startCountdown();
    if (dataUrl) onCapture(dataUrl);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <h2 className="step-title text-gradient">Face the Portrait Artist</h2>

      {/* Camera container */}
      <div
        className="camera-container w-full max-w-4xl shadow-2xl shadow-black/80"
        style={{ boxShadow: '0 0 0 2px rgba(200,134,10,0.15), 0 20px 60px rgba(0,0,0,0.8)' }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <span className="text-5xl">🚫</span>
            <p className="text-red-400 text-lg font-semibold">{error}</p>
            <button className="btn-secondary" onClick={startCamera}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="camera-video" playsInline muted autoPlay />

            {frame && frame.slug !== 'none' && frame.thumbnail && (
              <img
                src={frame.thumbnail}
                alt={frame.label}
                className="camera-frame-overlay"
                draggable={false}
              />
            )}

            {flash && <div className="camera-flash" />}

            {countdown !== null && (
              <div className="countdown-number" key={countdown}>
                {countdown}
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

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-4 mt-2">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn-primary px-12 text-xl"
          onClick={handleCapture}
          disabled={status !== 'ready' || countdown !== null}
        >
          {countdown !== null ? `${countdown}…` : '🗡️ Capture Portrait'}
        </button>
      </div>

      <p className="text-amber-900/50 text-sm italic">
        Frame: <span className="text-amber-700/70">{frame.label}</span>
      </p>
    </div>
  );
}
