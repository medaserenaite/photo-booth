export default function FrameSelector({ frames, selected, onSelect, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">
      <div className="text-center animate-fade-in">
        <h2 className="step-title text-gradient">Choose Thy Border</h2>
        <p className="step-subtitle italic">Select a frame for thy portrait</p>
      </div>

      {/* Frame thumbnail row */}
      <div className="flex gap-4 pb-2 w-full max-w-3xl hide-scrollbar px-2 flex-wrap justify-center">
        {frames.map((frame) => (
          <FrameThumb
            key={frame.slug}
            frame={frame}
            isSelected={selected.slug === frame.slug}
            onSelect={() => onSelect(frame)}
          />
        ))}
      </div>

      {/* Selected label */}
      <div className="card px-6 py-3 text-amber-200/60 text-sm italic">
        Selected: <span className="text-amber-200 font-semibold not-italic">{selected.label}</span>
      </div>

      <div className="flex gap-4">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary px-12" onClick={onNext}>
          Next: Sit for Portrait →
        </button>
      </div>
    </div>
  );
}

function FrameThumb({ frame, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-200"
      style={{
        transform: isSelected ? 'scale(1.06)' : 'scale(1)',
        background: isSelected ? 'rgba(200,134,10,0.12)' : 'rgba(255,255,255,0.03)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(200,134,10,0.6), 0 4px 16px rgba(200,134,10,0.2)'
          : '0 0 0 1px rgba(200,134,10,0.1)',
      }}
    >
      {frame.thumbnail ? (
        <div className="relative w-28 h-16 rounded-xl overflow-hidden">
          {/* Aged parchment backing behind the frame */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #3d2b1f 0%, #1a1008 100%)' }} />
          <img
            src={frame.thumbnail}
            alt={frame.label}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-28 h-16 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(10,7,4,0.6)', border: '2px dashed rgba(200,134,10,0.2)' }}>
          <span className="text-2xl opacity-60">🚫</span>
        </div>
      )}
      <span className="text-xs font-medium whitespace-nowrap"
        style={{ color: isSelected ? '#f5e6c8' : 'rgba(245,230,200,0.5)' }}>
        {frame.label}
      </span>
    </button>
  );
}
