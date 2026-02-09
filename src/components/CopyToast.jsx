import { useEffect } from 'react';

const DURATION = 10000;
const RADIUS = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
      <div>
        <p className="copy-toast__email">charlieconner04@gmail.com</p>
        <p className="copy-toast__label">copied to clipboard</p>
      </div>
      <button
        type="button"
        className="copy-toast__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            className="copy-toast__timer-ring"
            cx="16"
            cy="16"
            r={RADIUS}
            stroke="rgba(179, 142, 57, 0.5)"
            strokeWidth="2"
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            transform="rotate(-90 16 16)"
          />
          <line x1="12.5" y1="12.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="19.5" y1="12.5" x2="12.5" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
