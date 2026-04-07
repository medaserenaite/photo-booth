import { useState, useRef } from 'react';
import { sendSMS } from '../lib/api.js';

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhone(formatted) {
  return formatted.replace(/\D/g, '').length === 10;
}

export default function PhoneInput({ photoId, onSuccess, onBack }) {
  const [display, setDisplay] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  function handleChange(e) {
    setError(null);
    setDisplay(formatPhone(e.target.value));
  }

  async function handleSend() {
    if (!isValidPhone(display)) {
      setError('Please enter a valid 10-digit US phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendSMS(photoId, display);
      onSuccess();
    } catch (err) {
      if (err.status === 429) {
        setError('Maximum dispatches reached for this session.');
      } else {
        setError(err.message ?? 'Failed to send. Check Twilio credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && isValidPhone(display)) handleSend();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4 animate-flicker">🦅</div>
        <h2 className="step-title text-gradient">Dispatch by Raven</h2>
        <p className="step-subtitle italic">To whom shall we deliver thy portrait?</p>
      </div>

      <div className="card p-8 w-full max-w-md flex flex-col gap-5 animate-slide-up">
        <div>
          <label className="block text-amber-200/50 text-sm font-bold mb-2 uppercase tracking-widest">
            📜 Summoning Number
          </label>
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            placeholder="(555) 123-4567"
            value={display}
            onChange={handleChange}
            onKeyDown={handleKey}
            disabled={loading}
            className={`
              w-full bg-black/30 border rounded-2xl px-5 py-4
              text-amber-100 text-2xl font-bold tracking-widest
              placeholder:text-amber-900/30 placeholder:font-normal placeholder:tracking-normal
              focus:outline-none transition-all duration-200
              ${error
                ? 'border-red-700/60 focus:ring-2 focus:ring-red-700/30'
                : 'border-amber-900/30 focus:border-amber-600/50 focus:ring-2 focus:ring-amber-700/20'
              }
            `}
            autoComplete="tel"
            autoFocus
          />
          {error && <p className="text-red-400/80 text-sm mt-2 italic">{error}</p>}
        </div>

        <p className="text-amber-900/40 text-xs text-center italic">
          Thy number is never stored. One portrait dispatched per request.
        </p>

        <button
          className="btn-primary w-full text-xl"
          onClick={handleSend}
          disabled={!isValidPhone(display) || loading}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-amber-200/20 border-t-amber-200/70 rounded-full animate-spin" />
              Dispatching…
            </>
          ) : (
            '🦅 Send My Portrait!'
          )}
        </button>

        <button className="btn-secondary w-full" onClick={onBack} disabled={loading}>
          ← Back
        </button>
      </div>
    </div>
  );
}
