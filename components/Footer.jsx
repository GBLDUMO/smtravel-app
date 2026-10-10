// components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#0E1E4A', color: '#C9D1E4' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm md:px-8">
        <p>
          © {year} <span className="font-semibold text-white">Solid Matter Travel</span>. Your dependable
          travel company. Part of <span className="font-semibold text-white">Solid Matter Group</span>.
        </p>
        <div className="flex flex-wrap gap-5">
          <a href="tel:+27104460125" style={{ color: '#C9D1E4' }}>SA +27 10 446 0125</a>
          <a href="https://wa.me/971582003251" target="_blank" rel="noopener noreferrer" style={{ color: '#C9D1E4' }}>
            WhatsApp +971 58 200 3251
          </a>
        </div>
      </div>
    </footer>
  );
}
