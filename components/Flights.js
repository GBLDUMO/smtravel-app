'use client';

import { useEffect } from 'react';
import Field from '@/components/Field';

/**
 * Multi-city logic:
 * - Base leg (from/to/departDate/tripType[/returnDate]) always shown.
 * - If base Trip type === "One Way":
 *   - Show "Add City" button to add up to 3 more legs (total 4).
 *   - Each extra leg has from/to/departDate/tripType[/returnDate] and can be removed.
 *   - For every leg (base and segments), Trip type is mandatory.
 */

export default function Flights({ flights, setFlights }) {
  // Safe defaults
  const f = flights || {
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    tripType: '',  // '', 'One Way', 'Return'
    segments: [],  // [{ from, to, departDate, tripType, returnDate }]
  };

  // Ensure keys exist once on mount
  useEffect(() => {
    const patch = {};
    if (typeof f.tripType === 'undefined') patch.tripType = '';
    if (!Array.isArray(f.segments)) patch.segments = [];
    if (Object.keys(patch).length) setFlights({ ...f, ...patch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- helpers
  const setBase = (k) => (e) => setFlights({ ...f, [k]: e.target.value });

  const setSeg = (i, k) => (e) => {
    const next = Array.isArray(f.segments) ? [...f.segments] : [];
    next[i] = {
      ...(next[i] || { from: '', to: '', departDate: '', tripType: '' }),
      [k]: e.target.value,
    };
    setFlights({ ...f, segments: next });
  };

  const onBaseTripTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'Return') {
      // Return trip: clear extra legs, keep/require base returnDate
      setFlights({ ...f, tripType: 'Return', segments: [], returnDate: f.returnDate || '' });
    } else if (value === 'One Way') {
      // One Way: allow multi-city; clear base returnDate
      setFlights({ ...f, tripType: 'One Way', returnDate: '' });
    } else {
      setFlights({ ...f, tripType: '', returnDate: '', segments: [] });
    }
  };

  const onSegTripTypeChange = (i) => (e) => {
    const value = e.target.value;
    const next = [...(f.segments || [])];
    const seg = next[i] || { from: '', to: '', departDate: '', tripType: '' };
    next[i] = {
      ...seg,
      tripType: value,
      returnDate: value === 'Return' ? seg.returnDate || '' : '', // clear returnDate unless Return
    };
    setFlights({ ...f, segments: next });
  };

  // Base departure date change
  const onBaseDepartDateChange = (e) => {
    setFlights({ ...f, departDate: e.target.value });
  };

  // Multi-city controls
  const totalLegs = 1 + (Array.isArray(f.segments) ? f.segments.length : 0);
  const canAddMoreLegs = totalLegs < 4;

  const addCity = () => {
    if (!canAddMoreLegs) return;
    const next = Array.isArray(f.segments) ? [...f.segments] : [];
    next.push({ from: '', to: '', departDate: '', tripType: '' });
    setFlights({ ...f, segments: next });
  };

  const removeCity = (idx) => {
    const next = [...(f.segments || [])];
    next.splice(idx, 1);
    setFlights({ ...f, segments: next });
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Flights</h2>

      {/* Base leg */}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="From (city or airport)">
          <input
            className="brand-input w-full"
            value={f.from || ''}
            onChange={setBase('from')}
            placeholder="e.g. Dubai or DXB"
          />
        </Field>

        <Field label="To (city or airport)">
          <input
            className="brand-input w-full"
            value={f.to || ''}
            onChange={setBase('to')}
            placeholder="e.g. Cape Town or CPT"
          />
        </Field>

        <Field label="Departure date">
          <input
            type="date"
            className="brand-input w-full"
            value={f.departDate || ''}
            onChange={onBaseDepartDateChange}
          />
        </Field>

        {/* Base Trip type (mandatory once date chosen) */}
        {f.departDate && (
          <Field label="Trip type">
            <select
              className="brand-input w-full"
              value={f.tripType || ''}
              onChange={onBaseTripTypeChange}
              required
            >
              <option value="">— Select —</option>
              <option value="One Way">One Way</option>
              <option value="Return">Return</option>
            </select>
          </Field>
        )}

        {/* Base Return date only when Return */}
        {f.departDate && f.tripType === 'Return' && (
          <Field label="Return date">
            <input
              type="date"
              className="brand-input w-full"
              value={f.returnDate || ''}
              onChange={setBase('returnDate')}
              required
            />
          </Field>
        )}
      </div>

      {/* Multi-city UI for base = One Way */}
      {f.tripType === 'One Way' && (
        <div className="mt-4">
          <div className="flex gap-2 items-center mb-3">
            <button
              type="button"
              className="brand-btn-secondary"
              onClick={addCity}
              disabled={!canAddMoreLegs}
              title={canAddMoreLegs ? 'Add another city' : 'Maximum 4 legs reached'}
            >
              Add City
            </button>
            <span className="text-sm opacity-75">
              You can add up to {4 - totalLegs} more leg(s).
            </span>
          </div>

          {(f.segments || []).map((seg, i) => (
            <div
              key={i}
              className="grid md:grid-cols-2 gap-4 mb-3 p-4 rounded-xl border"
              style={{ borderColor: 'var(--brand-navy-22)' }}
            >
              <Field label={`Leg ${i + 2} — From (city or airport)`}>
                <input
                  className="brand-input w-full"
                  value={seg.from || ''}
                  onChange={setSeg(i, 'from')}
                  placeholder="e.g. Johannesburg or JNB"
                />
              </Field>

              <Field label="To (city or airport)">
                <input
                  className="brand-input w-full"
                  value={seg.to || ''}
                  onChange={setSeg(i, 'to')}
                  placeholder="e.g. Nairobi or NBO"
                />
              </Field>

              <Field label="Departure date">
                <input
                  type="date"
                  className="brand-input w-full"
                  value={seg.departDate || ''}
                  onChange={setSeg(i, 'departDate')}
                />
              </Field>

              {/* NEW: Trip type per segment (mandatory) */}
              <Field label="Trip type">
                <select
                  className="brand-input w-full"
                  value={seg.tripType || ''}
                  onChange={onSegTripTypeChange(i)}
                  required
                >
                  <option value="">— Select —</option>
                  <option value="One Way">One Way</option>
                  <option value="Return">Return</option>
                </select>
              </Field>

              {/* Segment return date only when this segment is Return */}
              {seg.tripType === 'Return' && (
                <Field label="Return date">
                  <input
                    type="date"
                    className="brand-input w-full"
                    value={seg.returnDate || ''}
                    onChange={setSeg(i, 'returnDate')}
                    required
                  />
                </Field>
              )}

              <div className="md:col-span-2">
                <button
                  type="button"
                  className="brand-btn-secondary"
                  onClick={() => removeCity(i)}
                >
                  Remove this leg
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
