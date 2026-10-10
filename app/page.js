'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, BedDouble, Car, Check, MessageCircle, Plane, PlaneLanding } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/971582003251';

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
  return {
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    tripType: '',
    segments: [], // <-- add this
  };
}

function initialCar() {
  return { carPickup: '', carReturn: '', carPickupDate: '', carReturnDate: '', carType: '', carNotes: '' };
}

function initialTransfer() {
  // TRIGGER = tType
  return { tFrom: '', tTo: '', tDate: '', tType: '' };
}

export default function Page() {
  // theme (CSS variables)
  const themeVars = {
    '--brand-navy': '#0e1e4a',
    '--brand-teal': '#1b3a9e',
    '--brand-green': '#1f7a45',
    '--brand-amber': '#e5a50a',
    '--brand-ink': '#1b2232',
    '--brand-paper': '#ffffff',
    '--brand-cloud': '#f5f7fb',
    '--brand-navy-22': '#0e1e4a22',
    '--brand-navy-33': '#0e1e4a33',
    '--brand-navy-55': '#0e1e4a55',
    '--brand-navy-66': '#0e1e4a66',
    '--brand-navy-08': '#0e1e4a08',
    '--brand-navy-0d': '#0e1e4a0d',
    '--brand-amber-33': '#e5a50a33',
    '--brand-green-15': '#1f7a4515',
    '--brand-green-33': '#1f7a4533',
  };
  // Plain light page behind the booking form (the homepage hero covers it)
  const gradientBg = 'var(--brand-cloud)';

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
  // services added to this request, in the order the traveller chose them
  const [order, setOrder] = useState([]);
  const [stepError, setStepError] = useState('');

  // UX
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false); // drives the popup
  const [sendFailed, setSendFailed] = useState(false); // drives the "could not send" popup
  const [bookingRef, setBookingRef] = useState('');

  // car “touched” flags for mirroring
  const [carPickupTouched, setCarPickupTouched] = useState(false);
  const [carReturnTouched, setCarReturnTouched] = useState(false);

  // turn off cross-section auto-fill after "Complete"
  const [allowAutoFill, setAllowAutoFill] = useState(true);

  // validation checker bound to state
  const isRequiredFilled = isRequiredFilledFactory({ hotel, flights, car, transfer, enabled });

  // DEMO GUARD: only the live site sends requests; previews never touch the Sheet, email or back office
  const isLiveSite = () => typeof window !== 'undefined' && window.location.hostname === 'book.smtravel.co.za';

  // Required fields per service: the base rules plus the field the back office uses to detect the service
  function isComplete(i) {
    if (!isRequiredFilled(i)) return false;
    if (i === 0) return !!hotel.mealType;
    if (i === 1) return !!flights.tripType;
    if (i === 2) return !!car.carType;
    return true;
  }
  const MISSING_HINT = [
    'Please add the destination, check-in and check-out dates, and meal type.',
    'Please add where you are flying from and to, and the trip type.',
    'Please add the pickup and return details, return date, and car type.',
    'Please add where the transfer goes to and the date.',
  ];

  function onLandingClick(i) {
    if (PROMPTABLE.has(i)) setEnabled((prev) => ({ ...prev, [i]: true }));
    setOrder([i]);
    setStepError('');
    setTab(i);
  }

  // Open another service (current one must be complete first)
  function addService(i) {
    if (tab === null) return;
    if (!isComplete(tab)) {
      setStepError(MISSING_HINT[tab]);
      return;
    }
    if (PROMPTABLE.has(i)) setEnabled((prev) => ({ ...prev, [i]: true }));
    setOrder((prev) => (prev.includes(i) ? prev : [...prev, i]));
    setStepError('');
    setTab(i);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Jump back to a service already in the request
  function openService(i) {
    setStepError('');
    setTab(i);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    const idx = order.indexOf(tab);
    setStepError('');
    if (idx <= 0) setTab(null);
    else setTab(order[idx - 1]);
  }

  // Sends the request. Returns { ok, bookingId }. ok is false only when the request did not
  // reach the server or the server answered with an error status.
  async function post(payload) {
    if (!isLiveSite()) {
      // eslint-disable-next-line no-console
      console.info('[demo] request not sent', payload);
      // Preview only: add ?demo=fail to the address to see the "could not send" screen
      const simulateFail = new URLSearchParams(window.location.search).get('demo') === 'fail';
      return simulateFail ? { ok: false } : { ok: true, bookingId: 'SMT-QU-DEMO' };
    }
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 25000) : null;
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined,
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      return { ok: res.ok, bookingId: data?.bookingId || '' };
    } catch {
      return { ok: false };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  const hasValidEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((contact.email || '').trim());

  // Plain-text summary used for the WhatsApp / email fallback when sending fails
  function requestSummary() {
    const lines = ['Booking request (website could not send it)'];
    lines.push(`Name: ${contact.fullName || '-'}`);
    lines.push(`Email: ${contact.email || '-'}`);
    if (contact.phone) lines.push(`Phone: ${contact.phone}`);
    if (order.includes(0)) {
      lines.push('', 'HOTEL', `Destination: ${hotel.destCity}`, `Check-in: ${hotel.checkIn}  Check-out: ${hotel.checkOut} (${hotel.nights} nights)`);
      lines.push(`Travellers: ${hotel.adults}  Rooms: ${hotel.rooms || '-'}  Category: ${hotel.hotelCategory || '-'}  Meals: ${hotel.mealType || '-'}  Room: ${hotel.roomType || '-'}`);
      if (hotel.specificHotel) lines.push(`Preferred hotel: ${hotel.specificHotel}`);
      if (hotel.notes) lines.push(`Notes: ${hotel.notes}`);
    }
    if (order.includes(1)) {
      lines.push('', 'FLIGHTS', `${flights.from} to ${flights.to} (${flights.tripType || '-'})`, `Depart: ${flights.departDate || '-'}${flights.returnDate ? `  Return: ${flights.returnDate}` : ''}`);
      (flights.segments || []).forEach((sg, k) => lines.push(`Leg ${k + 2}: ${sg.from} to ${sg.to} on ${sg.departDate || '-'}`));
    }
    if (order.includes(2)) {
      lines.push('', 'CAR HIRE', `Pickup: ${car.carPickup} on ${car.carPickupDate || '-'}`, `Return: ${car.carReturn} on ${car.carReturnDate || '-'}`, `Car type: ${car.carType || '-'}`);
      if (car.carNotes) lines.push(`Notes: ${car.carNotes}`);
    }
    if (order.includes(3)) {
      lines.push('', 'AIRPORT TRANSFER', `From: ${transfer.tFrom || flights.to || '-'}  To: ${transfer.tTo}`, `Date: ${transfer.tDate}  Type: ${transfer.tType || 'One way'}`);
    }
    return lines.join('\n');
  }

  async function completeNow() {
    if (tab === null) return;
    const incomplete = order.find((i) => !isComplete(i));
    if (incomplete !== undefined) {
      setTab(incomplete);
      setStepError(MISSING_HINT[incomplete]);
      return;
    }
    // Name and a valid email are needed: the server rejects requests without an email
    if (!contact.fullName.trim() || !hasValidEmail()) {
      setStepError('Please add your full name and a valid email address at the top of the form so we can send your quote.');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStepError('');
    setSending(true);
    // Services not added are sent blank, so the back office only sees what was requested
    const has = (i) => order.includes(i);
    const result = await post({
      contact,
      hotel: has(0) ? hotel : initialHotel(),
      flights: has(1) ? flights : initialFlights(),
      car: has(2) ? car : initialCar(),
      transfer: has(3)
        ? { ...transfer, tFrom: transfer.tFrom || (has(1) ? flights.to : ''), tType: transfer.tType || 'One way' }
        : initialTransfer(),
      enabled: { 1: has(1), 2: has(2), 3: has(3) },
      services: order.map((i) => SECTIONS[i]),
      endedEarly: true,
      endedAt: SECTIONS[tab],
    });
    setSending(false);
    if (!result.ok) {
      // Keep everything the traveller typed; offer retry and WhatsApp / email instead
      setSendFailed(true);
      return;
    }
    setBookingRef(result.bookingId || '');
    thankAndReset(8000);
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
    setOrder([]);
    setStepError('');
    setSendFailed(false);
    setBookingRef('');
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
    const root = document.querySelector('[data-smt-root]');
    const ok = root && getComputedStyle(root).getPropertyValue('--brand-navy').trim() === '#0e1e4a';
    console.table([{ test: 'CSS var --brand-navy set', pass: !!ok }]);
  }, []);

  // --- NEW: helper to know if we're on the last step
  const isLast = tab === SECTIONS.length - 1;

  // Display names (SECTIONS stays unchanged because it is sent to the back office)
  const STEP_TITLES = ['Hotel booking', 'Flights', 'Car hire', 'Airport transfer'];
  const STEP_SHORT = ['Hotel', 'Flights', 'Car hire', 'Airport transfer'];
  const STEP_LEGENDS = ['Your stay', 'Your flight', 'Your vehicle', 'Your transfer'];
  const STEP_ICONS = [BedDouble, Plane, Car, PlaneLanding];
  const remaining = SECTIONS.map((_, i) => i).filter((i) => !order.includes(i));
  const position = Math.max(0, order.indexOf(tab));
  const firstName = (contact.fullName || '').trim().split(/\s+/)[0];

  return (
    <div data-smt-root className="min-h-screen" style={{ ...themeVars, background: gradientBg }}>
      <SiteHeader onHome={tab === null ? undefined : () => setTab(null)} />
      <DemoBanner />

      {/* Landing */}
      {tab === null ? (
        <section className="relative isolate flex items-center overflow-hidden" style={{ minHeight: 'calc(100vh - 71px)' }}>
          <picture>
            <source srcSet="/images/call-center-hero.avif" type="image/avif" />
            <img
              src="/images/call-center-hero.jpg"
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 -z-10" style={{ background: 'rgba(14,30,74,0.3)' }} />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-10 md:px-8 md:py-16">
            {/* Welcome card */}
            <div className="flex flex-col gap-4 rounded-[22px] bg-white p-7 md:p-11" style={{ boxShadow: '0 24px 50px rgba(14,30,74,0.3)' }}>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-medium md:text-[30px]" style={{ color: '#2A3346' }}>Welcome to</span>
                <h1 className="m-0 text-[40px] font-bold leading-[1.02] md:text-[58px]" style={{ color: '#0E1E4A' }}>
                  Solid Matter Travel
                </h1>
              </div>
              <div className="h-[3px] w-16 rounded" style={{ background: '#E5A50A' }} />
              <p className="m-0 text-lg font-medium md:text-[19px]" style={{ color: '#1B2232' }}>
                Manage all your bookings in one place.
              </p>
              <p className="m-0 text-[15px] leading-relaxed md:text-base" style={{ color: '#4F596C' }}>
                <strong className="font-semibold" style={{ color: '#1B2232' }}>Solid Matter Travel</strong> is your single hub for
                requests across hotels, flights, car hire and airport transfers. One smart form, auto-filled details, and
                direct routing to our team for fast confirmations.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-3.5 text-sm" style={{ borderColor: '#E3E7EF', color: '#4F596C' }}>
                {['Africa specialists', 'Verified suppliers', 'South Africa & UAE'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2">
                    <Check size={16} strokeWidth={2.4} color="#1F7A45" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Choose a service */}
            <div
              className="mx-auto flex w-full max-w-[420px] flex-col gap-3.5 rounded-[22px] p-6 md:p-8"
              style={{ background: 'rgba(14,30,74,0.9)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 24px 50px rgba(14,30,74,0.3)' }}
            >
              <h2 className="mb-2 text-center text-[32px] font-semibold text-white md:text-[40px]">Choose a service</h2>
              {SECTIONS.map((_, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <button key={i} type="button" onClick={() => onLandingClick(i)} className="smt-service-btn">
                    <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                    <span className="flex-1 text-left">{['Hotel Booking', 'Flights', 'Car Hire', 'Airport Transfer'][i]}</span>
                    <ArrowRight size={18} aria-hidden="true" className="smt-service-arrow" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
          {/* Step bar */}
          <ol aria-label="Booking steps" className="m-0 grid list-none grid-cols-4 gap-2 p-0 md:gap-3">
            {SECTIONS.map((_, i) => {
              const active = i === tab;
              const done = !active && order.includes(i);
              return (
                <li
                  key={i}
                  aria-current={active ? 'step' : undefined}
                  onClick={done ? () => openService(i) : undefined}
                  title={done ? `Edit ${STEP_SHORT[i].toLowerCase()}` : undefined}
                  className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-center md:flex-row md:gap-3 md:px-4 md:py-3.5 md:text-left ${done ? 'cursor-pointer' : ''}`}
                  style={{
                    background: active ? '#0E1E4A' : '#FFFFFF',
                    border: active ? '1px solid #0E1E4A' : '1px solid #E3E7EF',
                    color: active ? '#FFFFFF' : done ? '#0E1E4A' : '#4F596C',
                  }}
                >
                  <span
                    className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-sm font-semibold"
                    style={
                      active
                        ? { background: '#E5A50A', color: '#0E1E4A' }
                        : done
                        ? { background: '#1F7A45', color: '#FFFFFF' }
                        : { border: '1px solid #CDD4E1' }
                    }
                  >
                    {done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={`min-w-0 text-xs md:text-[15px] ${active ? 'font-semibold' : 'font-medium'}`}>
                    {STEP_SHORT[i]}
                    {done && <span className="block text-[11px] font-normal md:inline"> · added</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap items-start gap-7">
            {/* Form card */}
            <section className="min-w-0 overflow-hidden rounded-[18px] bg-white" style={{ flex: '999 1 640px', border: '1px solid #E3E7EF' }}>
              <div className="flex flex-col gap-1.5 border-b px-5 pb-5 pt-6 md:px-8 md:pt-7" style={{ borderColor: '#E3E7EF' }}>
                <div className="text-[13px] font-semibold tracking-[0.14em]" style={{ color: '#8A5A00' }}>
                  SERVICE {position + 1} OF {order.length} IN YOUR REQUEST
                </div>
                <h1 className="m-0 text-[34px] font-semibold md:text-[40px]" style={{ color: '#0E1E4A' }}>
                  {STEP_TITLES[tab]}
                </h1>
              </div>

              <div className="flex flex-col gap-7 px-5 py-6 md:px-8 md:py-7">
                {/* Shared contact row */}
                <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
                  <legend className="mb-4 p-0 text-[17px] font-semibold" style={{ color: '#0E1E4A' }}>Lead traveller</legend>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Full name">
                      <input
                        className="brand-input w-full"
                        autoComplete="name"
                        value={contact.fullName}
                        onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="brand-input w-full"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone (with country code)">
                      <input
                        type="tel"
                        autoComplete="tel"
                        className="brand-input w-full"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      />
                    </Field>
                  </div>
                </fieldset>

                <div className="h-px" style={{ background: '#E3E7EF' }} />

                <fieldset className="m-0 border-0 p-0">
                  <legend className="mb-4 p-0 text-[17px] font-semibold" style={{ color: '#0E1E4A' }}>{STEP_LEGENDS[tab]}</legend>

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
                </fieldset>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 border-t px-5 py-5 md:px-8" style={{ borderColor: '#E3E7EF', background: '#FAFBFD' }}>
                {remaining.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="text-sm font-semibold" style={{ color: '#0E1E4A' }}>Need anything else for this trip?</div>
                    <div className="flex flex-wrap gap-2.5">
                      {remaining.map((i) => {
                        const Icon = STEP_ICONS[i];
                        return (
                          <button key={i} type="button" onClick={() => addService(i)} className="brand-btn-secondary">
                            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                            Add {STEP_SHORT[i].toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stepError && (
                  <p role="alert" className="m-0 text-sm font-medium" style={{ color: '#B42318' }}>{stepError}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: '#E3E7EF' }}>
                  <button type="button" onClick={goBack} className="smt-btn-text">
                    ← {position === 0 ? 'Back' : `Back to ${STEP_SHORT[order[position - 1]].toLowerCase()}`}
                  </button>
                  <button onClick={completeNow} disabled={sending} className="brand-btn-gold ml-auto">
                    {sending
                      ? 'Sending…'
                      : `Submit booking request${order.length > 1 ? ` (${order.length} services)` : ''}`}
                  </button>
                </div>
              </div>
            </section>

            {/* Side panel */}
            <aside className="flex flex-col gap-4" style={{ flex: '1 1 300px' }}>
              <div className="flex flex-col gap-4 rounded-[18px] bg-white p-6" style={{ border: '1px solid #E3E7EF' }}>
                <div className="text-[17px] font-semibold" style={{ color: '#0E1E4A' }}>What happens next</div>
                {[
                  'Add any other services at the bottom of the form, then submit once.',
                  'Our team checks availability with our suppliers.',
                  'You receive one quote by email.',
                ].map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm leading-normal" style={{ color: '#4F596C' }}>
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[13px] font-semibold" style={{ background: '#EEF1F8', color: '#1B3A9E' }}>
                      {i + 1}
                    </span>
                    {t}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 rounded-[18px] p-6 text-white" style={{ background: '#0E1E4A' }}>
                <div className="font-serif text-[26px] font-semibold">Rather chat?</div>
                <div className="text-sm leading-normal" style={{ color: '#D5DBEA' }}>
                  Send the trip details on WhatsApp and we&apos;ll take it from there.
                </div>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="brand-btn-gold text-center no-underline">
                  Open WhatsApp
                </a>
              </div>
              <p className="m-0 px-1 text-[13px] leading-normal" style={{ color: '#4F596C' }}>
                Your details are used only to quote and book this trip, in line with POPIA.
              </p>
            </aside>
          </div>
        </div>
      )}

      {/* Could-not-send popup: nothing typed is lost */}
      {sendFailed && (
        <Modal labelledBy="smt-failed-title">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[34px] font-bold" style={{ background: '#FDECEA', color: '#B42318' }} aria-hidden="true">
              !
            </div>
            <h3 id="smt-failed-title" className="modal-title">We couldn&apos;t send your request</h3>
            <p className="modal-copy">
              Your details are still here. Please try again — or send them to us on WhatsApp or email in one tap and we&apos;ll take it from there.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setSendFailed(false);
                  completeNow();
                }}
                className="brand-btn-gold w-full"
              >
                Try again
              </button>
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(requestSummary())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-btn-whatsapp flex-1"
              >
                <MessageCircle size={18} aria-hidden="true" /> Send on WhatsApp
              </a>
              <a
                href={`mailto:Dumisani@smtravel.co.za?subject=${encodeURIComponent('Booking request from website')}&body=${encodeURIComponent(requestSummary())}`}
                className="brand-btn-secondary flex-1"
              >
                Send by email
              </a>
            </div>
            <button type="button" onClick={() => setSendFailed(false)} className="smt-btn-text text-sm">
              Back to my request
            </button>
          </div>
        </Modal>
      )}

      {/* Thank-you popup */}
      {done && (
        <Modal labelledBy="smt-thanks-title">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: '#E5A50A', color: '#0E1E4A' }}>
              <Check size={34} strokeWidth={2.6} aria-hidden="true" />
            </div>
            <h3 id="smt-thanks-title" className="modal-title">Request received</h3>
            <p className="modal-copy">
              Thank you{firstName ? `, ${firstName}` : ''}. Our team is preparing your quote
              {contact.email ? (
                <>
                  {' '}and will email it to <strong style={{ color: '#1B2232' }}>{contact.email}</strong>.
                </>
              ) : (
                '.'
              )}
            </p>
            <div className="rounded-xl px-5 py-3 text-sm" style={{ background: '#F5F7FB', border: '1px solid #E3E7EF', color: '#4F596C' }}>
              {bookingRef ? (
                <>
                  Your reference: <strong style={{ color: '#0E1E4A' }}>{bookingRef}</strong>. A confirmation email is on its way.
                </>
              ) : (
                'You will receive a confirmation email for your booking.'
              )}
            </div>
            <div className="modal-actions">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="brand-btn-whatsapp flex-1">
                <MessageCircle size={18} aria-hidden="true" /> WhatsApp us
              </a>
              <button onClick={() => setDone(false)} className="brand-btn-primary flex-1">
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shared styles */}
      <style jsx global>{`
        .brand-input {
          border: 1px solid #cdd4e1;
          background: #fff;
          color: var(--brand-ink);
          padding: 0.65rem 0.875rem;
          min-height: 48px;
          border-radius: 0.625rem;
          outline: none;
          font-family: inherit;
          font-size: 15px;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.02s;
        }
        .brand-input::placeholder {
          color: #6b7486;
        }
        .brand-input:focus {
          border-color: var(--brand-navy);
          box-shadow: 0 0 0 4px var(--brand-amber-33);
        }
        .brand-btn-primary,
        .brand-btn-secondary,
        .brand-btn-gold,
        .brand-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          min-height: 48px;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: transform 0.06s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
        }
        .brand-btn-primary {
          color: #fff;
          background: var(--brand-navy);
          border: 1px solid var(--brand-navy);
          box-shadow: 0 8px 16px var(--brand-navy-22);
        }
        .brand-btn-primary:hover {
          background: #1a2d66;
        }
        .brand-btn-secondary {
          background: #fff;
          color: var(--brand-navy);
          border: 1px solid var(--brand-navy);
        }
        .brand-btn-secondary:hover {
          background: var(--brand-navy-0d);
        }
        .brand-btn-gold {
          background: #e5a50a;
          color: #0e1e4a;
          border: 1px solid #e5a50a;
        }
        .brand-btn-gold:hover {
          background: #f2b52a;
          color: #0e1e4a;
        }
        .brand-btn-whatsapp {
          background: #fff;
          color: #1f7a45;
          border: 1px solid #1f7a45;
        }
        .brand-btn-whatsapp:hover {
          background: #1f7a4510;
          color: #1f7a45;
        }
        .brand-btn-primary:active,
        .brand-btn-secondary:active,
        .brand-btn-gold:active {
          transform: translateY(1px);
        }
        .brand-btn-primary:disabled,
        .brand-btn-secondary:disabled,
        .brand-btn-gold:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .smt-btn-text {
          min-height: 44px;
          padding: 0.75rem 0.375rem;
          color: #2a3346;
          font-weight: 500;
          background: none;
          border: 0;
        }
        .smt-btn-text:hover {
          color: var(--brand-navy);
        }
        .smt-service-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 62px;
          padding: 0 1.25rem;
          border-radius: 14px;
          background: #fff;
          color: #0e1e4a;
          font-weight: 600;
          font-size: 17px;
          border: 0;
          transition: background 0.2s, transform 0.06s;
        }
        .smt-service-btn svg {
          color: #1b3a9e;
        }
        .smt-service-btn .smt-service-arrow {
          color: #8a5a00;
          transition: transform 0.2s;
        }
        .smt-service-btn:hover {
          background: #e5a50a;
        }
        .smt-service-btn:hover svg,
        .smt-service-btn:hover .smt-service-arrow {
          color: #0e1e4a;
        }
        .smt-service-btn:hover .smt-service-arrow {
          transform: translateX(3px);
        }
        .smt-service-btn:active {
          transform: translateY(1px);
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(14, 30, 74, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          z-index: 100;
        }
        .modal-card {
          width: min(100%, 540px);
          max-height: 90vh;
          overflow-y: auto;
          background: var(--brand-paper);
          border-radius: 22px;
          box-shadow: 0 30px 60px rgba(14, 30, 74, 0.35);
          padding: 2.25rem 2rem;
        }
        .modal-title {
          margin: 0;
          font-weight: 600;
          color: var(--brand-navy);
          font-size: 2.25rem;
          line-height: 1.1;
          text-align: center;
        }
        .modal-copy {
          margin: 0;
          color: #4f596c;
          font-size: 1rem;
          line-height: 1.6;
          text-align: center;
          max-width: 420px;
        }
        .modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          width: 100%;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header shown on every screen: logo, phone, email, WhatsApp
// ---------------------------------------------------------------------------
function SiteHeader({ onHome }) {
  const logo = (
    <img src="/smt-logo.png" alt="Solid Matter Travel" className="block h-10 w-auto md:h-12" width={145} height={48} />
  );
  return (
    <header className="bg-white" style={{ borderBottom: '3px solid #E5A50A' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 md:px-8">
        {onHome ? (
          <button type="button" onClick={onHome} aria-label="Solid Matter Travel — back to start" className="border-0 bg-transparent p-0">
            {logo}
          </button>
        ) : (
          logo
        )}
        <div className="flex items-center gap-4 text-sm md:gap-5" style={{ color: '#4F596C' }}>
          <a href="tel:+27104460125" className="hidden sm:inline" style={{ color: '#4F596C' }}>
            +27 10 446 0125
          </a>
          <a href="mailto:Dumisani@smtravel.co.za" className="hidden lg:inline" style={{ color: '#4F596C' }}>
            Dumisani@smtravel.co.za
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 font-medium text-white"
            style={{ background: '#1F7A45' }}
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// Shown only on preview links, never on book.smtravel.co.za
function DemoBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(window.location.hostname !== 'book.smtravel.co.za');
  }, []);
  if (!show) return null;
  return (
    <div className="px-4 py-2 text-center text-sm font-semibold" style={{ background: '#FDF3DA', color: '#8A5A00', borderBottom: '1px solid #E5A50A' }}>
      DEMO PREVIEW — nothing you submit here is sent to Solid Matter Travel
    </div>
  );
}
