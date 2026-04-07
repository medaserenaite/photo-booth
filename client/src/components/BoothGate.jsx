import { useState, useRef } from 'react';
import { verifyBoothPassword } from '../lib/api.js';

export default function BoothGate({ eventName, onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await verifyBoothPassword(password);
      sessionStorage.setItem('booth_authed', 'true');
      onUnlock();
    } catch (err) {
      setError(err.status === 401 ? 'The password is incorrect. Try again.' : err.message);
      setShake(true);
      setPassword('');
      setTimeout(() => {
        setShake(false);
        inputRef.current?.focus();
      }, 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-900/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-900/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7 animate-fade-in">

        {/* Candles + skull header */}
        <div className="flex items-center gap-4 text-4xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-5xl">🏴‍☠️</span>
          <span className="animate-flicker" style={{ animationDelay: '1.1s' }}>🕯️</span>
        </div>

        {/* Event title */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient leading-tight">{eventName}</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/40 text-sm mt-3 italic">
            "State thy allegiance to enter the tavern."
          </p>
        </div>

        {/* Password form */}
        <form
          onSubmit={handleSubmit}
          className={`card p-8 w-full flex flex-col gap-4 ${shake ? 'shake' : ''}`}
        >
          <label className="text-amber-200/50 text-xs uppercase tracking-widest text-center font-bold">
            🗝️ Secret Password
          </label>

          <input
            ref={inputRef}
            type="password"
            placeholder="············"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            disabled={loading}
            autoFocus
            className={`
              w-full rounded-xl px-5 py-4
              text-amber-100 text-xl text-center tracking-[0.4em]
              placeholder:text-amber-900/40 placeholder:tracking-normal
              focus:outline-none transition-all duration-200
              bg-black/30 border
              ${error
                ? 'border-red-700/60 focus:ring-2 focus:ring-red-700/40'
                : 'border-amber-900/30 focus:border-amber-600/50 focus:ring-2 focus:ring-amber-700/20'
              }
            `}
          />

          {error && (
            <p className="text-red-400/80 text-sm text-center italic">{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-lg mt-1"
            disabled={!password.trim() || loading}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-amber-200/20 border-t-amber-200/70 rounded-full animate-spin" />
                Checking…
              </>
            ) : (
              'Enter the Tavern ⚓'
            )}
          </button>
        </form>

        <a href="/gallery" className="text-amber-900/50 text-sm hover:text-amber-600/70 transition-colors italic">
          View the portrait gallery →
        </a>
      </div>

      <style>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-10px); }
          40%       { transform: translateX(10px); }
          60%       { transform: translateX(-7px); }
          80%       { transform: translateX(7px); }
        }
      `}</style>
    </div>
  );
}
