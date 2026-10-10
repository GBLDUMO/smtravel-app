'use client';

import { useState } from 'react';
import { ArrowRight, BedDouble, Car, Check, MessageCircle, Plane, PlaneLanding, Plus, X } from 'lucide-react';

import Modal from '@/components/Modal';
import Field from '@/components/Field';

import HotelBooking from '@/components/HotelBooking';
import Flights from '@/components/Flights';
import CarHire from '@/components/CarHire';
import AirportTransfer from '@/components/AirportTransfer';

// Shared (order must match: Hotel, Flights, Car Hire, Airport Transfer)
import { SECTIONS } from '@/lib/constants';
import { isRequiredFilledFactory } from '@/lib/helpers';

const WHATSAPP_URL = 'https://wa.me/971582003251';

// Display copy per service (index matches SECTIONS)
const SERVICES = [
  { title: 'Hotel booking', short: 'Hotel', button: 'Hotel Booking', blurb: 'Hotels, lodges and stays beyond the major cities', Icon: BedDouble },
  { title: 'Flights', short: 'Flights', button: 'Flights', blurb: 'Domestic, regional and international', Icon: Plane },
  { title: 'Car hire', short: 'Car hire', button: 'Car Hire', blurb: 'Self-drive, collected where you land', Icon: Car },
  { title: 'Airport transfer', short: 'Airport transfer', button: 'Airport Transfer', blurb: 'Chauffeured, airport to hotel', Icon: PlaneLanding },
];

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
    hotelCategory: '',
    mealType: '', // the back office treats a hotel as requested only when this is filled
    roomType: '',
    specificHotel: '',
    notes: '',
  };
}
function initialFlights() {
  return { from: '', to: '', departDate: '', returnDate: '', tripType: '', segments: [] };
}
function initialCar() {
  return { carPickup: '', carReturn: '', carPickupDate: '', carReturnDate: '', carType: '', carNotes: '' };
}
function initialTransfer() {
  return { tFrom: '', tTo: '', tDate: '', tType: '' };
}
const NONE_SELECTED = { 0: false, 1: false, 2: false, 3: false };

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

  // 'landing' = choose services, 'form' = one page with every chosen service
  const [view, setView] = useState('landing');
  const [selected, setSelected] = useState(NONE_SELECTED);

  // form slices
  const [contact, setContact] = useState(initialContact());
  const [hotel, setHotel] = useState(initialHotel());
  const [flights, setFlights] = useState(initialFlights());
  const [car, setCar] = useState(initialCar());
  const [transfer, setTransfer] = useState(initialTransfer());

  // car “touched” flags for mirroring
  const [carPickupTouched, setCarPickupTouched] = useState(false);
  const [carReturnTouched, setCarReturnTouched] = useState(false);

  // UX
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState([]); // indexes of chosen services with required fields empty
  const [contactMissing, setContactMissing] = useState(false);

  const chosen = SERVICES.map((_, i) => i).filter((i) => selected[i]);
  const enabled = { 1: !!selected[1], 2: !!selected[2], 3: !!selected[3] };
  const baseRequired = isRequiredFilledFactory({ hotel, flights, car, transfer, enabled });

  // Required fields per service (base rules + the field the back office needs to detect the service)
  function isComplete(i) {
    if (!baseRequired(i)) return false;
    if (i === 0) return !!hotel.mealType;
    if (i === 1) return !!flights.tripType;
    if (i === 2) return !!car.carType;
    return true;
  }

  function toggle(i) {
    setSelected((prev) => ({ ...prev, [i]: !prev[i] }));
    setMissing((m) => m.filter((x) => x !== i));
  }

  function startForm() {
    if (chosen.length === 0) return;
    setView('form');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
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

  async function submit() {
    const needContact = !contact.fullName.trim() || !contact.email.trim();
    const incomplete = chosen.filter((i) => !isComplete(i));
    setContactMissing(needContact);
    setMissing(incomplete);
    if (needContact || incomplete.length) {
      const first = needContact ? 'smt-contact' : `smt-service-${incomplete[0]}`;
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setSending(true);
    // Services the traveller did not choose are sent blank, so the back office only sees what was requested
    await post({
      contact,
      hotel: selected[0] ? hotel : initialHotel(),
      flights: selected[1] ? flights : initialFlights(),
      car: selected[2] ? car : initialCar(),
      transfer: selected[3]
        ? {
            ...transfer,
            tFrom: transfer.tFrom || (selected[1] ? flights.to : ''),
            tType: transfer.tType || 'One way',
          }
        : initialTransfer(),
      enabled,
      services: chosen.map((i) => SECTIONS[i]),
    });
    setSending(false);
    setDone(true);
  }

  function resetAll() {
    setContact(initialContact());
    setHotel(initialHotel());
    setFlights(initialFlights());
    setCar(initialCar());
    setTransfer(initialTransfer());
    setCarPickupTouched(false);
    setCarReturnTouched(false);
    setSelected(NONE_SELECTED);
    setMissing([]);
    setContactMissing(false);
    setView('landing');
  }

  const firstName = (contact.fullName || '').trim().split(/\s+/)[0];

  // ---- the form for one service, with the same cross-filling as before
  function renderService(i) {
    if (i === 0)
      return (
        <HotelBooking
          hotel={hotel}
          setHotel={(h) => {
            if (h.checkIn && !car.carPickupDate) setCar({ ...car, carPickupDate: h.checkIn });
            if (h.checkIn && !flights.departDate) setFlights({ ...flights, departDate: h.checkIn });
            if (h.checkIn && !transfer.tDate) setTransfer({ ...transfer, tDate: h.checkIn });
            setHotel(h);
          }}
        />
      );
    if (i === 1)
      return (
        <Flights
          flights={flights}
          setFlights={(nf) => {
            const nextCar = { ...car };
            if (!carPickupTouched && nf.to) {
              nextCar.carPickup = nf.to;
              if (!carReturnTouched) nextCar.carReturn = nf.to;
            }
            setCar(nextCar);
            setFlights(nf);
          }}
        />
      );
    if (i === 2)
      return (
        <CarHire
          car={car}
          setCar={(nc) => {
            if (nc.carPickup !== car.carPickup && !carPickupTouched) setCarPickupTouched(true);
            if (nc.carReturn !== car.carReturn && !carReturnTouched) setCarReturnTouched(true);
            if (!carReturnTouched && nc.carPickup !== car.carPickup) nc = { ...nc, carReturn: nc.carPickup };
            setCar(nc);
          }}
        />
      );
    return (
      <AirportTransfer
        transfer={transfer}
        flightsTo={selected[1] ? flights.to : ''}
        setTransfer={setTransfer}
      />
    );
  }

  const MISSING_HINT = [
    'Please add the destination, check-in and check-out dates, and meal type.',
    'Please add where you are flying from and to, and the trip type.',
    'Please add the pickup and return details, return date, and car type.',
    'Please add where the transfer goes to and the date.',
  ];

  return (
    <div data-smt-root className="min-h-screen" style={{ ...themeVars, background: 'var(--brand-cloud)' }}>
      <SiteHeader onHome={view === 'landing' ? undefined : () => setView('landing')} />

      {view === 'landing' ? (
        /* ---------------- Landing: choose one or more services ---------------- */
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

            {/* Choose services (multi-select) */}
            <div
              className="mx-auto flex w-full max-w-[440px] flex-col gap-3 rounded-[22px] p-6 md:p-8"
              style={{ background: 'rgba(14,30,74,0.92)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 24px 50px rgba(14,30,74,0.3)' }}
            >
              <h2 className="m-0 text-center text-[32px] font-semibold text-white md:text-[40px]">What do you need?</h2>
              <p className="m-0 mb-2 text-center text-sm" style={{ color: '#C9D1E4' }}>Tick everything for this trip — one form covers it all.</p>
              {SERVICES.map((s, i) => {
                const on = !!selected[i];
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(i)}
                    className="smt-pick"
                    data-on={on ? 'true' : 'false'}
                  >
                    <s.Icon size={22} strokeWidth={1.9} aria-hidden="true" className="smt-pick-icon" />
                    <span className="flex-1 text-left">{s.button}</span>
                    <span className="smt-pick-box" aria-hidden="true">
                      {on && <Check size={16} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={startForm}
                disabled={chosen.length === 0}
                className="brand-btn-gold mt-2 w-full"
              >
                {chosen.length === 0
                  ? 'Select at least one service'
                  : `Continue with ${chosen.length} service${chosen.length > 1 ? 's' : ''}`}
                {chosen.length > 0 && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ---------------- One page with every chosen service ---------------- */
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
          <div className="flex flex-wrap items-start gap-7">
            <div className="flex min-w-0 flex-col gap-5" style={{ flex: '999 1 640px' }}>
              {/* Title + service chips */}
              <section className="rounded-[18px] bg-white px-5 py-6 md:px-8 md:py-7" style={{ border: '1px solid #E3E7EF' }}>
                <div className="text-[13px] font-semibold tracking-[0.14em]" style={{ color: '#8A5A00' }}>YOUR TRIP REQUEST</div>
                <h1 className="m-0 mt-1 text-[34px] font-semibold md:text-[40px]" style={{ color: '#0E1E4A' }}>
                  Tell us about your trip
                </h1>
                <p className="m-0 mt-2 text-[15px]" style={{ color: '#4F596C' }}>
                  Services in this request — tap to add or remove:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICES.map((s, i) => {
                    const on = !!selected[i];
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(i)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors"
                        style={
                          on
                            ? { background: '#0E1E4A', color: '#FFFFFF', border: '1px solid #0E1E4A' }
                            : { background: '#FFFFFF', color: '#1B3A9E', border: '1px dashed #9AA6BF' }
                        }
                      >
                        {on ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <Plus size={16} strokeWidth={2.4} aria-hidden="true" />}
                        {s.short}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Lead traveller */}
              <section id="smt-contact" className="scroll-mt-4 rounded-[18px] bg-white px-5 py-6 md:px-8 md:py-7" style={{ border: contactMissing ? '2px solid #B42318' : '1px solid #E3E7EF' }}>
                <h2 className="m-0 mb-4 text-[26px] font-semibold" style={{ color: '#0E1E4A' }}>Lead traveller</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Full name">
                    <input className="brand-input w-full" autoComplete="name" value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <input type="email" required autoComplete="email" className="brand-input w-full" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  </Field>
                  <Field label="Phone (with country code)">
                    <input type="tel" autoComplete="tel" className="brand-input w-full" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  </Field>
                </div>
                {contactMissing && <p className="m-0 mt-3 text-sm font-medium" style={{ color: '#B42318' }}>Please add your name and email so we can send your quote.</p>}
              </section>

              {/* One card per chosen service */}
              {chosen.map((i) => {
                const s = SERVICES[i];
                const isMissing = missing.includes(i);
                return (
                  <section
                    key={i}
                    id={`smt-service-${i}`}
                    className="scroll-mt-4 overflow-hidden rounded-[18px] bg-white"
                    style={{ border: isMissing ? '2px solid #B42318' : '1px solid #E3E7EF' }}
                  >
                    <div className="flex items-center gap-3 border-b px-5 py-4 md:px-8" style={{ borderColor: '#E3E7EF', background: '#FAFBFD' }}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#EEF1F8', color: '#1B3A9E' }}>
                        <s.Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <h2 className="m-0 flex-1 text-[26px] font-semibold" style={{ color: '#0E1E4A' }}>{s.title}</h2>
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm font-medium"
                        style={{ color: '#4F596C', background: 'transparent', border: '1px solid #E3E7EF' }}
                        aria-label={`Remove ${s.title}`}
                      >
                        <X size={15} aria-hidden="true" /> Remove
                      </button>
                    </div>
                    <div className="px-5 py-6 md:px-8">
                      {renderService(i)}
                      {isMissing && <p className="m-0 mt-4 text-sm font-medium" style={{ color: '#B42318' }}>{MISSING_HINT[i]}</p>}
                    </div>
                  </section>
                );
              })}

              {chosen.length === 0 && (
                <section className="rounded-[18px] bg-white px-5 py-8 text-center md:px-8" style={{ border: '1px dashed #9AA6BF', color: '#4F596C' }}>
                  Add at least one service above to continue.
                </section>
              )}

              {/* Submit */}
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] px-5 py-5 md:px-8" style={{ background: '#0E1E4A' }}>
                <div className="min-w-0 text-white">
                  <div className="text-sm" style={{ color: '#C9D1E4' }}>You are requesting</div>
                  <div className="text-[17px] font-semibold">
                    {chosen.length ? chosen.map((i) => SERVICES[i].short).join(' · ') : 'No services yet'}
                  </div>
                </div>
                <button onClick={submit} disabled={sending || chosen.length === 0} className="brand-btn-gold">
                  {sending ? 'Sending…' : 'Submit booking request'}
                </button>
              </section>
            </div>

            {/* Side panel */}
            <aside className="flex flex-col gap-4 md:sticky md:top-6" style={{ flex: '1 1 300px' }}>
              <div className="flex flex-col gap-4 rounded-[18px] bg-white p-6" style={{ border: '1px solid #E3E7EF' }}>
                <div className="text-[17px] font-semibold" style={{ color: '#0E1E4A' }}>What happens next</div>
                {[
                  'Fill in the services you chose — add or remove any at the top.',
                  'Our team checks availability with our suppliers.',
                  'You receive one quote by email for the whole trip.',
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

      {/* Thank-you popup */}
      {done && (
        <Modal labelledBy="smt-thanks-title">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: '#E5A50A', color: '#0E1E4A' }}>
              <Check size={34} strokeWidth={2.6} aria-hidden="true" />
            </div>
            <h3 id="smt-thanks-title" className="modal-title">Request received</h3>
            <p className="modal-copy">
              Thank you{firstName ? `, ${firstName}` : ''}. Our team is preparing one quote for your{' '}
              {chosen.map((i) => SERVICES[i].short.toLowerCase()).join(', ')}
              {contact.email ? (
                <>
                  {' '}and will email it to <strong style={{ color: '#1B2232' }}>{contact.email}</strong>.
                </>
              ) : (
                '.'
              )}
            </p>
            <div className="rounded-xl px-5 py-3 text-sm" style={{ background: '#F5F7FB', border: '1px solid #E3E7EF', color: '#4F596C' }}>
              You will receive a confirmation email for your booking.
            </div>
            <div className="modal-actions">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="brand-btn-whatsapp flex-1">
                <MessageCircle size={18} aria-hidden="true" /> WhatsApp us
              </a>
              <button
                onClick={() => {
                  setDone(false);
                  resetAll();
                }}
                className="brand-btn-primary flex-1"
              >
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
        .smt-pick {
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 60px;
          padding: 0 1.25rem;
          border-radius: 14px;
          background: #fff;
          color: #0e1e4a;
          font-weight: 600;
          font-size: 17px;
          border: 2px solid #fff;
          transition: background 0.15s, border-color 0.15s;
        }
        .smt-pick .smt-pick-icon {
          color: #1b3a9e;
        }
        .smt-pick:hover {
          border-color: #e5a50a;
        }
        .smt-pick[data-on='true'] {
          background: #fdf3da;
          border-color: #e5a50a;
        }
        .smt-pick-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: 2px solid #9aa6bf;
          color: #0e1e4a;
          background: #fff;
        }
        .smt-pick[data-on='true'] .smt-pick-box {
          background: #e5a50a;
          border-color: #e5a50a;
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
