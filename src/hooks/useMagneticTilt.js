import { useCallback, useRef, useEffect, useState } from 'react';
import useReducedMotion from './useReducedMotion';

const MAX_TILT = 6; // degrees

export default function useMagneticTilt({ disabled = false } = {}) {
  const reducedMotion = useReducedMotion();
  const rafId = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)');
    setIsTouch(mql.matches);
    const onChange = (e) => setIsTouch(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const skip = reducedMotion || disabled || isTouch;

  const onMouseMove = useCallback(
    (e) => {
      if (skip) return;

      const el = e.currentTarget;
      const { clientX, clientY } = e;

      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;

        el.style.setProperty('--tilt-rx', `${(-y * MAX_TILT * 2).toFixed(1)}deg`);
        el.style.setProperty('--tilt-ry', `${(x * MAX_TILT * 2).toFixed(1)}deg`);
        el.style.setProperty('--tilt-s', '1');
        el.style.setProperty('--tilt-x', x.toFixed(3));
        el.style.setProperty('--tilt-y', y.toFixed(3));
      });
    },
    [skip]
  );

  const onMouseLeave = useCallback(
    (e) => {
      if (skip) return;

      const el = e.currentTarget;
      if (rafId.current) cancelAnimationFrame(rafId.current);

      el.style.setProperty('--tilt-rx', '0deg');
      el.style.setProperty('--tilt-ry', '0deg');
      el.style.setProperty('--tilt-s', '1');
      el.style.setProperty('--tilt-x', '0');
      el.style.setProperty('--tilt-y', '0');
    },
    [skip]
  );

  return { onMouseMove, onMouseLeave };
}
