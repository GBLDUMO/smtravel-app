'use client';

import Field from '@/components/Field';

export default function Safari({ safari, setSafari }) {
  const s = safari || {};
  const set = (k) => (e) => setSafari({ ...s, [k]: e.target.value });

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Safari</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Park/Reserve">
          <input className="brand-input w-full" value={s.park || ''} onChange={set('park')} />
        </Field>
        <Field label="Date">
          <input type="date" className="brand-input w-full" value={s.safariDate || ''} onChange={set('safariDate')} />
        </Field>
      </div>
    </>
  );
}

