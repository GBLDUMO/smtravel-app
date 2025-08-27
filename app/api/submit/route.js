// app/api/submit/route.js
export const runtime = "nodejs";

import * as React from "react";
import { Resend } from "resend";
import TravelBookingEmail from "../../../emails/TravelBookingEmail"; // if under /src, use ../../../../emails/TravelBookingEmail

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.SENDER_EMAIL;       // e.g. info@smtravel.co.za (verified)
const BACKOFFICE = process.env.BACKOFFICE_EMAIL;   // e.g. info@smtravel.co.za

// Small helpers
const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const addIf = (obj, key, value) => {
  if (!isBlank(value)) obj[key] = typeof value === "string" ? value.trim() : value;
};

export async function GET() {
  return Response.json({ ok: true, route: "/api/submit", method: "GET" });
}

export async function POST(req) {
  try {
    const body = await req.json();

    // --- Pull user input safely ---
    const fullName = body.contact?.fullName;
    const userEmail = body.contact?.email;
    const phone    = body.contact?.phone;

    // Hotel / Trip
    const destCity     = body.hotel?.destCity;
    const checkIn      = body.hotel?.checkIn;
    const checkOut     = body.hotel?.checkOut;
    const nights       = body.hotel?.nights;
    const adults       = body.hotel?.adults;
    const hotelCategory= body.hotel?.hotelCategory;
    const roomType     = body.hotel?.roomType;
    const mealType     = body.hotel?.mealType;
    const bookingRef   = body.hotel?.bookingRef || body.bookingRef; // optional

    // Flights
    const from        = body.flights?.from;
    const to          = body.flights?.to;
    const departDate  = body.flights?.departDate;

    // Car
    const vehicleType = body.car?.carType;
    const dropOffDate = body.car?.carReturnDate;

    // Notes
    const notes       = body.hotel?.notes ?? body.notes;

    // --- Required checks ---
    if (isBlank(userEmail)) {
      return Response.json({ ok: false, error: "Missing recipient email" }, { status: 400 });
    }
    if (isBlank(FROM_EMAIL)) {
      return Response.json({ ok: false, error: "Missing SENDER_EMAIL env var" }, { status: 500 });
    }

    // --- Build clean props: ONLY non-empty fields are included ---
    const emailProps = {};
    // Traveller
    addIf(emailProps, "fullName", fullName);
    addIf(emailProps, "email", userEmail);
    addIf(emailProps, "phone", phone);

    // Trip
    addIf(emailProps, "destCity", destCity);
    addIf(emailProps, "checkIn", checkIn);
    addIf(emailProps, "checkOut", checkOut);
    addIf(emailProps, "nights", nights);
    addIf(emailProps, "adults", adults);
    addIf(emailProps, "bookingRef", bookingRef);

    // Preferences
    addIf(emailProps, "hotelCategory", hotelCategory);
    addIf(emailProps, "roomType", roomType);
    addIf(emailProps, "mealType", mealType);
    addIf(emailProps, "from", from);
    addIf(emailProps, "to", to);
    addIf(emailProps, "departDate", departDate);
    addIf(emailProps, "vehicleType", vehicleType);
    addIf(emailProps, "dropOffDate", dropOffDate);

    // Notes
    addIf(emailProps, "notes", notes);

    // --- Send email (React render handled by Resend) ---
    const send = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,                                 // Traveller gets the email
      bcc: !isBlank(BACKOFFICE) ? [BACKOFFICE] : undefined, // Backoffice copy (optional)
      reply_to: BACKOFFICE || undefined,
      subject: "We’ve received your travel request",
      react: <TravelBookingEmail {...emailProps} />,
    });

    return Response.json({
      ok: !!send.data?.id,
      id: send.data?.id ?? null,
      error: send.error ?? null,
    });
  } catch (e) {
    console.error("SEND ERROR:", e);
    return Response.json({ ok: false, caught: String(e) }, { status: 500 });
  }
}
