'use client';

import Field from '@/components/Field';

export default function AirportTransfer({ transfer, flightsTo, setTransfer }) {
  const t = transfer || {};
  const set = (k) => (e) => setTransfer({ ...t, [k]: e.target.value });

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Airport Transfer</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="From">
          <input className="brand-input w-full" value={t.tFrom || flightsTo || ''} onChange={set('tFrom')} placeholder="Defaults to your flight destination" />
        </Field>
        <Field label="To (City/Hotel)">
          <input className="brand-input w-full" value={t.tTo || ''} onChange={set('tTo')} placeholder="City or hotel name" />
        </Field>
        <Field label="Date">
          <input type="date" className="brand-input w-full" value={t.tDate || ''} onChange={set('tDate')} />
        </Field>
        <Field label="Transfer type">
          <select className="brand-input w-full" value={t.tType || 'One way'} onChange={set('tType')}>
            <option>One way</option>
            <option>Return</option>
          </select>
        </Field>
      </div>
    </>
  );
}
