'use client';

import Image from 'next/image';
import Link from 'next/link';

const CARD_STYLE =
  'backdrop-blur-md bg-white/85 rounded-2xl shadow-xl border border-white/40';

export default function SolidMatterHero({
  onPick,
  sections = ['Hotel Booking', 'Flights', 'Car Hire', 'Airport Transfer'],
}: {
  onPick?: (index: number) => void;
  sections?: string[];
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220]">
      {/* Background image with AVIF->JPG fallback */}
      <picture>
        <source srcSet="/images/call-center-hero.avif" type="image/avif" />
        <Img src="/images/call-center-hero.jpg" // <-- same folder as the .avif
          alt="Travel agents at work"
          fill
          priority
          sizes="100vw"
          className="object-cover pointer-events-none select-none opacity-[0.22]"
        />
      </picture>

      {/* Subtle vignette + tint so text stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(255,255,255,0.10)_0%,rgba(11,18,32,0.85)_70%,rgba(11,18,32,1)_100%)]" />

      {/* Logo (top-left) */}
      <div className="absolute left-4 top-4 sm:left-8 sm:top-6 z-20">
        {/* if you use next/image for the logo, keep it here; plain img is fine too */}
        <img
          src="/logo.png"
          alt="Solid Matter Travel"
          className="h-16 w-auto rounded-md bg-white/90 p-2 shadow-lg border border-white/60"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-24">
        {/* Welcome card */}
        <div className={`${CARD_STYLE} p-6 sm:p-8`}>
          <p className="text-2xl sm:text-3xl font-semibold text-[#0b3c91]">
            Welcome to
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0b3c91]">
            <span className="text-[#0b3c91]">Solid Matter Travel</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-700">
            Manage all your bookings in one place.
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            <strong>Solid Matter Travel</strong> is your single hub for requests
            across hotels, flights, car hire and airport transfers. One smart
            form, auto‑filled details, and direct routing to our team for fast
            confirmations.
          </p>
        </div>

        {/* Menu card */}
        <div className={`${CARD_STYLE} p-6 sm:p-8`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow [text-shadow:0_1px_0_rgba(0,0,0,.3)] mb-4">
            Choose your service
          </h2>

          <div className="flex flex-col gap-3">
            {sections.map((label, i) => (
              <button
                key={label}
                onClick={() => onPick?.(i)}
                className="w-full rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] active:translate-y-px text-white font-semibold px-5 py-4 shadow-[0_10px_20px_rgba(37,99,235,.25)] border border-white/20 transition"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Optional: placeholder link (remove if not needed) */}
          <div className="mt-4 text-xs text-slate-600">
            <Link href="#" className="underline hover:no-underline">
              Need assistance?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
