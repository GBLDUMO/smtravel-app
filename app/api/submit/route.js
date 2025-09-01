export const runtime = "nodejs";

import * as React from "react";
import { Resend } from "resend";
import TravelBookingEmail from "../../../emails/TravelBookingEmail"; // adjust ../ depth if needed

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.SENDER_EMAIL;
const BACKOFFICE = process.env.BACKOFFICE_EMAIL;

const isBlank = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && v.trim() === "");

const addIf = (obj, key, value) => {
  if (!isBlank(value)) {
    obj[key] = typeof value === "string" ? value.trim() : value;
  }
};

export async function POST(req) {
  try {
    const body = await req.json();

    // Traveller
    const fullName = body.contact?.fullName;
    const userEmail = body.contact?.email;
    const phone = body.contact?.phone;

    // Trip (shared)
    const destCity = body.hotel?.destCity;
    const checkIn = body.hotel?.checkIn;
    const checkOut = body.hotel?.checkOut;
    const nights = body.hotel?.nights;
    const adults = body.hotel?.adults;
    const bookingRef = body.hotel?.bookingRef || body.bookingRef;

    // Hotel (trigger = mealType)
    const hotelCategory = body.hotel?.hotelCategory;
    const roomType = body.hotel?.roomType;
    const mealType = body.hotel?.mealType; // TRIGGER

    // Flights (trigger = to)
    const from = body.flights?.from;
    const to = body.flights?.to; // TRIGGER
    const departDate = body.flights?.departDate;

    // Car (UPDATED trigger = carReturnDate)
    const vehicleType = body.car?.carType;
    const dropOffDate = body.car?.carReturnDate; // TRIGGER
    const carPickup = body.car?.carPickup;
    const carReturn = body.car?.carReturn;
    const carPickupDate = body.car?.carPickupDate;

    // Transfer (trigger = tType)
    const tFrom = body.transfer?.tFrom;
    const tTo = body.transfer?.tTo;
    const tDate = body.transfer?.tDate;
    const tType = body.transfer?.tType; // TRIGGER

    // Notes
    const notes = body.hotel?.notes ?? body.notes;

    // Required checks
    if (isBlank(userEmail)) {
      return Response.json(
        { ok: false, error: "Missing recipient email" },
        { status: 400 }
      );
    }
    if (isBlank(FROM_EMAIL)) {
      return Response.json(
        { ok: false, error: "Missing SENDER_EMAIL env var" },
        { status: 500 }
      );
    }

    // Build props ONLY with completed sections
    const emailProps = {};

    // Traveller & basic trip info (always safe to include if present)
    addIf(emailProps, "fullName", fullName);
    addIf(emailProps, "email", userEmail);
    addIf(emailProps, "phone", phone);

    addIf(emailProps, "destCity", destCity);
    addIf(emailProps, "checkIn", checkIn);
    addIf(emailProps, "checkOut", checkOut);
    addIf(emailProps, "nights", nights);
    addIf(emailProps, "adults", adults);
    addIf(emailProps, "bookingRef", bookingRef);

    // HOTEL — include only if TRIGGER present
    if (!isBlank(mealType)) {
      addIf(emailProps, "hotelCategory", hotelCategory);
      addIf(emailProps, "roomType", roomType);
      addIf(emailProps, "mealType", mealType); // trigger
    }

    // FLIGHTS — include only if TRIGGER present
    if (!isBlank(to)) {
      addIf(emailProps, "from", from);
      addIf(emailProps, "to", to); // trigger
      addIf(emailProps, "departDate", departDate);
    }

    // Car: include ONLY if trigger present
if (!isBlank(vehicleType) || !isBlank(dropOffDate)) {
  addIf(emailProps, "vehicleType", vehicleType);   // trigger
  addIf(emailProps, "dropOffDate", dropOffDate);

  // NEW: also include real fields if present
  addIf(emailProps, "carPickup", carPickup);
  addIf(emailProps, "carReturn", carReturn);
  addIf(emailProps, "carPickupDate", carPickupDate);
}


    // TRANSFER — include only if TRIGGER present
    if (!isBlank(tType)) {
      addIf(emailProps, "tFrom", tFrom);
      addIf(emailProps, "tTo", tTo);
      addIf(emailProps, "tDate", tDate);
      addIf(emailProps, "tType", tType); // trigger
    }

    // Notes (optional)
    addIf(emailProps, "notes", notes);

    // Send to user (and BCC backoffice if configured)
    const send = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      bcc: !isBlank(BACKOFFICE) ? [BACKOFFICE] : undefined,
      reply_to: BACKOFFICE || undefined,
      subject: "We’ve received your travel request",
      // Using Resend's React email rendering:
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

export async function GET() {
  return Response.json({ ok: true, route: "/api/submit", method: "GET" });
}
