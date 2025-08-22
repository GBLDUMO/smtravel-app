'use client';
import Image from 'next/image';
import React from 'react';

type Props = {
  sections?: string[];
  onStart?: (index: number) => void;
};

export default function SolidMatterHero({ sections = [], onStart }: Props) {
  return (
    <section className="mt-0">
      <div className="relative isolate min-h-screen w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden bg-slate-900">

        {/* Background image (AVIF + JPG fallback) */}
        <picture>
          <source srcSet="/images/call-center-hero.avif" type="image/avif" />
          <img
            src="/images/call-center-hero.jpg"
            alt="Travel agents at work"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Soft gradient over the photo for legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/25 to-slate-900/55" />

        {/* Subtle Africa overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-35">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg"
            alt="Africa outline"
            className="max-h-[65%] max-w-[65%] object-contain mix-blend-overlay"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 grid items-start gap-10 md:grid-cols-2">

          {/* Welcome card (lighter, semi-transparent) */}
          <div className="md:pt-10">
            <div className="rounded-3xl bg-white/75 p-8 shadow-xl backdrop-blur">
              <h1 className="text-3xl sm:text-4xl leading-tight">
                <span className="block text-black">Welcome to</span>
                <span className="font-bold text-blue-900">Solid Matter Travel</span>
              </h1>
              <p className="mt-2 text-base text-black/80">Manage all your bookings in one place.</p>
              <p className="mt-4 text-sm text-black/80">
                <span className="font-semibold">Solid Matter Travel</span> is your single hub for requests across
                hotels, flights, car hire and airport transfers. One smart form, auto‑filled details, and direct routing
                to our team for fast confirmations.
              </p>
            </div>
          </div>

          {/* Right: menu card */}
          <div className="md:pt-24">
            <div className="mx-auto max-w-sm rounded-3xl bg-white/12 p-6 text-white backdrop-blur ring-1 ring-white/20">
              <h3 className="text-lg font-semibold mb-6">Choose your service</h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => onStart?.(0)}
                  className="rounded-2xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Hotel Booking
                </button>
                <button
                  onClick={() => onStart?.(1)}
                  className="rounded-2xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Flights
                </button>
                <button
                  onClick={() => onStart?.(2)}
                  className="rounded-2xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Car Hire
                </button>
                <button
                  onClick={() => onStart?.(3)}
                  className="rounded-2xl px-6 py-4 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Airport Transfer
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

