  'use client';

  import Field from '@/components/Field';

  export default function CarHire({ car, setCar }) {
    const c = car || {};
    const set = (k) => (e) => setCar({ ...c, [k]: e.target.value });

    return (
      <>
        <h2 className="text-lg font-semibold mb-3">Car Hire</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Pickup location">
            <input
              className="brand-input w-full"
              value={c.carPickup || ''}
              onChange={set('carPickup')}
              placeholder="Defaults from Flights → To"
            />
          </Field>

          <Field label="Return location">
            <input
              className="brand-input w-full"
              value={c.carReturn || ''}
              onChange={set('carReturn')}
              placeholder="Mirrors Pickup (editable)"
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

          {/* Same row: Car type + Notes */}
          <Field label="Car type">
            <select
              className="brand-input w-full"
              value={c.carType || ''}
              onChange={set('carType')}
              required
            >
              <option value="">— Select —</option>
              <option>Small</option>
              <option>Mid</option>
              <option>Luxury</option>
              <option>Large</option>
            </select>
          </Field>

          <Field label="Notes (optional)">
            <textarea
              className="brand-input w-full"
              rows={1}
              value={c.carNotes || ''}
              onChange={set('carNotes')}
              placeholder="Any special requests"
            />
          </Field>
        </div>
      </>
    );
  }
