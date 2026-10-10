'use client';

export default function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: '#2A3346' }}>
      {label}
      <div>{children}</div>
    </label>
  );
}
