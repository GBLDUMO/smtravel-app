'use client';

/**
 * Pill-style option picker (replaces a <select> visually).
 * Calls onChange with a select-like event: { target: { value } },
 * so existing handlers keep working unchanged.
 */
export default function Segmented({ label, value, options, onChange, variant = 'pill' }) {
  const isTiles = variant === 'tiles';
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium" style={{ color: '#2A3346' }}>{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className={isTiles ? 'grid grid-cols-2 gap-3 sm:grid-cols-4' : 'inline-flex flex-wrap gap-1 self-start rounded-full p-1'}
        style={isTiles ? undefined : { background: '#EEF1F8' }}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          if (isTiles) {
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ target: { value: opt.value } })}
                className="min-h-[56px] rounded-xl text-[15px] transition-colors"
                style={{
                  border: selected ? '2px solid #0E1E4A' : '1px solid #CDD4E1',
                  background: selected ? '#EEF1F8' : '#FFFFFF',
                  color: selected ? '#0E1E4A' : '#2A3346',
                  fontWeight: selected ? 600 : 500,
                }}
              >
                {opt.label}
              </button>
            );
          }
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ target: { value: opt.value } })}
              className="min-h-[40px] rounded-full px-5 text-sm transition-colors"
              style={{
                background: selected ? '#FFFFFF' : 'transparent',
                color: selected ? '#0E1E4A' : '#4F596C',
                fontWeight: selected ? 600 : 500,
                boxShadow: selected ? '0 1px 3px rgba(14,30,74,0.15)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
