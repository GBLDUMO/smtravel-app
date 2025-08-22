'use client';

import Image from 'next/image';

export default function LogoHeader() {
  // Centered logo on a soft white card so it pops on the gradient
  return (
    <div className="rounded-xl border shadow-sm p-2"
         style={{ background: 'rgba(255,255,255,0.92)', borderColor: 'rgba(255,255,255,0.6)' }}>
      <Image
        src="/logo.png"            // put your file at /public/logo.png
        alt="Solid Matter Travel"
        width={280}
        height={80}
        className="h-16 w-auto"
        priority
      />
    </div>
  );
}
