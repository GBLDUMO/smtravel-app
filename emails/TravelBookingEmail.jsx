// emails/TravelBookingEmail.jsx
import * as React from "react";

export default function TravelBookingEmail({
  // Images
  logoUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934208/Logo1_Use_xuoqgm.png",
  heroUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934231/travel-companies-1_-_k7fhhj.webp",

  // NEW: Quote Reference (e.g., SMT-Q10100)
  quoteRef = "",

  // Traveller
  fullName = "",
  email = "",
  phone = "",

  // Trip (hotel-related summary)
  destCity = "",
  checkIn = "",
  checkOut = "",
  nights = "",
  adults = "",
  bookingRef = "",
  rooms = "",

  // Hotel (trigger = mealType)
  hotelCategory = "",
  roomType = "",
  mealType = "",

  // Flights (trigger = to OR segments present)
  from = "",
  to = "",
  departDate = "",
  returnDate = "",
  tripType = "",           // NEW
  segments = [],           // [{from,to,departDate,tripType,returnDate}]

  // Car (trigger = vehicleType)
  vehicleType = "",
  dropOffDate = "",

  // Real car fields
  carPickup = "",
  carReturn = "",
  carPickupDate = "",

  // Car Notes
  carNotes = "",

  // Transfer (trigger = any of the fields)
  tFrom = "",
  tTo = "",
  tDate = "",
  tType = "",

  // General Notes (bottom card)
  notes = "",
}) {
  const adultsCount = Number(adults) || 0;

  // Section visibility
  const hasTraveller = !!(fullName || email || phone);

  // Hotel completion trigger (used to decide if we show Trip box)
  const hasHotel = !!mealType;

  // Show trip card only if hotel is completed AND at least one trip field exists
  const showTrip =
    hasHotel &&
    !!(destCity || checkIn || checkOut || nights || adultsCount || rooms || bookingRef);

  const hasAnySegments = Array.isArray(segments) && segments.length > 0;
  const hasFlights = !!(to || hasAnySegments);
  const hasCar =
    !!(vehicleType || dropOffDate || carPickup || carReturn || carPickupDate || carNotes);
  const hasTransfer = !!(tFrom || tTo || tDate || tType);
  const hasNotes = !!notes;

  const styles = {
    body: { margin: 0, padding: 0, background: "#F6FAFB", fontFamily: "Arial, Helvetica, sans-serif" },
    wrapper: {
      maxWidth: 680,
      margin: "0 auto",
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 14,
      overflow: "hidden",
      position: "relative",
    },
    headerImg: { width: "100%", height: "auto", maxHeight: 300, objectFit: "cover", display: "block" },
    logoTopLeft: { position: "absolute", top: 20, left: 20, maxWidth: 120, height: "auto", zIndex: 10 },
    centerText: { textAlign: "center", marginTop: -40, marginBottom: 20 },
    titleMain: { margin: 0, fontSize: 32, color: "#ffffff", fontWeight: 800, textShadow: "2px 2px 6px rgba(0,0,0,0.6)" },
    subtitle: { margin: "6px 0 0", fontSize: 20, color: "#000000", fontWeight: 600 },
    section: { padding: "20px 28px" },
    badge: {
      display: "inline-block",
      padding: "6px 10px",
      background: "#ECFEF7",
      color: "#0A8C78",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
    },
    h2: { margin: "10px 0 6px", fontSize: 20, fontWeight: 700, color: "#111827" },
    pMuted: { margin: 0, fontSize: 14, color: "#6B7280" },
    twoCol: { display: "flex", gap: 16, flexWrap: "wrap" },
    card: {
      background: "#FAFAFA",
      borderRadius: 10,
      padding: 14,
      fontSize: 12,
      marginBottom: 12,
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      flex: 1,
      minWidth: 260,
    },
    prefCard: {
      background: "#F9FFFE",
      border: "1px solid #E5FFFA",   // <-- FIXED
      borderRadius: 10,
      padding: 12,
      fontSize: 12,
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      flex: 1,
    },
    prefRow: { display: "flex", gap: 16, flexWrap: "wrap" },
    boxTitle: { fontSize: 16, color: "#0A2540", fontWeight: 700, display: "block", marginBottom: 6 },
    bold: { fontWeight: 700 },
    footer: { textAlign: "center", fontSize: 12, color: "#9CA3AF", padding: 16 },
  };

  return (
    <div style={styles.body}>
      <div style={styles.wrapper}>
        {/* Hero with logo */}
        <img src={heroUrl} alt="Hero" style={styles.headerImg} />
        <img src={logoUrl} alt="Solid Matter Travel" style={styles.logoTopLeft} />

        {/* Centered text */}
        <div style={styles.centerText}>
          <h1 style={styles.titleMain}>SOLID MATTER TRAVEL</h1>
          <p style={styles.subtitle}>We’ve got your request</p>
        </div>

        {/* Booking summary header */}
        <div style={styles.section}>
          <span style={styles.badge}>Booking summary</span>
          <h2 style={styles.h2}>Your details</h2>

          {/* NEW: Quote Reference */}
          {quoteRef && (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0A2540", margin: "4px 0 8px" }}>
              Quote Reference: <span style={{ fontWeight: 800 }}>{quoteRef}</span>
            </p>
          )}

          <p style={styles.pMuted}>
            Please check all details. If any changes do let us know.{" "}
            <a href="mailto:admin@smtravel.co.za" style={{ color: "#0A2540", textDecoration: "none" }}>
              admin@smtravel.co.za
            </a>
          </p>
        </div>

        {/* Traveller + Trip */}
        {(hasTraveller || showTrip) && (
          <div style={styles.section}>
            <div style={styles.twoCol}>
              {hasTraveller && (
                <div style={styles.card}>
                  <span style={styles.boxTitle}>Traveller</span>
                  {fullName && (
                    <>
                      <span style={styles.bold}>Name:</span> {fullName}
                      <br />
                    </>
                  )}
                  {email && (
                    <>
                      <span style={styles.bold}>E-mail:</span>{" "}
                      <a href={`mailto:${email}`} style={{ color: "#0A2540", textDecoration: "none" }}>
                        {email}
                      </a>
                      <br />
                    </>
                  )}
                  {phone && (
                    <>
                      <span style={styles.bold}>Phone:</span> {phone}
                    </>
                  )}
                </div>
              )}

              {/* Trip shows ONLY if hotel section is completed */}
              {showTrip && (
                <div style={styles.card}>
                  <span style={styles.boxTitle}>Trip</span>
                  {destCity && (
                    <>
                      <span style={styles.bold}>Destination:</span> {destCity}
                      <br />
                    </>
                  )}
                  {(checkIn || checkOut) && (
                    <>
                      <span style={styles.bold}>Dates:</span> {checkIn} {checkIn && checkOut ? "–" : ""} {checkOut}
                      <br />
                    </>
                  )}
                  {nights && (
                    <>
                      <span style={styles.bold}>Nights:</span> {nights}
                      <br />
                    </>
                  )}
                  {adultsCount > 0 && (
                    <>
                      <span style={styles.bold}>Guests:</span> {adultsCount} adult(s)
                      <br />
                    </>
                  )}
                  {rooms && (
                    <>
                      <span style={styles.bold}>Rooms:</span> {rooms}
                      <br />
                    </>
                  )}
                  {bookingRef && (
                    <>
                      <span style={styles.bold}>Booking Ref:</span> {bookingRef}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {(hasHotel || hasFlights || hasCar || hasTransfer) && (
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#111827" }}>Preferences</h3>
            <div style={styles.prefRow}>
              {hasHotel && (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Hotel</span>
                  {destCity && (
                    <>
                      <span style={styles.bold}>Location:</span> {destCity}
                      <br />
                    </>
                  )}
                  {hotelCategory && (
                    <>
                      <span style={styles.bold}>Type:</span> {hotelCategory}
                      <br />
                    </>
                  )}
                  {roomType && (
                    <>
                      <span style={styles.bold}>Room Type:</span> {roomType}
                      <br />
                    </>
                  )}
                  <span style={styles.bold}>Meal type:</span> {mealType}
                </div>
              )}

              {hasFlights && (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Flights</span>

                  {/* Base leg */}
                  {(tripType || from || to || departDate || returnDate) && (
                    <div style={{ marginBottom: 8 }}>
                      {/* Trip type shows One way / Return */}
                      <>
                        <span style={styles.bold}>Trip type:</span>{" "}
                        {tripType || (returnDate ? "Return" : "One way")}
                        <br />
                      </>
                      {departDate && (
                        <>
                          <span style={styles.bold}>Departure Date:</span> {departDate}
                          <br />
                        </>
                      )}
                      {returnDate && (
                        <>
                          <span style={styles.bold}>Return Date:</span> {returnDate}
                          <br />
                        </>
                      )}
                      <span style={styles.bold}>Route:</span> {from || "—"} {to ? "→" : ""} {to || "—"}
                    </div>
                  )}

                  {/* Extra legs if provided */}
                  {hasAnySegments &&
                    segments.map((leg, i) => {
                      const showLeg =
                        !!(leg?.from || leg?.to || leg?.departDate || leg?.returnDate || leg?.tripType);
                      if (!showLeg) return null;
                      return (
                        <div key={i} style={{ marginTop: 8 }}>
                          <span style={styles.bold}>Leg {i + 2}:</span>
                          <br />
                          {leg.tripType && (
                            <>
                              <span style={styles.bold}>Trip type:</span> {leg.tripType}
                              <br />
                            </>
                          )}
                          {leg.departDate && (
                            <>
                              <span style={styles.bold}>Departure Date:</span> {leg.departDate}
                              <br />
                            </>
                          )}
                          {leg.tripType === "Return" && leg.returnDate && (
                            <>
                              <span style={styles.bold}>Return Date:</span> {leg.returnDate}
                              <br />
                            </>
                          )}
                          <span style={styles.bold}>Route:</span> {leg.from || "—"} {leg.to ? "→" : ""} {leg.to || "—"}
                        </div>
                      );
                    })}
                </div>
              )}

              {hasCar && (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Car Hire</span>
                  {carPickup && (
                    <>
                      <span style={styles.bold}>Pick Up Location:</span> {carPickup}
                      <br />
                    </>
                  )}
                  {carReturn && (
                    <>
                      <span style={styles.bold}>Return Location:</span> {carReturn}
                      <br />
                    </>
                  )}
                  {carPickupDate && (
                    <>
                      <span style={styles.bold}>Pick Up Date:</span> {carPickupDate}
                      <br />
                    </>
                  )}
                  {vehicleType && (
                    <>
                      <span style={styles.bold}>Vehicle Type:</span> {vehicleType}
                      <br />
                    </>
                  )}
                  {dropOffDate && (
                    <>
                      <span style={styles.bold}>Drop Off Date:</span> {dropOffDate}
                      <br />
                    </>
                  )}
                  {carNotes && (
                    <>
                      <span style={styles.bold}>Notes:</span> {carNotes}
                    </>
                  )}
                </div>
              )}

              {hasTransfer && (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Airport Transfer</span>
                  {tFrom && (
                    <>
                      <span style={styles.bold}>From:</span> {tFrom}
                      <br />
                    </>
                  )}
                  {tTo && (
                    <>
                      <span style={styles.bold}>To:</span> {tTo}
                      <br />
                    </>
                  )}
                  {tDate && (
                    <>
                      <span style={styles.bold}>Date:</span> {tDate}
                      <br />
                    </>
                  )}
                  <span style={styles.bold}>Transfer type:</span> {tType}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Notes */}
        {hasNotes && (
          <div style={styles.section}>
            <div style={styles.card}>
              <span style={styles.boxTitle}>Notes</span>
              {notes}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>Solid Matter Travel • Dubai &amp; South Africa</div>
    </div>
  );
}
