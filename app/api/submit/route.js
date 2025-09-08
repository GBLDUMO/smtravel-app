// app/api/submit/route.js
export const runtime = "nodejs";

import * as React from "react";
import { Resend } from "resend";
import TravelBookingEmail from "../../../emails/TravelBookingEmail";

// NEW: simple file-based counter for quote refs
import { promises as fs } from "fs";
const COUNTER_FILE = "/tmp/smt_quote_counter.txt";
const COUNTER_START = 10100; // first number => SMT-Q10100

async function getNextQuoteRef() {
  try {
    let n;
    try {
      const raw = await fs.readFile(COUNTER_FILE, "utf8");
      n = parseInt(raw.trim(), 10);
      if (!Number.isFinite(n)) n = COUNTER_START;
    } catch {
      n = COUNTER_START; // if file missing on cold start
    }
    const next = n + 1;
    await fs.writeFile(COUNTER_FILE, String(next), "utf8");
    return `SMT-Q${n}`;
  } catch {
    // Fallback: time-based (still unique-ish) if /tmp fails for any reason
    const fallback = Date.now().toString().slice(-6);
    return `SMT-Q${fallback}`;
  }
}

// --- Resend setup (env vars)
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.SENDER_EMAIL;     // e.g. info@smtravel.co.za (must be verified in Resend)
const BACKOFFICE = process.env.BACKOFFICE_EMAIL; // optional BCC

// --- Helpers
const isBlank = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && v.trim() === "");

const addIf = (obj, key, value) => {
  if (!isBlank(value)) obj[key] = typeof value === "string" ? value.trim() : value;
};

export async function POST(req) {
  try {
    const body = await req.json();

    // ===== Traveller =====
    const fullName  = body.contact?.fullName;
    const userEmail = body.contact?.email;
    const phone     = body.contact?.phone;

    // ===== Trip (mainly from Hotel) =====
    const destCity   = body.hotel?.destCity;
    const checkIn    = body.hotel?.checkIn;
    const checkOut   = body.hotel?.checkOut;
    const nights     = body.hotel?.nights;
    const adults     = body.hotel?.adults;
    const bookingRef = body.hotel?.bookingRef || body.bookingRef;

    // ===== Hotel (trigger = mealType) =====
    const hotelCategory = body.hotel?.hotelCategory;
    const roomType      = body.hotel?.roomType;
    const mealType      = body.hotel?.mealType;
    const rooms         = body.hotel?.rooms; // optional

    // ===== Flights (trigger = base `to` or any extra segments) =====
    const from        = body.flights?.from;
    const to          = body.flights?.to;
    const departDate  = body.flights?.departDate;
    const returnDate  = body.flights?.returnDate;
    const tripType    = body.flights?.tripType;
    const segmentsRaw = Array.isArray(body.flights?.segments) ? body.flights.segments : [];

    // Keep only segments that have at least a from/to/date/tripType
    const segments = segmentsRaw
      .map(s => ({
        from: s?.from ?? "",
        to: s?.to ?? "",
        departDate: s?.departDate ?? "",
        tripType: s?.tripType ?? "",
        returnDate: s?.returnDate ?? "",
      }))
      .filter(s => !!(s.from || s.to || s.departDate || s.tripType));

    // ===== Car Hire (trigger = carType ONLY) =====
    const vehicleType   = body.car?.carType;        // the trigger
    const dropOffDate   = body.car?.carReturnDate;
    const carPickup     = body.car?.carPickup;
    const carReturn     = body.car?.carReturn;
    const carPickupDate = body.car?.carPickupDate;
    const carNotes      = body.car?.carNotes;       // defined to avoid ReferenceError

    // ===== Airport Transfer (trigger = at least one field) =====
    const tFrom = body.transfer?.tFrom;
    const tTo   = body.transfer?.tTo;
    const tDate = body.transfer?.tDate;
    const tType = body.transfer?.tType;

    // ===== Global Notes =====
    const notes = body.hotel?.notes ?? body.notes;

    // --- Guardrails
    if (isBlank(userEmail)) {
      return Response.json({ ok: false, error: "Missing recipient email" }, { status: 400 });
    }
    if (isBlank(FROM_EMAIL)) {
      return Response.json({ ok: false, error: "Missing SENDER_EMAIL env var" }, { status: 500 });
    }

    // --- Decide which sections to include
    const hasHotel    = !isBlank(mealType);
    const hasFlights  = !!(to || segments.length > 0);
    // IMPORTANT: Car section included ONLY if carType/vehicleType is selected
    const hasCar      = !!vehicleType;
    const hasTransfer = !!(tFrom || tTo || tDate || tType);

    // --- Build props for the email component (only what’s present)
    const emailProps = {};

    // Traveller & Trip
    addIf(emailProps, "fullName", fullName);
    addIf(emailProps, "email", userEmail);
    addIf(emailProps, "phone", phone);

    addIf(emailProps, "destCity", destCity);
    addIf(emailProps, "checkIn", checkIn);
    addIf(emailProps, "checkOut", checkOut);
    addIf(emailProps, "nights", nights);
    addIf(emailProps, "adults", adults);
    addIf(emailProps, "bookingRef", bookingRef);
    addIf(emailProps, "rooms", rooms);

    // Hotel (only when "completed" by mealType)
    if (hasHotel) {
      addIf(emailProps, "hotelCategory", hotelCategory);
      addIf(emailProps, "roomType", roomType);
      addIf(emailProps, "mealType", mealType); // trigger
    }

    // Flights (base leg + optional segments)
    if (hasFlights) {
      addIf(emailProps, "from", from);
      addIf(emailProps, "to", to);
      addIf(emailProps, "departDate", departDate);
      addIf(emailProps, "returnDate", returnDate);
      addIf(emailProps, "tripType", tripType);
      if (segments.length > 0) {
        emailProps.segments = segments;
      }
    }

    // Car (include ONLY if user selected Car Type)
    if (hasCar) {
      addIf(emailProps, "vehicleType", vehicleType);    // trigger present
      addIf(emailProps, "dropOffDate", dropOffDate);
      addIf(emailProps, "carPickup", carPickup);
      addIf(emailProps, "carReturn", carReturn);
      addIf(emailProps, "carPickupDate", carPickupDate);
      addIf(emailProps, "carNotes", carNotes);
    }

    // Airport Transfer (if any field provided)
    if (hasTransfer) {
      addIf(emailProps, "tFrom", tFrom);
      addIf(emailProps, "tTo", tTo);
      addIf(emailProps, "tDate", tDate);
      addIf(emailProps, "tType", tType);
    }

    // Global notes
    addIf(emailProps, "notes", notes);

    // NEW: Generate & attach Quote Reference
    const quoteRef = await getNextQuoteRef();
    addIf(emailProps, "quoteRef", quoteRef);

    // --- Send email via Resend
    const send = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      bcc: !isBlank(BACKOFFICE) ? [BACKOFFICE] : undefined,
      reply_to: BACKOFFICE || undefined,
      subject: `We’ve received your travel request — ${quoteRef}`,
      react: <TravelBookingEmail {...emailProps} />,
    });

    return Response.json({
      ok: !!send.data?.id,
      id: send.data?.id ?? null,
      error: send.error ?? null,
      quoteRef, // echo back for logs/UI if needed
    });
  } catch (e) {
    console.error("SEND ERROR:", e);
    return Response.json({ ok: false, caught: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, route: "/api/submit", method: "GET" });
}
