'use client';

// Minibus (side view), drawn to match the lucide line-icon style used across the app.
export default function MinibusIcon({ size = 24, strokeWidth = 2, color = 'currentColor', className, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {/* body */}
      <path d="M4 17H2.5A1.5 1.5 0 0 1 1 15.5V7.5A1.5 1.5 0 0 1 2.5 6h13.3a1.5 1.5 0 0 1 1.2.6l3 4.4h.5A2.5 2.5 0 0 1 23 13.5v2a1.5 1.5 0 0 1-1.5 1.5H20" />
      {/* window line and pillars */}
      <path d="M1 11h19" />
      <path d="M6.5 6v5" />
      <path d="M11.5 6v5" />
      {/* between the wheels */}
      <path d="M10 17h6" />
      {/* wheels */}
      <circle cx="7" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}
