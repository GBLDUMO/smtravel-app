// emails/UserConfirmationEmail.jsx
import * as React from "react";

export default function UserConfirmationEmail({
  // Images (use your Cloudinary URLs)
  logoUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934208/Logo1_Use_xuoqgm.png",
  heroUrl = "https://res.cloudinary.com/dmrvd8fwt/image/upload/v1755934231/travel-companies-1_-_k7fhhj.webp",

  // Contact
  fullName = "Guest",
  email = "",
  phone = "",

  // Trip (optional – pass if you have them)
  destCity = "",
  checkIn = "",
  checkOut = "",
  nights = "",
  adults = "",

  // Preferences (optional)
  hotelCategory = "",
  roomType = "",
  mealType = "",
  from = "",
  to = "",
  departDate = "",
  vehicleType = "",
  dropOffDate = "",

  // Notes
  notes = ""
}) {
  const ink = "#1F2937";
  const muted = "#6B7280";
  const navy = "#0A2540";

  const table = { width: "100%", borderCollapse: "collapse" };
  const wrapper = { width: "100%", maxWidth: 660, margin: "0 auto" };
  const card = { border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", background: "#ffffff" };

  return (
    <div style={{ background: "#F6FAFB", margin: 0, padding: 0, fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Preheader (hidden) */}
      <div style={{ display: "none", maxHeight: 0, overflow: "hidden", fontSize: 1, lineHeight: 1, color: "#fff", opacity: 0 }}>
        Thank you for completing your request, our team will reach out to you shortly.
      </div>

      <table role="presentation" style={table}>
        <tbody>
          <tr>
            <td style={{ padding: "20px 16px 0 16px" }}>
              <table role="presentation" style={{ ...table, ...wrapper }}>
                <tbody>
                  <tr>
                    <td>
                      {/* Card start */}
                      <table role="presentation" style={{ ...table, ...card }}>
                        <tbody>
                          {/* HERO IMAGE */}
                          <tr>
                            <td>
                              <img
                                src={heroUrl}
                                alt="Travel hero"
                                style={{ display: "block", width: "100%", height: "auto", maxHeight: 300, objectFit: "cover" }}
                              />
                            </td>
                          </tr>

                          {/* LOGO + TITLES */}
                          <tr>
                            <td style={{ padding: "14px 16px 6px 16px", background: "#ffffff", textAlign: "center" }}>
                              <img
                                src={logoUrl}
                                alt="Solid Matter Travel"
                                width={160}
                                style={{ display: "block", margin: "0 auto 6px auto", height: "auto", maxWidth: 160 }}
                              />
                              <div style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.2, color: navy }}>
                                SOLID MATTER TRAVEL
                              </div>
                              <div style={{ marginTop: 6, fontWeight: 400, fontSize: 20, lineHeight: 1.25, color: ink }}>
                                We’ve got your request
                              </div>
                            </td>
                          </tr>

                          {/* SUMMARY HEADER */}
                          <tr>
                            <td style={{ padding: "22px 28px 6px 28px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: "#ECFEF7",
                                  color: "#0A8C78",
                                  fontSize: 12,
                                  fontWeight: 600
                                }}
                              >
                                Booking summary
                              </span>
                              <h2 style={{ margin: "10px 0 6px 0", fontSize: 20, fontWeight: 700, color: ink }}>
                                Your details
                              </h2>
                              <p style={{ margin: 0, fontSize: 14, color: muted }}>
                                Thank you for completing your request, our team will reach out to you shortly.
                              </p>
                            </td>
                          </tr>

                          {/* TWO-COLUMN FACTS (Traveller / Trip) */}
                          <tr>
                            <td style={{ padding: "10px 28px 10px 28px" }}>
                              <table role="presentation" style={table}>
                                <tbody>
                                  <tr>
                                    {/* Traveller */}
                                    <td style={{ width: "50%", paddingRight: 8, verticalAlign: "top" }}>
                                      <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#FAFAFA" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: "14px 14px 6px 14px", fontSize: 12, fontWeight: 700, color: muted }}>
                                              Traveller
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "0 14px 14px 14px", fontSize: 14, color: "#111827" }}>
                                              {fullName}
                                              {email ? (
                                                <>
                                                  <br />
                                                  <a href={`mailto:${email}`} style={{ color: navy }}>{email}</a>
                                                </>
                                              ) : null}
                                              {phone ? (
                                                <>
                                                  <br />
                                                  {phone}
                                                </>
                                              ) : null}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>

                                    {/* Trip */}
                                    <td style={{ width: "50%", paddingLeft: 8, verticalAlign: "top" }}>
                                      <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#FAFAFA" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: "14px 14px 6px 14px", fontSize: 12, fontWeight: 700, color: muted }}>
                                              Trip
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "0 14px 14px 14px", fontSize: 14, color: "#111827" }}>
                                              {destCity && <>Destination: {destCity}<br /></>}
                                              {(checkIn || checkOut) && <>Dates: {checkIn} {checkIn && checkOut ? "→" : ""} {checkOut}<br /></>}
                                              {nights && <>Nights: {nights}<br /></>}
                                              {adults && <>Guests: {adults} adult(s)</>}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>

                          {/* DIVIDER */}
                          <tr>
                            <td style={{ padding: "0 28px" }}>
                              <div style={{ height: 1, background: "#e5e7eb", lineHeight: 1 }} />
                            </td>
                          </tr>

                          {/* PREFERENCES */}
                          <tr>
                            <td style={{ padding: "14px 28px 8px 28px" }}>
                              <h3 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 700, color: ink }}>Preferences</h3>

                              <table role="presentation" style={table}>
                                <tbody>
                                  <tr>
                                    {/* Hotel */}
                                    <td style={{ width: "33.33%", padding: "6px 8px 6px 0", verticalAlign: "top" }}>
                                      <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#F9FFFE", border: "1px solid #E5FFFA" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: 12, fontSize: 12, fontWeight: 700, color: muted }}>Hotel</td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "0 12px 12px 12px", fontSize: 14, color: "#111827" }}>
                                              {destCity && <>Location: {destCity}<br /></>}
                                              {hotelCategory && <>Type: {hotelCategory}<br /></>}
                                              {roomType && <>Room Type: {roomType}<br /></>}
                                              {mealType && <>Meal type {mealType}</>}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>

                                    {/* Flights */}
                                    <td style={{ width: "33.33%", padding: "6px 4px", verticalAlign: "top" }}>
                                      <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#F9FFFE", border: "1px solid #E5FFFA" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: 12, fontSize: 12, fontWeight: 700, color: muted }}>Flights</td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "0 12px 12px 12px", fontSize: 14, color: "#111827" }}>
                                              {departDate && <>Departure Date {departDate}<br /></>}
                                              {(from || to) && <>{from} {from && to ? "→" : ""} {to}</>}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>

                                    {/* Car Hire */}
                                    <td style={{ width: "33.33%", padding: "6px 0 6px 8px", verticalAlign: "top" }}>
                                      <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#F9FFFE", border: "1px solid #E5FFFA" }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: 12, fontSize: 12, fontWeight: 700, color: muted }}>Car Hire</td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "0 12px 12px 12px", fontSize: 14, color: "#111827" }}>
                                              {destCity && <>Pick Up Location: {destCity}<br /></>}
                                              {departDate && <>Pick Up Date: {departDate}<br /></>}
                                              {vehicleType && <>Vehicle Type: {vehicleType}<br /></>}
                                              {dropOffDate && <>Drop Off Date: {dropOffDate}</>}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>

                          {/* NOTES */}
                          {notes ? (
                            <tr>
                              <td style={{ padding: "8px 28px 22px 28px" }}>
                                <table role="presentation" style={{ width: "100%", borderRadius: 10, background: "#FAFAFA" }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: "14px 14px 6px 14px", fontSize: 12, fontWeight: 700, color: muted }}>
                                        Notes
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: "0 14px 14px 14px", fontSize: 14, color: "#111827" }}>
                                        {notes}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                      {/* Card end */}
                    </td>
                  </tr>

                  {/* FOOTER */}
                  <tr>
                    <td style={{ padding: 16, textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
                        Solid Matter Travel • Dubai &amp; South Africa
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
