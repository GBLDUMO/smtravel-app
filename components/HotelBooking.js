'use client';

import Field from '@/components/Field';

const optional = (text) => (
  <span>
    {text} <span className="font-normal" style={{ color: '#6B7486' }}>(optional)</span>
  </span>
);

export default function HotelBooking({ hotel, setHotel }) {
  const c = hotel || {};
  const set = (k) => (e) => setHotel({ ...c, [k]: e.target.value });

  // Helper: calculate night count from two YYYY-MM-DD strings
  const calcNights = (inStr, outStr) => {
    if (!inStr || !outStr) return 0;
    const inDate = new Date(inStr);
    const outDate = new Date(outStr);
    const ms = outDate - inDate;
    const nights = Math.floor(ms / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const onCheckInChange = (e) => {
    const checkIn = e.target.value;
    const nights = calcNights(checkIn, c.checkOut);
    setHotel({ ...c, checkIn, nights });
  };

  const onCheckOutChange = (e) => {
    const checkOut = e.target.value;
    const nights = calcNights(c.checkIn, checkOut);
    setHotel({ ...c, checkOut, nights });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Travelling to">
        <input
          className="brand-input w-full"
          value={c.destCity || ''}
          onChange={set('destCity')}
          placeholder="e.g. Cape Town"
          maxLength={60}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Check-in date">
          <input
            type="date"
            className="brand-input w-full"
            value={c.checkIn || ''}
            onChange={onCheckInChange}
          />
        </Field>

        <Field label="Check-out date">
          <input
            type="date"
            className="brand-input w-full"
            value={c.checkOut || ''}
            onChange={onCheckOutChange}
          />
        </Field>

        {/* Nights (calculated from the dates) */}
        <Field label="Nights">
          <input
            type="number"
            className="brand-input w-full"
            value={c.nights ?? 0}
            readOnly
            style={{ background: '#F5F7FB' }}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Number of travellers">
          <select
            className="brand-input w-full"
            value={c.adults ?? ''}
            onChange={set('adults')}
            required
          >
            <option value="">— Select —</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </Field>

        <Field label="Number of rooms">
          <select
            className="brand-input w-full"
            value={c.rooms ?? ''}
            onChange={set('rooms')}
            required
          >
            <option value="">— Select —</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>{n}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Hotel category">
          <select
            className="brand-input w-full"
            value={c.hotelCategory || ''}
            onChange={set('hotelCategory')}
          >
            <option value="">— Select —</option>
            <option>Budget</option>
            <option>Mid-range</option>
            <option>Luxury</option>
            <option>5-Star Luxury</option>
          </select>
        </Field>

        <Field label="Meal type">
          <select
            className="brand-input w-full"
            value={c.mealType || ''}
            onChange={set('mealType')}
            required
          >
            <option value="">— Select —</option>
            <option>Room Only</option>
            <option>Breakfast</option>
            <option>Breakfast & Dinner</option>
            <option>Breakfast, Lunch & Dinner</option>
          </select>
        </Field>

        <Field label="Room type">
          <select
            className="brand-input w-full"
            value={c.roomType || ''}
            onChange={set('roomType')}
          >
            <option value="">— Select —</option>
            <option>Single</option>
            <option>Double</option>
            <option>Twin</option>
            <option>Suite</option>
          </select>
        </Field>
      </div>

      <Field label={optional('Specific hotel')}>
        <input
          className="brand-input w-full"
          value={c.specificHotel || ''}
          onChange={set('specificHotel')}
          placeholder="If you have a preference"
        />
      </Field>

      <Field label={optional('Notes')}>
        <textarea
          className="brand-input w-full"
          rows={3}
          value={c.notes || ''}
          onChange={set('notes')}
          placeholder="Any special requests"
        />
      </Field>
    </div>
  );
}
