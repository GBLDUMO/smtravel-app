"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plane, Hotel, Car, Navigation } from "lucide-react";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const CTAButtons = () => (
  <div className="flex flex-col gap-4 items-start">
    <button className="rounded-2xl px-6 py-4 shadow-sm transition inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
      <Hotel className="h-5 w-5" />
      <span>Hotel Booking</span>
    </button>
    <button className="rounded-2xl px-6 py-4 shadow-sm transition inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
      <Plane className="h-5 w-5" />
      <span>Flights</span>
    </button>
    <button className="rounded-2xl px-6 py-4 shadow-sm transition inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
      <Navigation className="h-5 w-5" />
      <span>Airport Transfer</span>
    </button>
    <button className="rounded-2xl px-6 py-4 shadow-sm transition inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
      <Car className="h-5 w-5" />
      <span>Car Hire</span>
    </button>
  </div>
);

const SummaryBlock = () => (
  <div className="mt-6 text-sm leading-relaxed text-black/70">
    <p>
      <span className="font-bold text-blue-900">Solid Matter Travel</span> is your single hub for trip requests across
      hotels, flights, transfers and car hire. One smart form, auto-filled details across sections, and direct routing to
      our operations team for fast turnaround. Less typing, fewer back-and-forth emails, and a simple path from request
      to confirmation.
    </p>
  </div>
);

const HeaderBar = () => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-white shadow flex items-center justify-center text-xs font-bold">SM</div>
      <div className="text-lg font-semibold">Solid Matter Travel</div>
    </div>
  </div>
);

export default function SolidMatterHero() {
  return (
    <div className="relative isolate min-h-[90vh] overflow-hidden rounded-3xl bg-slate-900">
      {/* Background photo (remote so no file setup) */}
      <img
        src="https://img.freepik.com/premium-photo/call-center-employees-working-computers-office-business-people-workplace-customer-service-support-communication-team-telemarketing-helpline-assistance-with-headsets_590464-423526.jpg"
        alt="Travel agents at work"
        className="absolute inset-0 h-full w-full object-cover brightness-115 contrast-110"
      />

      {/* Gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-900/60" />

      {/* Africa silhouette overlay (subtle) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg"
          alt="Africa map silhouette"
          className="max-h-[65%] max-w-[65%] object-contain mix-blend-overlay"
        />
      </div>

      <Container className="relative z-10">
        <HeaderBar />
        <div className="grid items-start gap-10 py-20 md:grid-cols-2">
          {/* Left: welcome copy (placed just below halfway) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
              <h1 className="text-3xl sm:text-4xl">
                <span className="block text-black">Welcome to</span>
                <span className="font-bold text-blue-900">Solid Matter Travel</span>
              </h1>
              <p className="mt-2 text-base text-black/70">Manage all your bookings in one place.</p>
              <SummaryBlock />
            </div>
          </motion.div>

          {/* Right: actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="mx-auto max-w-md rounded-3xl bg-white/10 p-6 text-white backdrop-blur ring-1 ring-white/20 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-6">Choose a service</h3>
              <CTAButtons />
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
