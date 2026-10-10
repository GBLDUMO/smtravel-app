'use client';

import Field from '@/components/Field';
import Segmented from '@/components/Segmented';

const TRANSFER_TYPES = [
  { value: 'One way', label: 'One way' },
  { value: 'Return', label: 'Return' },
];

export default function AirportTransfer({ transfer, flightsTo, setTransfer }) {
  const t = transfer || {};
  const set = (k) => (e) => setTransfer({ ...t, [k]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label="Transfer type"
        value={t.tType || 'One way'}
        options={TRANSFER_TYPES}
        onChange={set('tType')}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="From">
          <input
            className="brand-input w-full"
            value={t.tFrom || flightsTo || ''}
            onChange={set('tFrom')}
            placeholder="Defaults to your flight destination"
          />
        </Field>
        <Field label="To (city or hotel)">
          <input
            className="brand-input w-full"
            value={t.tTo || ''}
            onChange={set('tTo')}
            placeholder="City or hotel name"
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            className="brand-input w-full"
            value={t.tDate || ''}
            onChange={set('tDate')}
          />
        </Field>
      </div>
    </div>
  );
}
