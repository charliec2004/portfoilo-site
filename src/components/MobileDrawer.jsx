import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Slide-in navigation for narrow layouts — matches green card styling
 * (gradient + inset shadow). Plays a slide-in animation when opening
 * and a slide-out animation when closing.
 *
 * Lifecycle:
 *   - `open` prop drives intent (true = visible, false = hidden).
 *   - `mounted` state keeps the drawer in the tree across the close
 *     animation; without this the component would unmount the moment
 *     `open` flips to false and the slide-out CSS would never play.
 *   - `closing` toggles the `--closing` class which swaps the slide-in
 *     keyframes for slide-out.
 *   - On the panel's `animationend` we drop `mounted` so the drawer is
 *     fully removed (and `body.overflow` is restored).
 */
export default function MobileDrawer({
  open,
  onClose,
  onAboutClick,
  onSkillsClick,
  onCopyEmail,
  onNavigateProjects,
}) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      setMounted(true);
      return;
    }
    // Closing: if not currently mounted (e.g. initial render with open=false)
    // there's nothing to animate out. Otherwise enter the closing phase, and
    // — when the user prefers reduced motion — skip straight to unmount since
    // `animation: none` would otherwise stop `animationend` from ever firing.
    if (!mounted) return;
    if (reducedMotion) {
      setMounted(false);
      setClosing(false);
      return;
    }
    setClosing(true);
  }, [open, mounted, reducedMotion]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || closing) return;
    const esc = (e) => {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', esc, true);
    return () => window.removeEventListener('keydown', esc, true);
  }, [mounted, closing, onClose]);

  // The panel's slide-out is the longest-running animation; once it ends,
  // tear the drawer down. Filter on the panel className so the backdrop
  // fade-out doesn't end the lifecycle early.
  const handleAnimationEnd = (e) => {
    if (!closing) return;
    if (!(e.target instanceof Element)) return;
    if (!e.target.classList.contains('mobile-drawer-panel')) return;
    setMounted(false);
    setClosing(false);
  };

  if (!mounted || typeof document === 'undefined') return null;

  // While the close animation is playing we want clicks/taps to be
  // ignored — both the backdrop and the nav items should already be
  // committed to closing. Setting pointer-events: none on the wrapper
  // also prevents accidental Escape-during-animation re-toggles.
  const wrap =
    (fn) =>
    () => {
      if (closing) return;
      onClose();
      if (fn) queueMicrotask(fn);
    };

  return createPortal(
    <>
      <div
        className={`mobile-drawer-backdrop fixed inset-0 z-[90] bg-black/55 backdrop-blur-[3px]${
          closing ? ' mobile-drawer-backdrop--closing' : ''
        }`}
        aria-hidden="true"
        onClick={closing ? undefined : onClose}
        role="presentation"
      />
      <nav
        id="mobile-site-nav"
        role="navigation"
        aria-label="Site navigation"
        onAnimationEnd={handleAnimationEnd}
        className={`mobile-drawer-panel shadow-card-inset fixed top-0 right-0 z-[91] flex h-[100dvh] max-h-[100dvh] w-[min(17.25rem,calc(100vw-1rem))] flex-col gap-2 rounded-l-[35px] bg-gradient-green px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]${
          closing ? ' mobile-drawer-panel--closing' : ''
        }`}
        aria-hidden={closing || undefined}
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
