import { useState, useCallback, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1210;

export default function useMobileExpansion() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [expandedCard, setExpandedCard] = useState(null); // 'about' | 'skills' | null

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Collapse when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) setExpandedCard(null);
  }, [isMobile]);

  const toggle = useCallback((cardType) => {
    setExpandedCard((prev) => (prev === cardType ? null : cardType));
  }, []);

  return { isMobile, mobileExpandedCard: expandedCard, toggleMobile: toggle };
}
