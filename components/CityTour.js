'use client';

import Field from '@/components/Field';

export default function CityTour({ tour, setTour }) {
  const t = tour || {};
  const set = (k) => (e) => setTour({ ...t, [k]: e.target.value });

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">City Tour</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="City">
          <input className="brand-input w-full" value={t.tourCity || ''} onChange={set('tourCity')} />
        </Field>
        <Field label="Date">
          <input type="date" className="brand-input w-full" value={t.tourDate || ''} onChange={set('tourDate')} />
        </Field>
      </div>
    </>
  );
}
