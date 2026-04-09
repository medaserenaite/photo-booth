import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import Camera from './components/Camera.jsx';
import FrameSelector from './components/FrameSelector.jsx';
import PhotoPreview from './components/PhotoPreview.jsx';
// import PhoneInput from './components/PhoneInput.jsx';
// import SuccessScreen from './components/SuccessScreen.jsx';
import Gallery from './components/Gallery.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import BoothGate from './components/BoothGate.jsx';
import { fetchBoothConfig } from './lib/api.js';

// ── Available frames ──────────────────────────────────────────────────────────
const FRAMES = [
  { slug: 'none',              label: 'No Frame',        thumbnail: null },
  // { slug: 'gold-party',        label: 'Gold Trim',       thumbnail: '/frames/gold-party.png' },
  { slug: 'neon-glow',         label: 'Cursed Glow',     thumbnail: '/frames/neon-glow.png' },
  { slug: 'classic-polaroid',  label: 'Wanted Poster',   thumbnail: '/frames/classic-polaroid.png' },
  { slug: 'jolly-roger',       label: 'Jolly Roger',     thumbnail: '/frames/jolly-roger.png' },
  { slug: 'rum-barrel',        label: 'Rum & Riches',    thumbnail: '/frames/rum-barrel.png' },
  { slug: 'sea-voyage',        label: 'Sea Voyage',      thumbnail: '/frames/sea-voyage.png' },
  { slug: 'ships-wheel',       label: "Ship's Wheel",    thumbnail: '/frames/ships-wheel.png' },
  { slug: 'tavern-sign',       label: 'Tavern Sign',     thumbnail: '/frames/tavern-sign.png' },
  { slug: 'treasure-map',      label: 'Treasure Map',    thumbnail: '/frames/treasure-map.png' },
  { slug: 'blacksmith',        label: 'The Forge',       thumbnail: '/frames/blacksmith.png' },
];

// ── Main booth (password gate + flow) ────────────────────────────────────────
function Booth() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [step, setStep] = useState('welcome');
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [capturedImages, setCapturedImages] = useState([]);
  // const [photoIds, setPhotoIds] = useState([]);

  useEffect(() => {
    fetchBoothConfig().then((cfg) => {
      setConfig(cfg);
      if (!cfg.passwordRequired || sessionStorage.getItem('booth_authed') === 'true') {
        setAuthed(true);
      }
    }).catch(() => {
      setConfig({ eventName: 'Murder at the Tavern', passwordRequired: false });
      setAuthed(true);
    });
  }, []);

  const goToWelcome = useCallback(() => {
    setStep('welcome');
    setCapturedImages([]);
    setSelectedFrame(FRAMES[0]);
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl animate-flicker">🕯️</div>
      </div>
    );
  }

  if (!authed) {
    return <BoothGate eventName={config.eventName} onUnlock={() => setAuthed(true)} />;
  }

  if (step === 'welcome') {
    return <WelcomeScreen eventName={config.eventName} onStart={() => setStep('frame')} />;
  }

  if (step === 'frame') {
    return (
      <FrameSelector
        frames={FRAMES}
        selected={selectedFrame}
        onSelect={setSelectedFrame}
        onNext={() => setStep('camera')}
        onBack={goToWelcome}
      />
    );
  }

  if (step === 'camera') {
    return (
      <Camera
        frame={selectedFrame}
        initialShots={capturedImages}
        onCapture={(images) => { setCapturedImages(images); setStep('preview'); }}
        onBack={() => { setCapturedImages([]); setStep('frame'); }}
      />
    );
  }

  if (step === 'preview') {
    return (
      <PhotoPreview
        images={capturedImages}
        frame={selectedFrame}
        frames={FRAMES}
        onFrameChange={setSelectedFrame}
        onRetake={(remaining) => { setCapturedImages(remaining); setStep('camera'); }}
        onConfirm={() => navigate('/gallery')}
      />
    );
  }

  // if (step === 'phone') {
  //   return (
  //     <PhoneInput
  //       photoIds={photoIds}
  //       onSuccess={() => setStep('success')}
  //       onBack={() => setStep('preview')}
  //     />
  //   );
  // }

  // if (step === 'success') {
  //   return <SuccessScreen onRestart={goToWelcome} />;
  // }

  return null;
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ eventName, onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="relative z-10 animate-fade-in flex flex-col items-center gap-6 max-w-lg">
        {/* Candles flanking skull */}
        <div className="flex items-center gap-6 text-5xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-6xl">💀</span>
          <span className="animate-flicker" style={{ animationDelay: '0.7s' }}>🕯️</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight text-gradient">
            {eventName}
          </h1>
          <div className="divider-rune mt-3">⚓</div>
        </div>

        <p className="text-amber-200/50 text-lg italic">
          "Every suspect deserves a portrait."
        </p>

        <button
          className="btn-primary text-xl px-14 py-5 rounded-2xl glow-gold"
          onClick={onStart}
        >
          🗡️ Take Thy Portrait
        </button>

        <div className="flex items-center gap-6 text-amber-900/60 text-sm mt-2">
          <a href="/gallery" className="hover:text-amber-400/70 transition-colors">
            🖼️ Portrait Gallery
          </a>
          <span>·</span>
          <a href="/admin" className="hover:text-amber-400/70 transition-colors">
            ⚙️ Innkeeper
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Router root ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Booth />} />
      <Route path="/gallery/:slug" element={<Gallery />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}
