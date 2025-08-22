// lib/helpers.js

export function isRequiredFilledFactory({ hotel, flights, car, transfer, enabled }) {
  return function isRequiredFilled(tab) {
    // If a PROMPTABLE section was explicitly skipped elsewhere,
    // treat it as filled so Next can continue:
    if (enabled && enabled[tab] === false) return true;

    if (tab === 0) {
      return !!(hotel.destCity && hotel.checkIn && hotel.checkOut);
    }
    if (tab === 1) {
      return !!(flights.from && flights.to);
    }
    if (tab === 2) {
      return !!(
        (car.carPickup || flights.to) &&
        (car.carReturn || car.carPickup || flights.to) &&
        (car.carPickupDate || hotel.checkIn) &&
        car.carReturnDate
      );
    }
    if (tab === 3) {
      return !!(((transfer.tFrom || flights.to)) && transfer.tTo && transfer.tDate);
    }
    return true;
  };
}
  