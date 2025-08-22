'use client';

export default function Modal({ children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">{children}</div>
    </div>
  );
}
