// components/Footer.jsx
export default function Footer() {
  return (
    // transparent + a soft dark strip so text is readable on any image
    <footer className="bg-black/40 backdrop-blur-sm text-white text-center py-6">
      <p className="text-sm">
        © 2025 <span className="font-semibold">Solid Matter Travel</span>. Your dependable travel company. All rights reserved.
      </p>
      <p className="text-xs mt-1">
        Solid Matter Travel is part of <span className="font-semibold">Solid Matter Group</span>.
      </p>
    </footer>
  );
}

