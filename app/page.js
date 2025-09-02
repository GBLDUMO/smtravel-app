'use client';

import { useEffect, useState } from 'react';

// Components (no LogoHeader)
import Modal from '@/components/Modal';
import Field from '@/components/Field';

import HotelBooking from '@/components/HotelBooking';
import Flights from '@/components/Flights';
import CarHire from '@/components/CarHire';
import AirportTransfer from '@/components/AirportTransfer';

// Shared (order must match: Hotel, Flights, Car Hire, Airport Transfer)
import { SECTIONS, PROMPTABLE } from '@/lib/constants';
import { isRequiredFilledFactory } from '@/lib/helpers';

// ---- initial state slices (dropdowns start BLANK)
function initialContact() {
  return { fullName: '', email: '', phone: '' };
}
function initialHotel() {
  return {
    destCity: '',
    checkIn: '',
    checkOut: '',
    nights: 0,
    adults: 1,
    hotelCategory: '', // blank
    mealType: '',      // blank (TRIGGER for Hotel)
    roomType: '',      // blank
    specificHotel: '',
    notes: '',
  };
}
function initialFlights() {
  // TRIGGER = flights.to
  return { from: '', to: '', departDate: '', returnDate: '' };
}
function initialCar() {
  return {
    carPickup: '',
    carReturn: '',
    carPickupDate: '',
    carReturnDate: '',
    carType: '', // blank (TRIGGER for Car)
  };
}
function initialTransfer() {
  // TRIGGER = tType
  return { tFrom: '', tTo: '', tDate: '', tType: '' };
}

export default function Page() {
  // theme (CSS variables)
  const themeVars = {
    '--brand-navy': '#0b3c91',
    '--brand-teal': '#038b73',
    '--brand-green': '#0ea76a',
    '--brand-amber': '#f59e0b',
    '--brand-ink': '#0f172a',
    '--brand-paper': '#ffffff',
    '--brand-cloud': '#f7fafc',
    '--brand-navy-22': '#0b3c9122',
    '--brand-navy-33': '#0b3c9133',
    '--brand-navy-55': '#0b3c9155',
    '--brand-navy-66': '#0b3c9166',
    '--brand-navy-08': '#0b3c9108',
    '--brand-navy-0d': '#0b3c910d',
    '--brand-amber-33': '#f59e0b33',
    '--brand-green-15': '#0ea76a15',
    '--brand-green-33': '#0ea76a33',
  };
  const gradientBg =
    'linear-gradient(180deg, var(--brand-navy) 0%, var(--brand-teal) 42%, var(--brand-cloud) 100%)';

  // which section: null = landing, 0..3 = active section
  const [tab, setTab] = useState(null);

  // form slices
  const [contact, setContact] = useState(initialContact());
  const [hotel, setHotel] = useState(initialHotel());
  const [flights, setFlights] = useState(initialFlights());
  const [car, setCar] = useState(initialCar());
  const [transfer, setTransfer] = useState(initialTransfer());

  // flow flags
  // enabled[1], enabled[2], enabled[3] correspond to Flights, Car Hire, Airport Transfer promptable sections
  const [enabled, setEnabled] = useState({ 1: undefined, 2: undefined, 3: undefined });
  const [confirmSection, setConfirmSection] = useState(null);

  // UX
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false); // drives the popup

  // car “touched” flags for mirroring
  const [carPickupTouched, setCarPickupTouched] = useState(false);
  const [carReturnTouched, setCarReturnTouched] = useState(false);

  // turn off cross-section auto-fill after "Complete"
  const [allowAutoFill, setAllowAutoFill] = useState(true);

  // validation checker bound to state
  const isRequiredFilled = isRequiredFilledFactory({ hotel, flights, car, transfer, enabled });

  function onLandingClick(i) {
    if (PROMPTABLE.has(i)) setEnabled((prev) => ({ ...prev, [i]: true }));
    setTab(i);
  }

  function findNextIndex(start) {
    let i = start + 1;
    while (i < SECTIONS.length && enabled[i] === false) i++;
    return Math.min(i, SECTIONS.length - 1);
  }

  function goNext() {
    if (tab === null) return;
    if (!isRequiredFilled(tab)) {
      alert('Please fill the required fields for this section.');
      return;
    }
    const candidate = findNextIndex(tab);
    if (PROMPTABLE.has(candidate) && enabled[candidate] === undefined) {
      setConfirmSection(candidate);
      return;
    }
    setTab(candidate);
  }

  function includeSection(i) {
    setEnabled((prev) => ({ ...prev, [i]: true }));
    setConfirmSection(null);
    setTab(i);
  }
  function skipSection(i) {
    setEnabled((prev) => ({ ...prev, [i]: false }));
    setConfirmSection(null);
    setTab(findNextIndex(i));
  }

  async function post(payload) {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // ignore network errors for MVP
    }
  }

  // ----- FIXED: async functions only once, no stray code after them
  async function submitFull() {
    if (tab === null || !isRequiredFilled(tab)) return;
    setSending(true);
    await post({ contact, hotel, flights, car, transfer, enabled });
    setSending(false);
    thankAndReset(5000);
  }

  async function completeNow() {
    if (tab === null || !isRequiredFilled(tab)) {
      alert('Please finish the required fields first.');
      return;
    }
    // stop auto-filling later sections so only the completed section is sent
    setAllowAutoFill(false);

    setSending(true);
    await post({
      contact,
      hotel,
      flights,
      car,
      transfer,
      enabled,
      endedEarly: true,
      endedAt: SECTIONS[tab],
    });
    setSending(false);
    thankAndReset(5000);
  }
  // ----- end fixed area

  function resetAll() {
    setContact(initialContact());
    setHotel(initialHotel());
    setFlights(initialFlights());
    setTransfer(initialTransfer());
    setCar(initialCar());
    setEnabled({ 1: undefined, 2: undefined, 3: undefined });
    setCarPickupTouched(false);
    setCarReturnTouched(false);
    setConfirmSection(null);
    setTab(null);
    setAllowAutoFill(true);
  }

  function thankAndReset(ms) {
    setDone(true); // show centered popup
    setTimeout(() => {
      setDone(false);
      resetAll(); // dropdowns reset to blank because initial*() return '' for selects
    }, ms);
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const root = document.querySelector('main');
    const ok = root && getComputedStyle(root).getPropertyValue('--brand-navy').trim() === '#0b3c91';
    console.table([{ test: 'CSS var --brand-navy set', pass: !!ok }]);
  }, []);

  return (
    <main className="min-h-screen" style={{ ...themeVars, background: gradientBg }}>
      {/* Landing – FULL-BLEED hero from very top */}
      {tab === null ? (
        <section className="mt-0">
          <div className="relative isolate min-h-screen w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden bg-slate-900">
            <picture>
              <source srcSet="/images/call-center-hero.avif" type="image/avif" />
              <img
                src="/images/call-center-hero.jpg"
                alt="Travel agents at work"
                className="absolute inset-0 h-full w-full object-cover object-center brightness-115 contrast-110"
                loading="eager"
                fetchPriority="high"
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-900/60" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-35">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg"
                alt="Africa map overlay"
                className="max-h-[65%] max-w-[65%] object-contain mix-blend-overlay"
              />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 grid items-start gap-10 md:grid-cols-2">
              <div className="md:pt-10">
                <div className="rounded-3xl bg-white/85 p-8 shadow-xl backdrop-blur">
                  <h1 className="text-3xl sm:text-4xl leading-tight">
                    <span className="block text-black">Welcome to</span>
                    <span className="font-bold text-blue-900">Solid Matter Travel</span>
                  </h1>
                  <p className="mt-2 text-base text-black/80">Manage all your bookings in one place.</p>
                  <p className="mt-4 text-sm text-black/80">
                    <span className="font-semibold">Solid Matter Travel</span> is your single hub for
                    requests across hotels, flights, car hire and airport transfers. One smart form,
                    auto-filled details, and direct routing to our team for fast confirmations.
                  </p>
                </div>
              </div>

              <div className="md:pt-24">
                <div className="mx-auto max-w-sm rounded-3xl bg-white/10 p-6 text-white backdrop-blur ring-1 ring-white/20">
                  <h3 className="text-center text-3xl font-bold my-6">Choose a service</h3>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => onLandingClick(0)}
                      className="rounded-3xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                    >
                      Hotel Booking
                    </button>
                    <button
                      onClick={() => onLandingClick(1)}
                      className="rounded-3xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                    >
                      Flights
                    </button>
                    <button
                      onClick={() => onLandingClick(2)}
                      className="rounded-3xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                    >
                      Car Hire
                    </button>
                    <button
                      onClick={() => onLandingClick(3)}
                      className="rounded-3xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                    >
                      Airport Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Process view (boxed)
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <section
            className="rounded-2xl shadow-xl"
            style={{ background: 'var(--brand-paper)', border: '1px solid var(--brand-navy-22)' }}
          >
            {/* Section header */}
            <div
              className="flex items-center justify-center px-4 md:px-6 py-3 border-b"
              style={{ borderColor: 'var(--brand-navy-22)', background: 'var(--brand-navy-08)' }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-center" style={{ color: 'var(--brand-navy)' }}>
                {SECTIONS[tab]}
              </h2>
            </div>

            {/* Shared contact row */}
            <div className="px-4 md:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Full name">
                <input
                  className="brand-input w-full"
                  value={contact.fullName}
                  onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  required
                  className="brand-input w-full"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </Field>
              <Field label="Phone (with country code)">
                <input
                  className="brand-input w-full"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </Field>
            </div>

            <div className="px-4 md:px-6 pb-6">
              {tab === 0 && (
                <HotelBooking
                  hotel={hotel}
                  setHotel={(h) => {
                    if (allowAutoFill) {
                      if (h.checkIn && !car.carPickupDate) setCar({ ...car, carPickupDate: h.checkIn });
                      if (h.checkIn && !flights.departDate) setFlights({ ...flights, departDate: h.checkIn });
                    }
                    setHotel(h);
                  }}
                />
              )}

              {tab === 1 && enabled[1] !== false && (
                <Flights
                  flights={flights}
                  setFlights={(nf) => {
                    if (allowAutoFill) {
                      const nextCar = { ...car };
                      if (!carPickupTouched && nf.to) {
                        nextCar.carPickup = nf.to;
                        if (!carReturnTouched) nextCar.carReturn = nf.to;
                      }
                      setCar(nextCar);
                    }
                    setFlights(nf);
                  }}
                />
              )}

              {tab === 2 && enabled[2] !== false && (
                <CarHire
                  car={car}
                  setCar={(nc) => {
                    if (nc.carPickup !== car.carPickup && !carPickupTouched) setCarPickupTouched(true);
                    if (nc.carReturn !== car.carReturn && !carReturnTouched) setCarReturnTouched(true);
                    if (!carReturnTouched && nc.carPickup !== car.carPickup) {
                      nc = { ...nc, carReturn: nc.carPickup };
                    }
                    setCar(nc);
                  }}
                />
              )}

              {tab === 3 && enabled[3] !== false && (
                <AirportTransfer
                  transfer={transfer}
                  flightsTo={allowAutoFill ? flights.to : ''}
                  setTransfer={setTransfer}
                />
              )}

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-2 items-center justify-between">
                <button
                  onClick={() => {
                    if (tab !== null) setTab(Math.max(0, tab - 1));
                  }}
                  className="brand-btn-secondary"
                  disabled={tab === 0}
                >
                  Back
                </button>

                <div className="ml-auto flex gap-2">
                  <button onClick={completeNow} disabled={sending} className="brand-btn-secondary">
                    {sending ? 'Working…' : 'Complete'}
                  </button>

                  {tab < SECTIONS.length - 1 ? (
                    <button onClick={goNext} className="brand-btn-primary">
                      Next: {SECTIONS[findNextIndex(tab)]}
                    </button>
                  ) : (
                    <button onClick={submitFull} disabled={sending} className="brand-btn-primary">
                      {sending ? 'Sending…' : 'Submit request'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Include/skip prompt */}
      {confirmSection !== null && (
        <Modal>
          <h3 className="modal-title">{`Do you require a ${SECTIONS[confirmSection]}?`}</h3>
          <p className="modal-copy">Choose Yes to complete it now, or No to skip to the next step.</p>
          <div className="modal-actions">
            <button onClick={() => skipSection(confirmSection)} className="brand-btn-secondary">
              No
            </button>
            <button onClick={() => includeSection(confirmSection)} className="brand-btn-primary">
              Yes
            </button>
          </div>
        </Modal>
      )}

      {/* Centered THANK YOU POPUP */}
      {done && (
        <Modal>
          <div className="text-center">
            <h3 className="modal-title">Thank you for your request!</h3>
            <p className="modal-copy">
              Our team will contact you shortly. You will receive a confirmation email for your booking.
            </p>
            <div className="modal-actions">
              <button onClick={() => setDone(false)} className="brand-btn-primary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shared styles */}
      <style jsx global>{`
        .brand-input {
          border: 1px solid var(--brand-navy-22);
          background: #fff;
          padding: 0.5rem 0.75rem;
          border-radius: 0.625rem;
          outline: none;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.02s;
        }
        .brand-input:focus {
          border-color: var(--brand-navy);
          box-shadow: 0 0 0 4px var(--brand-amber-33);
        }
        .brand-btn-primary {
          padding: 0.6rem 1rem;
          border-radius: 9999px;
          color: white;
          background: #2563eb;
          border: 1px solid #1d4ed8;
          box-shadow: 0 8px 16px var(--brand-navy-22), inset 0 -2px 0 var(--brand-navy-66);
          transition: transform 0.06s, box-shadow 0.2s, filter 0.2s, background 0.2s;
        }
        .brand-btn-primary:hover {
          filter: brightness(1.03);
          background: #1d4ed8;
        }
        .brand-btn-primary:active {
          transform: translateY(1px);
        }
        .brand-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .brand-btn-secondary {
          padding: 0.6rem 1rem;
          border-radius: 9999px;
          background: #fff;
          color: var(--brand-navy);
          border: 1px solid var(--brand-navy-55);
          transition: background 0.2s, border-color 0.2s, transform 0.06s;
        }
        .brand-btn-secondary:hover {
          background: var(--brand-navy-0d);
        }
        .brand-btn-secondary:active {
          transform: translateY(1px);
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          z-index: 100;
          transition: opacity 0.3s ease-in-out;
        }
        .modal-card {
          width: min(90vw, 480px);
          max-height: 80vh;
          overflow-y: auto;
          background: var(--brand-paper);
          border: 1px solid var(--brand-navy-22);
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          transform: translateY(0);
          transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }
        .modal-title {
          font-weight: 700;
          color: var(--brand-navy);
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          text-align: center;
        }
        .modal-copy {
          color: var(--brand-ink);
          opacity: 0.8;
          font-size: 1rem;
          margin-bottom: 1rem;
          text-align: center.
        }
        .modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
      `}</style>
    </main>
  );
}
