import React from "react";

export default function SolidMatterHero() {
  return (
    <section
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `
          image-set(
            url(/images/call-center-hero.avif) type("image/avif"),
            url(/images/call-center-hero.jpg) type("image/jpeg")
          )
        `,
        backgroundColor: "#0a192f", // fallback color if images don't load
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content box */}
      <div className="relative z-10 max-w-2xl text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to <span className="text-blue-400">Solid Matter Travel</span>
        </h1>
        <p className="text-lg md:text-xl leading-relaxed">
          Manage all your bookings in one place. Hotels, flights, car hire, and
          airport transfers — all handled quickly and easily with our team.
        </p>
      </div>
    </section>
  );
}
