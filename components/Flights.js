'use client';

import { useState } from 'react';
import Field from '@/components/Field';
import { SA_CITIES } from '@/lib/constants';

export default function Flights({ flights, setFlights }) {
  const f = flights ?? {};

  // If current "to" isn't in the list, start in custom mode
  const [customTo, setCustomTo] = useState(
    Boolean(f.to && !SA_CITIES.includes(f.to))
  );

  const set = (k) => (e) => setFlights({ ...f, [k]: e.target.value });

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Flights</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* From = dropdown only */}
        <Field label="From">
          <select
            className="brand-input w-full"
            value={f.from || ''}
            onChange={set('from')}
          >
            <option value="" disabled>Select city</option>
            {SA_CITIES.map((c) => (
              <option key={`from-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        {/* To = dropdown OR free text */}
        <Field label="To">
          {!customTo ? (
            <div className="flex gap-2 w-full">
              <select
                className="brand-input w-full"
                value={f.to || ''}
                onChange={set('to')}
              >
                <option value="" disabled>Select city</option>
                {SA_CITIES.map((c) => (
                  <option key={`to-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="brand-btn-secondary text-xs px-2"
                onClick={() => {
                  setCustomTo(true);
                  // optional: clear value when switching to custom
                  setFlights({ ...f, to: '' });
                }}
              >
                Other
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                className="brand-input w-full"
                placeholder="Enter destination"
                value={f.to || ''}
                onChange={set('to')}
              />
              <button
                type="button"
                className="brand-btn-secondary text-xs px-2"
                onClick={() => {
                  setCustomTo(false);
                  // optional: clear value when switching back to list
                  setFlights({ ...f, to: '' });
                }}
              >
                List
              </button>
            </div>
          )}
        </Field>

        <Field label="Departure">
          <input
            type="date"
            className="brand-input w-full"
            value={f.departDate || ''}
            onChange={set('departDate')}
          />
        </Field>

        <Field label="Return">
          <input
            type="date"
            className="brand-input w-full"
            value={f.returnDate || ''}
            onChange={set('returnDate')}
          />
        </Field>
      </div>
    </>
  );
}
