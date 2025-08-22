'use client';

import { useEffect } from 'react';
import Field from '@/components/Field';

export default function HotelBooking({ hotel, setHotel }) {
  const set = (field) => (e) => setHotel({ ...hotel, [field]: e.target.value });

  // Auto-calculate nights when checkIn or checkOut changes
  useEffect(() => {
    if (hotel.checkIn && hotel.checkOut) {
      const checkInDate = new Date(hotel.checkIn);
      const checkOutDate = new Date(hotel.checkOut);

      if (checkOutDate > checkInDate) {
        const diffTime = checkOutDate - checkInDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert ms → days
        if (hotel.nights !== diffDays) {
          setHotel({ ...hotel, nights: diffDays });
        }
      }
    }
  }, [hotel.checkIn, hotel.checkOut]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Destination City">
        <input
          className="brand-input w-full"
          value={hotel.destCity}
          onChange={set('destCity')}
        />
      </Field>

      {/* Check-in and Check-out side by side */}
      <div className="grid grid-cols-2 gap-4 col-span-2">
        <Field label="Check-in">
          <input
            type="date"
            className="brand-input w-full"
            value={hotel.checkIn}
            onChange={set('checkIn')}
          />
        </Field>
        <Field label="Check-out">
          <input
            type="date"
            className="brand-input w-full"
            value={hotel.checkOut}
            onChange={set('checkOut')}
          />
        </Field>
      </div>

      {/* Nights (calculated, readonly) */}
      <Field label="Nights">
        <input
          type="number"
          className="brand-input w-20"
          value={hotel.nights}
          readOnly
        />
      </Field>

      <Field label="Adults">
        <input
          type="number"
          className="brand-input w-full"
          value={hotel.adults}
          onChange={set('adults')}
        />
      </Field>

      <Field label="Hotel Category">
        <select
          className="brand-input w-full"
          value={hotel.hotelCategory}
          onChange={set('hotelCategory')}
        >
          <option value="Budget">Budget</option>
          <option value="Mid-range">Mid-range</option>
          <option value="Luxury">Luxury</option>
        </select>
      </Field>

      <Field label="Room Type">
        <select
          className="brand-input w-full"
          value={hotel.roomType}
          onChange={set('roomType')}
        >
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Suite">Suite</option>
        </select>
      </Field>

      {/* Meal Type (Room Only on top) */}
      <Field label="Meal Type">
        <select
          className="brand-input w-full"
          value={hotel.mealType || 'Room Only'}
          onChange={set('mealType')}
        >
          <option value="Room Only">Room Only</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Breakfast & Dinner">Breakfast & Dinner</option>
          <option value="Breakfast, Lunch, Dinner">Breakfast, Lunch, Dinner</option>
        </select>
      </Field>

      <Field label="Specific Hotel (optional)">
        <input
          className="brand-input w-full"
          value={hotel.specificHotel}
          onChange={set('specificHotel')}
        />
      </Field>

      <Field label="Notes">
        <textarea
          className="brand-input w-full"
          value={hotel.notes}
          onChange={set('notes')}
        />
      </Field>
    </div>
  );
}
