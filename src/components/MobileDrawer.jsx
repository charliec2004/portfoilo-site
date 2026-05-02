import { createPortal } from 'react-dom';
import { useEffect } from 'react';

/**
 * Slide-in navigation for narrow layouts — matches green card styling (gradient + inset shadow).
 */
export default function MobileDrawer({
  open,
  onClose,
  onAboutClick,
  onSkillsClick,
  onCopyEmail,
  onNavigateProjects,
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', esc, true);
    return () => window.removeEventListener('keydown', esc, true);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const wrap =
    (fn) =>
    () => {
      onClose();
      if (fn) queueMicrotask(fn);
    };

  return createPortal(
    <>
      <div
        className="mobile-drawer-backdrop fixed inset-0 z-[90] bg-black/55 backdrop-blur-[3px]"
        aria-hidden="true"
        onClick={onClose}
        role="presentation"
      />
      <nav
        id="mobile-site-nav"
        role="navigation"
        aria-label="Site navigation"
        className="mobile-drawer-panel shadow-card-inset fixed top-0 right-0 z-[91] flex h-[100dvh] max-h-[100dvh] w-[min(17.25rem,calc(100vw-1rem))] flex-col gap-2 rounded-l-[35px] bg-gradient-green px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]"
      >
        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted px-3 pb-2 select-none">
          Menu
        </p>

        <button type="button" className="mobile-drawer-nav-item" onClick={wrap(onAboutClick)}>
          About me
        </button>
        <button type="button" className="mobile-drawer-nav-item" onClick={wrap(onSkillsClick)}>
          Skills &amp; tools
        </button>
        <button type="button" className="mobile-drawer-nav-item" onClick={wrap(onNavigateProjects)}>
          Projects
        </button>
        <button type="button" className="mobile-drawer-nav-item" onClick={wrap(onCopyEmail)}>
          Contact me
        </button>

        <p className="mt-auto px-3 pt-6 font-accent text-[0.75rem] italic leading-relaxed text-text-muted select-none">
          Computer Science Student
        </p>
      </nav>
    </>,
    document.body
  );
}
