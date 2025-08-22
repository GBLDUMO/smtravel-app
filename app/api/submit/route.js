import { Resend } from 'resend';

/**
 * POST /api/submit
 * Expects JSON like { contact, hotel, flights, car, transfer }
 * Sends 2 emails: user (short) + back office (full).
 */
export async function POST(req) {
  try {
    const payload = await req.json();
    const { contact = {}, hotel = {}, flights = {}, car = {}, transfer = {} } = payload;

    const reference   = generateRef();
    const submittedAt = new Date().toISOString();
    const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const viewLink    = `${baseUrl}/?ref=${encodeURIComponent(reference)}`;
    const enabledList = buildEnabledList({ hotel, flights, car, transfer });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM   = process.env.SENDER_EMAIL || 'Solid Matter Travel <onboarding@resend.dev>';

    // Build email HTML
    const userHtml       = userEmailHtml({ contact, hotel, flights, car, transfer, reference, viewLink });
    const backofficeHtml = backofficeEmailHtml({ contact, hotel, flights, car, transfer, reference, submittedAt, enabledList });

    // --- User email ---
    if (contact?.email) {
      await resend.emails.send({
        from: FROM,
        to: contact.email,
        subject: `We received your booking request (Ref: ${reference})`,
        html: userHtml,
      });
    }

    // --- Back office email (supports multiple recipients: comma/space separated) ---
    const toOps = (process.env.BACKOFFICE_EMAIL || '')
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (toOps.length) {
      await resend.emails.send({
        from: FROM,
        to: toOps,
        subject: `[NEW REQUEST] ${contact?.fullName || 'Unknown'} — ${enabledList} (Ref ${reference})`,
        html: backofficeHtml,
      });
    }

    return new Response(JSON.stringify({ ok: true, reference }), { status: 200 });
  } catch (err) {
    console.error('submit error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}

/* ---------------- helpers ---------------- */

function generateRef() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SMT-${y}${m}${day}-${rnd}`;
}

function safe(v) {
  if (v == null) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hasHotel(h)    { return !!(h?.destCity || h?.checkIn || h?.checkOut); }
function hasFlights(f)  { return !!(f?.from || f?.to || f?.departDate || f?.returnDate); }
function hasCar(c)      { return !!(c?.carPickup || c?.carReturn || c?.carPickupDate || c?.carReturnDate); }
function hasTransfer(t) { return !!(t?.tFrom || t?.tTo || t?.tDate || t?.tType); }

function buildEnabledList(slices) {
  const out = [];
  if (hasHotel(slices.hotel)) out.push('Hotel');
  if (hasFlights(slices.flights)) out.push('Flights');
  if (hasCar(slices.car)) out.push('Car Hire');
  if (hasTransfer(slices.transfer)) out.push('Airport Transfer');
  return out.join(', ') || 'None';
}

/* ---------------- email HTML (User) ---------------- */

function userEmailHtml({ contact, hotel, flights, car, transfer, reference, viewLink }) {
  const blocks = [];

  if (hasHotel(hotel)) {
    blocks.push(`
      <tr><td style="padding:10px 20px;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <div style="font:600 14px system-ui;color:#0b3c91;margin-bottom:6px;">Hotel</div>
          <div style="font:400 14px system-ui;color:#0f172a;">
            ${safe(hotel.destCity)} · ${safe(hotel.checkIn)} → ${safe(hotel.checkOut)} · ${safe(hotel.adults || 1)} adult(s)
          </div>
        </div>
      </td></tr>
    `);
  }

  if (hasFlights(flights)) {
    const retSeg = flights.returnDate ? ' · Return ' + safe(flights.returnDate) : '';
    blocks.push(`
      <tr><td style="padding:10px 20px;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <div style="font:600 14px system-ui;color:#0b3c91;margin-bottom:6px;">Flights</div>
          <div style="font:400 14px system-ui;color:#0f172a;">
            ${safe(flights.from)} → ${safe(flights.to)} · Depart ${safe(flights.departDate)}${retSeg}
          </div>
        </div>
      </td></tr>
    `);
  }

  if (hasCar(car)) {
    blocks.push(`
      <tr><td style="padding:10px 20px;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <div style="font:600 14px system-ui;color:#0b3c91;margin-bottom:6px;">Car Hire</div>
          <div style="font:400 14px system-ui;color:#0f172a;">
            ${safe(car.carPickup)} → ${safe(car.carReturn)} · ${safe(car.carPickupDate)} → ${safe(car.carReturnDate)} · ${safe(car.carType)}
          </div>
        </div>
      </td></tr>
    `);
  }

  if (hasTransfer(transfer)) {
    blocks.push(`
      <tr><td style="padding:10px 20px;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <div style="font:600 14px system-ui;color:#0b3c91;margin-bottom:6px;">Airport Transfer</div>
          <div style="font:400 14px system-ui;color:#0f172a;">
            ${safe(transfer.tFrom)} → ${safe(transfer.tTo)} · ${safe(transfer.tDate)} · ${safe(transfer.tType)}
          </div>
        </div>
      </td></tr>
    `);
  }

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <body style="margin:0;padding:0;background:#f4f6f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#0b3c91;color:#ffffff;padding:16px 20px;font:600 16px/1.2 system-ui;">Solid Matter Travel</td>
            </tr>
            <tr><td style="padding:24px 20px 8px 20px;font:400 16px/1.6 system-ui;color:#0f172a;">Hi ${safe(contact.fullName) || 'there'},</td></tr>
            <tr><td style="padding:0 20px 12px 20px;font:400 16px/1.6 system-ui;color:#0f172a;"><strong>Thank you</strong> — we’ve received your request. Our team is reviewing it now and will reply with options shortly.</td></tr>
            ${blocks.join('')}
            <tr>
              <td style="padding:16px 20px 24px 20px;">
                <a href="${viewLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font:600 14px system-ui;padding:10px 16px;border-radius:999px;border:1px solid #1d4ed8;">View your request</a>
                <div style="font:400 12px system-ui;color:#475569;margin-top:10px;">Reference: <strong>${reference}</strong></div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px 20px 20px;background:#fafafa;border-top:1px solid #e5e7eb;font:400 12px/1.6 system-ui;color:#64748b;">
                If anything looks off, just reply to this email with the correction.<br/>
                Support: <a href="mailto:support@solidmatter.travel" style="color:#0b3c91;">support@solidmatter.travel</a>
              </td>
            </tr>
          </table>
          <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ---------------- email HTML (Back office) ---------------- */

function backofficeEmailHtml({ contact, hotel, flights, car, transfer, reference, submittedAt, enabledList }) {
  const hotelRows = hasHotel(hotel) ? `
    <tr><td style="padding:2px 0;width:180px;"><strong>Destination city</strong></td><td>${safe(hotel.destCity)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Check-in / Check-out</strong></td><td>${safe(hotel.checkIn)} → ${safe(hotel.checkOut)} (${safe(hotel.nights) || 0} nights)</td></tr>
    <tr><td style="padding:2px 0;"><strong>Adults</strong></td><td>${safe(hotel.adults) || 1}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Hotel category</strong></td><td>${safe(hotel.hotelCategory)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Meal type</strong></td><td>${safe(hotel.mealType)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Room type</strong></td><td>${safe(hotel.roomType)}</td></tr>
    ${hotel.specificHotel ? `<tr><td style="padding:2px 0;"><strong>Specific hotel</strong></td><td>${safe(hotel.specificHotel)}</td></tr>` : ``}
    ${hotel.notes ? `<tr><td style="padding:2px 0;"><strong>Notes</strong></td><td>${safe(hotel.notes)}</td></tr>` : ``}
  ` : '';

  const flightsRows = hasFlights(flights) ? `
    <tr><td style="padding:2px 0;width:180px;"><strong>From</strong></td><td>${safe(flights.from)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>To</strong></td><td>${safe(flights.to)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Depart</strong></td><td>${safe(flights.departDate)}</td></tr>
    ${flights.returnDate ? `<tr><td style="padding:2px 0;"><strong>Return</strong></td><td>${safe(flights.returnDate)}</td></tr>` : ``}
  ` : '';

  const carRows = hasCar(car) ? `
    <tr><td style="padding:2px 0;width:180px;"><strong>Pickup location</strong></td><td>${safe(car.carPickup)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Return location</strong></td><td>${safe(car.carReturn)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Pickup date</strong></td><td>${safe(car.carPickupDate)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Return date</strong></td><td>${safe(car.carReturnDate)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Car type</strong></td><td>${safe(car.carType)}</td></tr>
  ` : '';

  const transferRows = hasTransfer(transfer) ? `
    <tr><td style="padding:2px 0;width:180px;"><strong>From</strong></td><td>${safe(transfer.tFrom)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>To</strong></td><td>${safe(transfer.tTo)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Date</strong></td><td>${safe(transfer.tDate)}</td></tr>
    <tr><td style="padding:2px 0;"><strong>Type</strong></td><td>${safe(transfer.tType)}</td></tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <body style="margin:0;padding:0;background:#f4f6f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#0b3c91;color:#ffffff;padding:16px 20px;font:600 16px/1.2 system-ui;">New Request · Solid Matter Travel</td>
            </tr>
            <tr>
              <td style="padding:16px 20px 8px 20px;font:400 14px/1.6 system-ui;color:#0f172a;">
                <strong>Ref:</strong> ${reference}<br/>
                <strong>Submitted:</strong> ${submittedAt}<br/>
                <strong>Enabled sections:</strong> ${enabledList}
              </td>
            </tr>
            <tr>
              <td style="padding:0 20px 12px 20px;">
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                  <div style="font:700 14px system-ui;color:#0b3c91;margin-bottom:6px;">Contact</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 14px system-ui;color:#0f172a;">
                    <tr><td style="padding:2px 0;width:180px;"><strong>Full name</strong></td><td>${safe(contact.fullName)}</td></tr>
                    <tr><td style="padding:2px 0;"><strong>Email</strong></td><td><a href="mailto:${safe(contact.email)}" style="color:#0b3c91;text-decoration:none;">${safe(contact.email)}</a></td></tr>
                    <tr><td style="padding:2px 0;"><strong>Phone</strong></td><td>${safe(contact.phone)}</td></tr>
                  </table>
                </div>
              </td>
            </tr>
            ${hasHotel(hotel) ? `
            <tr><td style="padding:8px 20px;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                <div style="font:700 14px system-ui;color:#0b3c91;margin-bottom:6px;">Hotel</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 14px system-ui;color:#0f172a;">
                  ${hotelRows}
                </table>
              </div>
            </td></tr>` : ``}
            ${hasFlights(flights) ? `
            <tr><td style="padding:8px 20px;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                <div style="font:700 14px system-ui;color:#0b3c91;margin-bottom:6px;">Flights</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 14px system-ui;color:#0f172a;">
                  ${flightsRows}
                </table>
              </div>
            </td></tr>` : ``}
            ${hasCar(car) ? `
            <tr><td style="padding:8px 20px;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                <div style="font:700 14px system-ui;color:#0b3c91;margin-bottom:6px;">Car Hire</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 14px system-ui;color:#0f172a;">
                  ${carRows}
                </table>
              </div>
            </td></tr>` : ``}
            ${hasTransfer(transfer) ? `
            <tr><td style="padding:8px 20px;">
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                <div style="font:700 14px system-ui;color:#0b3c91;margin-bottom:6px;">Airport Transfer</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 14px system-ui;color:#0f172a;">
                  ${transferRows}
                </table>
              </div>
            </td></tr>` : ``}
            <tr>
              <td style="padding:16px 20px;background:#fafafa;border-top:1px solid #e5e7eb;font:400 12px/1.6 system-ui;color:#475569;">
                Reply-to: <a href="mailto:${safe(contact.email)}" style="color:#0b3c91;">${safe(contact.email)}</a> · ${safe(contact.phone)}<br/>
                Internal: Please acknowledge within 15 minutes and send first set of options within 4 business hours.
              </td>
            </tr>
          </table>
          <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
