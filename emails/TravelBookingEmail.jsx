// emails/TravelBookingEmail.jsx
import * as React from "react";

export default function TravelBookingEmail({
  // Images (change anytime)
  logoUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934208/Logo1_Use_xuoqgm.png",
  heroUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934231/travel-companies-1_-_k7fhhj.webp",

  // Traveller (empty by default so sections only show if provided)
  fullName = "",
  email = "",
  phone = "",

  // Trip (empty by default)
  destCity = "",
  checkIn = "",
  checkOut = "",
  nights = "",
  adults = "",
  bookingRef = "",

  // Preferences (empty by default)
  hotelCategory = "",
  roomType = "",
  mealType = "",
  from = "",
  to = "",
  departDate = "",
  vehicleType = "",
  dropOffDate = "",

  // Notes
  notes = "",
}) {
  // ====== Visibility helpers (only render completed sections) ======
  const hasTraveller = !!(fullName || email || phone);
  const hasTrip = !!(destCity || checkIn || checkOut || nights || adults || bookingRef);
  const hasHotel = !!(destCity || hotelCategory || roomType || mealType);
  const hasFlights = !!(from || to || departDate);
  const hasCar = !!(destCity || departDate || vehicleType || dropOffDate);
  const hasNotes = !!notes;

  const styles = {
    body: { margin: 0, padding: 0, background: "#F6FAFB", fontFamily: "Arial, Helvetica, sans-serif" },
    wrapper: { maxWidth: 680, margin: "0 auto", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", position: "relative" },
    headerImg: { width: "100%", height: "auto", maxHeight: 300, objectFit: "cover", display: "block" },
    logoTopLeft: { position: "absolute", top: 20, left: 20, maxWidth: 120, height: "auto", zIndex: 10 },
    centerText: { textAlign: "center", marginTop: -40, marginBottom: 20 },
    titleMain: { margin: 0, fontSize: 32, color: "#ffffff", fontWeight: 800, textShadow: "2px 2px 6px rgba(0,0,0,0.6)" },
    subtitle: { margin: "6px 0 0", fontSize: 20, color: "#000000", fontWeight: 600 },
    section: { padding: "20px 28px" },
    badge: { display: "inline-block", padding: "6px 10px", background: "#ECFEF7", color: "#0A8C78", borderRadius: 999, fontSize: 12, fontWeight: 600 },
    h2: { margin: "10px 0 6px", fontSize: 20, fontWeight: 700, color: "#111827" },
    pMuted: { margin: 0, fontSize: 14, color: "#6B7280" },
    twoCol: { display: "flex", gap: 16, flexWrap: "wrap" },
    card: { background: "#FAFAFA", borderRadius: 10, padding: 14, fontSize: 12, marginBottom: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", flex: 1, minWidth: 260 },
    prefCard: { background: "#F9FFFE", border: "1px solid #E5FFFA", borderRadius: 10, padding: 12, fontSize: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", flex: 1 },
    prefRow: { display: "flex", gap: 16, flexWrap: "nowrap" },
    boxTitle: { fontSize: 16, color: "#0A2540", fontWeight: 700, display: "block", marginBottom: 6 },
    bold: { fontWeight: 700 },
    footer: { textAlign: "center", fontSize: 12, color: "#9CA3AF", padding: 16 },
  };

  return (
    <div style={styles.body}>
      <div style={styles.wrapper}>
        {/* Hero with logo on top-left */}
        <img src={heroUrl} alt="Hero" style={styles.headerImg} />
        <img src={logoUrl} alt="Solid Matter Travel" style={styles.logoTopLeft} />

        {/* Centered text below hero */}
        <div style={styles.centerText}>
          <h1 style={styles.titleMain}>SOLID MATTER TRAVEL</h1>
          <p style={styles.subtitle}>We’ve got your request</p>
        </div>

        {/* Booking summary header */}
        <div style={styles.section}>
          <span style={styles.badge}>Booking summary</span>
          <h2 style={styles.h2}>Your details</h2>
          <p style={styles.pMuted}>
            Please check all details. If any changes do let us know. {" "}
            <a href="mailto:admin@smtravel.co.za" style={{ color: "#0A2540", textDecoration: "none" }}>
              admin@smtravel.co.za
            </a>
          </p>
        </div>

        {/* Traveller + Trip (only render cards if data exists) */}
        {hasTraveller || hasTrip ? (
          <div style={styles.section}>
            <div style={styles.twoCol}>
              {hasTraveller ? (
                <div style={styles.card}>
                  <span style={styles.boxTitle}>Traveller</span>
                  {fullName ? (<><span style={styles.bold}>Name:</span> {fullName}<br /></>) : null}
                  {email ? (<><span style={styles.bold}>E-mail:</span> <a href={`mailto:${email}`} style={{ color: "#0A2540", textDecoration: "none" }}>{email}</a><br /></>) : null}
                  {phone ? (<><span style={styles.bold}>Phone:</span> {phone}</>) : null}
                </div>
              ) : null}

              {hasTrip ? (
                <div style={styles.card}>
                  <span style={styles.boxTitle}>Trip</span>
                  {destCity ? (<><span style={styles.bold}>Destination:</span> {destCity}<br /></>) : null}
                  {checkIn || checkOut ? (
                    <>
                      <span style={styles.bold}>Dates:</span> {checkIn} {checkIn && checkOut ? "–" : ""} {checkOut}<br />
                    </>
                  ) : null}
                  {nights ? (<><span style={styles.bold}>Nights:</span> {nights}<br /></>) : null}
                  {adults ? (<><span style={styles.bold}>Guests:</span> {adults} adult(s)<br /></>) : null}
                  {bookingRef ? (<><span style={styles.bold}>Booking Ref:</span> {bookingRef}</>) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Preferences — render only completed components */}
        {(hasHotel || hasFlights || hasCar) ? (
          <div style={styles.section}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#111827" }}>Preferences</h3>
            <div style={styles.prefRow}>
              {hasHotel ? (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Hotel</span>
                  {destCity ? (<><span style={styles.bold}>Location:</span> {destCity}<br /></>) : null}
                  {hotelCategory ? (<><span style={styles.bold}>Type:</span> {hotelCategory}<br /></>) : null}
                  {roomType ? (<><span style={styles.bold}>Room Type:</span> {roomType}<br /></>) : null}
                  {mealType ? (<><span style={styles.bold}>Meal type:</span> {mealType}</>) : null}
                </div>
              ) : null}

              {hasFlights ? (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Flights</span>
                  {departDate ? (<><span style={styles.bold}>Departure Date:</span> {departDate}<br /></>) : null}
                  {(from || to) ? (<><span style={styles.bold}>Route:</span> {from} {from && to ? "→" : ""} {to}</>) : null}
                </div>
              ) : null}

              {hasCar ? (
                <div style={styles.prefCard}>
                  <span style={styles.boxTitle}>Car Hire</span>
                  {destCity ? (<><span style={styles.bold}>Pick Up Location:</span> {destCity}<br /></>) : null}
                  {departDate ? (<><span style={styles.bold}>Pick Up Date:</span> {departDate}<br /></>) : null}
                  {vehicleType ? (<><span style={styles.bold}>Vehicle Type:</span> {vehicleType}<br /></>) : null}
                  {dropOffDate ? (<><span style={styles.bold}>Drop Off Date:</span> {dropOffDate}</>) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Notes */}
        {hasNotes ? (
          <div style={styles.section}>
            <div style={styles.card}>
              <span style={styles.boxTitle}>Notes</span>
              {notes}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        Solid Matter Travel • Dubai &amp; South Africa
      </div>
    </div>
  );
}
