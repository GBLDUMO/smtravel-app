'use client';

import Field from '@/components/Field';
import Segmented from '@/components/Segmented';

const CAR_TYPES = ['Small', 'Mid', 'Luxury', 'Large'].map((v) => ({ value: v, label: v }));

export default function CarHire({ car, setCar }) {
  const c = car || {};
  const set = (k) => (e) => setCar({ ...c, [k]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pickup location">
          <input
            className="brand-input w-full"
            value={c.carPickup || ''}
            onChange={set('carPickup')}
            placeholder="Defaults to your flight destination"
          />
        </Field>

        <Field label="Return location">
          <input
            className="brand-input w-full"
            value={c.carReturn || ''}
            onChange={set('carReturn')}
            placeholder="Same as pickup (editable)"
          />
        </Field>

        <Field label="Pickup date">
          <input
            type="date"
            className="brand-input w-full"
            value={c.carPickupDate || ''}
            onChange={set('carPickupDate')}
          />
        </Field>

        <Field label="Return date">
          <input
            type="date"
            className="brand-input w-full"
            value={c.carReturnDate || ''}
            onChange={set('carReturnDate')}
          />
        </Field>
      </div>

      <Segmented
        label="Car type"
        variant="tiles"
        value={c.carType || ''}
        options={CAR_TYPES}
        onChange={set('carType')}
      />

      <Field label={<span>Notes <span className="font-normal" style={{ color: '#6B7486' }}>(optional)</span></span>}>
        <textarea
          className="brand-input w-full"
          rows={3}
          value={c.carNotes || ''}
          onChange={set('carNotes')}
          placeholder="Any special requests"
        />
      </Field>
    </div>
  );
}
