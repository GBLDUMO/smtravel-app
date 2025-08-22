// lib/constants.js
// Order: Hotel Booking (0) → Flights (1) → Car Hire (2) → Airport Transfer (3)

export const SECTIONS = [
  'Hotel Booking',
  'Flights',
  'Car Hire',
  'Airport Transfer',
];

// Sections that ask: “Do you require a … ?”
export const PROMPTABLE = new Set([1, 2, 3]);

// Dropdown options for Flights (and anywhere else you want to reuse)
export const SA_CITIES = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Gqeberha (Port Elizabeth)',
  'Bloemfontein',
  'East London',
  'George',
  'Mbombela (Nelspruit)',
  'Polokwane',
  'Kimberley',
  'Pietermaritzburg',
  'Lanseria',
  'Upington',
];
