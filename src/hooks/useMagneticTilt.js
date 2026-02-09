import { useCallback, useRef, useEffect, useState } from 'react';
import useReducedMotion from './useReducedMotion';

const MAX_TILT = 3; // degrees
const LERP = 0.18; // how fast current catches up to target (0-1, lower = smoother)

export default function useMagneticTilt({ disabled = false } = {}) {
  const reducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  // Per-element state stored via WeakMap so multiple cards don't interfere
  const elState = useRef(new WeakMap());
  const loopId = useRef(null);
  const activeEls = useRef(new Set());

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)');
    setIsTouch(mql.matches);
    const onChange = (e) => setIsTouch(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const skip = reducedMotion || disabled || isTouch;

  // Continuous animation loop that lerps all active cards toward their targets
  const tick = useCallback(() => {
    for (const el of activeEls.current) {
      const s = elState.current.get(el);
      if (!s) continue;

      s.cx += (s.tx - s.cx) * LERP;
      s.cy += (s.ty - s.cy) * LERP;

      el.style.setProperty('--tilt-rx', `${(-s.cy * MAX_TILT * 2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-ry', `${(s.cx * MAX_TILT * 2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-x', s.cx.toFixed(4));
      el.style.setProperty('--tilt-y', s.cy.toFixed(4));

      // Stop looping once the card has settled back to rest
      if (s.tx === 0 && s.ty === 0 && Math.abs(s.cx) < 0.001 && Math.abs(s.cy) < 0.001) {
        s.cx = 0;
        s.cy = 0;
        el.style.setProperty('--tilt-rx', '0deg');
        el.style.setProperty('--tilt-ry', '0deg');
        el.style.setProperty('--tilt-x', '0');
        el.style.setProperty('--tilt-y', '0');
        activeEls.current.delete(el);
      }
    }

    if (activeEls.current.size > 0) {
      loopId.current = requestAnimationFrame(tick);
    } else {
      loopId.current = null;
    }
  }, []);

  const ensureLoop = useCallback(() => {
    if (loopId.current == null) {
      loopId.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const onMouseMove = useCallback(
    (e) => {
      if (skip) return;

      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const tx = (e.clientX - rect.left) / rect.width - 0.5;
      const ty = (e.clientY - rect.top) / rect.height - 0.5;

      if (!elState.current.has(el)) {
        elState.current.set(el, { cx: 0, cy: 0, tx: 0, ty: 0 });
        el.style.setProperty('--tilt-s', '1');
      }

      const s = elState.current.get(el);
      s.tx = tx;
      s.ty = ty;

      activeEls.current.add(el);
      ensureLoop();
    },
    [skip, ensureLoop]
  );

  const onMouseLeave = useCallback(
    (e) => {
      if (skip) return;

      const el = e.currentTarget;
      const s = elState.current.get(el);
      if (s) {
        s.tx = 0;
        s.ty = 0;
      }
      el.style.setProperty('--tilt-s', '1');
      // Don't remove from activeEls — let it lerp back to 0 smoothly
      ensureLoop();
    },
    [skip, ensureLoop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopId.current) cancelAnimationFrame(loopId.current);
    };
  }, []);

  return { onMouseMove, onMouseLeave };
}
