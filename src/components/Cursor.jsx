import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const glow = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const clicking = useRef(false);
  const rafId = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const noHover = window.matchMedia('(hover: none)');
    if (coarse.matches || noHover.matches) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    const glowEl = glowRef.current;
    if (!dot || !ringEl || !glowEl) return;

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        hovering.current = true;
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        hovering.current = false;
      }
    };

    const handleMouseDown = () => { clicking.current = true; };
    const handleMouseUp = () => { clicking.current = false; };

    const animate = () => {
      // Ring trails with lerp
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

      // Glow trails even slower
      glow.current.x += (mouse.current.x - glow.current.x) * 0.06;
      glow.current.y += (mouse.current.y - glow.current.y) * 0.06;

      const isHover = hovering.current;
      const isClick = clicking.current;

      // Ring morphs on hover/click
      const ringSize = isClick ? 24 : isHover ? 56 : 40;
      const ringBorder = isHover ? 2 : 1.5;
      const ringOpacity = isClick ? 0.8 : isHover ? 0.6 : 0.35;

      ringEl.style.width = `${ringSize}px`;
      ringEl.style.height = `${ringSize}px`;
      ringEl.style.borderWidth = `${ringBorder}px`;
      ringEl.style.borderColor = isHover
        ? 'rgba(179, 142, 57, 0.7)'
        : `rgba(249, 246, 238, ${ringOpacity})`;
      ringEl.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;

      // Dot changes on hover
      const dotSize = isClick ? 12 : isHover ? 6 : 8;
      const dotOpacity = isHover ? 0.5 : 1;
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.opacity = dotOpacity;
      dot.style.background = isHover ? 'rgba(179, 142, 57, 0.9)' : '#F9F6EE';
      dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;

      // Glow trail
      const glowSize = isHover ? 80 : 60;
      const glowOpacity = isHover ? 0.08 : 0.04;
      glowEl.style.background = isHover
        ? `radial-gradient(circle, rgba(179, 142, 57, ${glowOpacity}) 0%, transparent 70%)`
        : `radial-gradient(circle, rgba(249, 246, 238, ${glowOpacity}) 0%, transparent 70%)`;
      glowEl.style.width = `${glowSize}px`;
      glowEl.style.height = `${glowSize}px`;
      glowEl.style.transform = `translate(${glow.current.x}px, ${glow.current.y}px) translate(-50%, -50%)`;

      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(rafId.current);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  const base = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    borderRadius: '50%',
    willChange: 'transform',
  };

  return (
    <>
      {/* Glow trail — slowest, largest */}
      <div
        ref={glowRef}
        style={{ ...base, width: 60, height: 60, zIndex: 9998 }}
      />
      {/* Ring — medium speed, morphs on hover */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width: 40,
          height: 40,
          border: '1.5px solid rgba(249, 246, 238, 0.35)',
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, border-width 0.2s ease',
          zIndex: 9999,
        }}
      />
      {/* Dot — instant, snappy */}
      <div
        ref={dotRef}
        style={{
          ...base,
          width: 8,
          height: 8,
          background: '#F9F6EE',
          transition: 'width 0.15s ease, height 0.15s ease, opacity 0.15s ease, background 0.2s ease',
          boxShadow: '0 0 6px 1px rgba(249, 246, 238, 0.3)',
          zIndex: 10000,
        }}
      />
    </>
  );
}
