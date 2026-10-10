// app/layout.js
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";

// Brand fonts: Cormorant Garamond for headings, Jost for everything else
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Solid Matter Travel — Book hotels, flights, car hire & transfers",
  description:
    "Africa-specialist travel management. Request hotels, flights, car hire and airport transfers in one form — routed straight to the Solid Matter Travel team.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#0E1E4A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="antialiased flex min-h-screen flex-col relative h-full">
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
