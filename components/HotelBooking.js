'use client';

import Field from '@/components/Field';

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
    <>
      <h2 className="text-lg font-semibold mb-3">Hotel Booking</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Make Destination span both columns so the next row lines up */}
        <div className="md:col-span-2">
          <Field label="Traveling To:">
            <input
              className="brand-input"
              value={c.destCity || ''}
              onChange={set('destCity')}
              placeholder="e.g. Cape Town"
              maxLength={25}   // user can’t type more than 25 characters
              size={25}        // box width ~ 25 characters
            />
          </Field>
        </div>

        {/* Row: Check-in | Check-out */}
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

        {/* Row: No of Traveler(s) | No of Rooms */}
        <Field label="No of Traveler(s)">
          <select
            className="brand-input w-full"
            value={c.adults ?? ''}
            onChange={set('adults')}
            required
          >
            <option value="">— Select —</option>
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>

        <Field label="No of Rooms">
          <select
            className="brand-input w-full"
            value={c.rooms ?? ''}
            onChange={set('rooms')}
            required
          >
            <option value="">— Select —</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </Field>

        {/* Nights (auto) */}
        <Field label="Nights">
          <input
            type="number"
            className="brand-input w-full"
            value={c.nights ?? 0}
            readOnly
          />
        </Field>

        {/* Hotel category */}
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

        {/* Meal type (clean label + limited options) */}
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

        {/* Room type */}
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

        {/* Specific hotel */}
        <Field label="Specific hotel (optional)">
          <input
            className="brand-input w-full"
            value={c.specificHotel || ''}
            onChange={set('specificHotel')}
            placeholder="If you have a preference"
          />
        </Field>

        {/* Notes */}
        <div className="md:col-span-2">
          <Field label="Notes (optional)">
            <textarea
              className="brand-input w-full"
              rows={3}
              value={c.notes || ''}
              onChange={set('notes')}
              placeholder="Any special requests"
            />
          </Field>
        </div>
      </div>
    </>
  );
}
