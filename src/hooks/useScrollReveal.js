import { useEffect } from 'react';
import useReducedMotion from './useReducedMotion';

const BREAKPOINT = 1210;
const INTRO_DELAY = 2000;
const STAGGER = 120; // ms between each card reveal

export default function useScrollReveal(refs) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window === 'undefined') return;
    if (window.innerWidth > BREAKPOINT) return;

    const timeout = setTimeout(() => {
      const elements = refs.map((r) => r.current).filter(Boolean);
      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal--visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      elements.forEach((el, index) => {
        el.classList.add('reveal');

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // In viewport: stagger the reveal
          el.style.transitionDelay = `${index * STAGGER}ms`;
          el.classList.add('reveal--visible');
          // Clean up delay after animation so it doesn't affect hover transitions
          setTimeout(() => { el.style.transitionDelay = ''; }, index * STAGGER + 700);
        } else {
          observer.observe(el);
        }
      });

      return () => observer.disconnect();
    }, INTRO_DELAY);

    return () => clearTimeout(timeout);
  }, [refs, reducedMotion]);
}
