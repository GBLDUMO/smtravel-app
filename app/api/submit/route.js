// app/api/submit/route.js
export const runtime = "nodejs";

import * as React from "react";
import { Resend } from "resend";
import TravelBookingEmail from "../../../emails/TravelBookingEmail";

// ---------------- Email (Resend) ----------------
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.SENDER_EMAIL;      // e.g. info@smtravel.co.za (verified on Resend)
const BACKOFFICE = process.env.BACKOFFICE_EMAIL;  // optional BCC

// ---------------- Google Sheet webhook (Apps Script) ----------------
const GSHEET_URL = process.env.GSHEET_WEBHOOK_URL;       // prefer the script.googleusercontent.com URL
const GSHEET_SECRET = process.env.GSHEET_WEBHOOK_SECRET; // must match SECRET in Apps Script

// === Atomic Booking ID from Apps Script, with a local fallback ===
async function getNextBookingId() {
  const base = GSHEET_URL;
  const secret = GSHEET_SECRET;

  if (!base || !secret) {
    console.warn("GAS env missing; using local fallback ID.");
    const n = Date.now().toString().slice(-6);
    return `SMT-QU${n}`;
  }

  // Put action=nextId in the query so GAS reads e.parameter.action
  const u = new URL(base);
  u.searchParams.set("action", "nextId");

  try {
    const res = await fetch(u.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }), // keep body simple; action is in query
      redirect: "follow",
    });

    const text = await res.text(); // GAS often returns text/plain
    let data = null;
    try { data = JSON.parse(text); } catch {}

    if (data && data.bookingId) {
      return data.bookingId; // e.g., "SMT-QU1001"
    }

    console.error("nextId raw response:", res.status, text?.slice(0, 300));
    throw new Error("missing bookingId from GAS");
  } catch (e) {
    console.error("GAS nextId failed:", String(e));
    // Fallback so emails still work while you tweak the script
    const n = Date.now().toString().slice(-6);
    return `SMT-QU${n}`;
  }
}

async function sendToSheet(booking) {
  if (!GSHEET_URL || !GSHEET_SECRET) {
    console.log("Sheet skipped: missing GSHEET env vars", {
      hasUrl: !!GSHEET_URL,
      hasSecret: !!GSHEET_SECRET,
    });
    return { ok: false, error: "Missing GSHEET env vars" };
  }

  try {
    const res = await fetch(GSHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: GSHEET_SECRET, ...booking }),
    });

    const text = await res.text(); // GAS often returns text/plain
    console.log("Sheet response:", res.status, text?.slice(0, 200));
    return { status: res.status, body: text };
  } catch (err) {
    console.error("Sheet push failed:", err);
    return { ok: false, error: String(err) };
  }
}

// ---------------- Helpers ----------------
const isBlank = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && v.trim() === "");

const addIf = (obj, key, value) => {
  if (!isBlank(value)) obj[key] = typeof value === "string" ? value.trim() : value;
};

// ---------------- Handler ----------------
export async function POST(req) {
  try {
    const body = await req.json();

    // ===== Traveller =====
    const fullName  = body.contact?.fullName;
    const userEmail = body.contact?.email;
    const phone     = body.contact?.phone;

    // ===== Trip (Hotel fields) =====
    const destCity   = body.hotel?.destCity;
    const checkIn    = body.hotel?.checkIn;
    const checkOut   = body.hotel?.checkOut;
    const nights     = body.hotel?.nights;
    const adults     = body.hotel?.adults;
    const bookingRef = body.hotel?.bookingRef || body.bookingRef;

    // ===== Hotel (trigger = mealType) =====
    const hotelCategory = body.hotel?.hotelCategory;
    const roomType      = body.hotel?.roomType;
    const mealType      = body.hotel?.mealType; // presence means “hotel section completed”
    const rooms         = body.hotel?.rooms;
    const hotelBooked   = body.hotel?.hotelName || body.hotel?.selectedHotel || "";

    // ===== Flights =====
    const from        = body.flights?.from;
    const to          = body.flights?.to;
    const departDate  = body.flights?.departDate;
    const returnDate  = body.flights?.returnDate;
    const tripType    = body.flights?.tripType;
    const segmentsRaw = Array.isArray(body.flights?.segments) ? body.flights?.segments : [];
    const segments = segmentsRaw
      .map(s => ({
        from: s?.from ?? "",
        to: s?.to ?? "",
        departDate: s?.departDate ?? "",
        tripType: s?.tripType ?? "",
        returnDate: s?.returnDate ?? "",
      }))
      .filter(s => !!(s.from || s.to || s.departDate || s.tripType));

    // ===== Car =====
    const vehicleType   = body.car?.carType;
    const dropOffDate   = body.car?.carReturnDate;
    const carPickup     = body.car?.carPickup;
    const carReturn     = body.car?.carReturn;
    const carPickupDate = body.car?.carPickupDate;
    const carNotes      = body.car?.carNotes;

    // ===== Transfer =====
    const tFrom = body.transfer?.tFrom;
    const tTo   = body.transfer?.tTo;
    const tDate = body.transfer?.tDate;
    const tType = body.transfer?.tType;

    // ===== Notes =====
    const notes = body.hotel?.notes ?? body.notes;

    // Guardrails
    if (isBlank(userEmail)) {
      return Response.json({ ok: false, error: "Missing recipient email" }, { status: 400 });
    }
    if (isBlank(FROM_EMAIL)) {
      return Response.json({ ok: false, error: "Missing SENDER_EMAIL env var" }, { status: 500 });
    }

    // Decide which sections to include
    const hasHotel    = !isBlank(mealType);
    const hasFlights  = !!(to || segments.length > 0);
    const hasCar      = !!(vehicleType);
    const hasTransfer = !!(tFrom || tTo || tDate || tType);

    // === Single source of truth Booking ID ===
    const bookingId = await getNextBookingId();
    const quoteRef  = bookingId; // keep old prop name for compatibility

    // Build props for the email component
    const emailProps = {};
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

    if (hasHotel) {
      addIf(emailProps, "hotelCategory", hotelCategory);
      addIf(emailProps, "roomType", roomType);
      addIf(emailProps, "mealType", mealType);
    }

    if (hasFlights) {
      addIf(emailProps, "from", from);
      addIf(emailProps, "to", to);
      addIf(emailProps, "departDate", departDate);
      addIf(emailProps, "returnDate", returnDate);
      addIf(emailProps, "tripType", tripType);
      if (segments.length > 0) emailProps.segments = segments;
    }

    if (hasCar) {
      addIf(emailProps, "vehicleType", vehicleType);
      addIf(emailProps, "dropOffDate", dropOffDate);
      addIf(emailProps, "carPickup", carPickup);
      addIf(emailProps, "carReturn", carReturn);
      addIf(emailProps, "carPickupDate", carPickupDate);
      addIf(emailProps, "carNotes", carNotes);
    }

    if (hasTransfer) {
      addIf(emailProps, "tFrom", tFrom);
      addIf(emailProps, "tTo", tTo);
      addIf(emailProps, "tDate", tDate);
      addIf(emailProps, "tType", tType);
    }

    addIf(emailProps, "notes", notes);

    // Add IDs for the email template
    addIf(emailProps, "quoteRef", quoteRef);
    addIf(emailProps, "bookingId", bookingId);

    // Send email
    const send = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      bcc: !isBlank(BACKOFFICE) ? [BACKOFFICE] : undefined,
      reply_to: BACKOFFICE || undefined,
      subject: `We’ve received your travel request — ${bookingId}`,
      react: <TravelBookingEmail {...emailProps} />,
      text: `Thanks${fullName ? ` ${fullName}` : ""}. Your Booking ID is ${bookingId}. We’ll be in touch shortly.`,
    });
    console.log("RESEND RESULT", { ok: !!send.data?.id, id: send.data?.id || null, error: send.error || null });

    // ---------- Push a row to Google Sheet ----------
    await sendToSheet({
      bookingId, // column B
      service: hasHotel ? "Hotel" : (hasFlights ? "Flight" : (hasCar ? "Car" : (hasTransfer ? "Transfer" : "General"))),
      name: fullName || "",
      email: userEmail || "",
      phone: phone || "",
      travelingTo: destCity || "",
      hotelBooked: hotelBooked || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      guests: adults || "",
      notes: notes || "",
      source: "SMT-App",
    });
    // -------------------------------------------------

    return Response.json({
      ok: !!send.data?.id,
      id: send.data?.id ?? null,
      error: send.error ?? null,
      bookingId,
      quoteRef, // kept for old clients if they read this name
    });
  } catch (e) {
    console.error("SEND/GSHEET ERROR:", e);
    return Response.json({ ok: false, caught: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, route: "/api/submit", method: "GET" });
}
