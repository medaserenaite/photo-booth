import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  // Incremented each time startCamera is called; lets an async run detect it was superseded.
  const runIdRef = useRef(0);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Tag this invocation so we can detect if it was superseded (StrictMode, retries)
    const myRunId = ++runIdRef.current;

    setStatus('starting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // Another startCamera call fired while we were awaiting — discard this stream
      if (runIdRef.current !== myRunId) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for the browser to have enough data to play.
        // Using canplay + autoPlay avoids the Safari restriction on calling
        // play() from a non-user-gesture async context.
        await new Promise((resolve, reject) => {
          const video = videoRef.current;
          if (!video) return resolve();

          const onCanPlay = () => {
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError);
            resolve();
          };
          const onError = (e) => {
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError);
            reject(e);
          };

          // If already ready, resolve immediately
          if (video.readyState >= 3) {
            resolve();
          } else {
            video.addEventListener('canplay', onCanPlay);
            video.addEventListener('error', onError);
          }
        });

        // Fallback explicit play() — browsers that need it; suppress AbortError
        // from StrictMode double-invoke or autoPlay racing us.
        try {
          await videoRef.current?.play();
        } catch (playErr) {
          if (playErr.name !== 'AbortError') throw playErr;
        }
      }

      // Guard again after the async wait
      if (runIdRef.current !== myRunId) return;

      setStatus('ready');
    } catch (err) {
      if (runIdRef.current !== myRunId) return;

      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and refresh.'
          : err.name === 'NotFoundError'
          ? 'No camera found. Please connect a webcam and refresh.'
          : `Camera error: ${err.message}`;

      setError(msg);
      setStatus('error');
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const startCountdown = useCallback(() => {
    return new Promise((resolve) => {
      let count = 3;
      setCountdown(count);

      const tick = () => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          setTimeout(tick, 1000);
        } else {
          setCountdown(null);
          setFlash(true);
          setTimeout(() => setFlash(false), 400);
          resolve(captureFrame());
        }
      };

      setTimeout(tick, 1000);
    });
  }, [captureFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runIdRef.current++; // invalidate any in-flight startCamera
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    status,
    error,
    countdown,
    flash,
    startCamera,
    stopCamera,
    captureFrame,
    startCountdown,
  };
}
