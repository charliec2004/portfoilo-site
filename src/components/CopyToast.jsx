import { useEffect } from 'react';

const DURATION = 10000;

export default function CopyToast({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="copy-toast" role="status" aria-live="polite">
      <div className="copy-toast__body">
        <p className="copy-toast__email">charlieconner04@gmail.com</p>
        <p className="copy-toast__label">copied to clipboard</p>
      </div>
      <button
        type="button"
        className="copy-toast__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* Horizontal progress bar at the bottom of the toast that depletes
          over DURATION. Replaces an SVG depleting-ring around the close
          button — the ring rendered as a partial arc with two round caps
          mid-animation, which read as visual noise around the X icon
          on mobile. A linear bar is the standard pattern (Sonner, Radix
          Toast, etc.), reads cleanly at any width, and doesn't crowd the
          tap target. */}
      <div className="copy-toast__progress" aria-hidden="true" />
    </div>
  );
}
