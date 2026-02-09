import { useState, useCallback, useRef } from 'react';

const TIMING = {
  expansion: 400,
  contraction: 300,
  contentFadeOut: 150,
  textFade: 200,
  textChangeDelay: 150,
  skillIconDelay: 700,
  skillIconStagger: 80,
};

export default function useCardExpansion() {
  const [expandedCard, setExpandedCard] = useState(null); // 'about' | 'skills' | null
  const [phase, setPhase] = useState('idle');
  // idle | expanding | expanded | collapsing | contracting
  const savedRect = useRef(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const expand = useCallback((cardType, cardEl, containerEl) => {
    if (phase !== 'idle' || !cardEl || !containerEl) return;
    // Disable clone-based expansion on mobile/tablet — stacked layout breaks it
    if (window.innerWidth <= 1210) return;

    const containerRect = containerEl.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    savedRect.current = {
      top: cardRect.top - containerRect.top,
      left: cardRect.left - containerRect.left,
      width: cardRect.width,
      height: cardRect.height,
    };
    containerRef.current = containerEl;
    cardRef.current = cardEl;

    setExpandedCard(cardType);
    setPhase('expanding');

    // After a frame, the clone is rendered at savedRect.
    // We schedule expansion to full size.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('expanded');
      });
    });
  }, [phase]);

  const collapse = useCallback(() => {
    if (phase !== 'expanded') return;
    // Phase 1: content fades out while card stays full-size
    setPhase('collapsing');

    // Phase 2: after content has faded, shrink the card
    setTimeout(() => {
      setPhase('contracting');
    }, TIMING.contentFadeOut);

    // Phase 3: after contraction completes, clean up
    setTimeout(() => {
      setExpandedCard(null);
      setPhase('idle');
      savedRect.current = null;
      containerRef.current = null;
      cardRef.current = null;
    }, TIMING.contentFadeOut + TIMING.contraction + 50);
  }, [phase]);

  const getCloneStyle = useCallback(() => {
    if (!savedRect.current) return {};

    const rect = savedRect.current;

    if (phase === 'expanding') {
      return {
        position: 'absolute',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: 999,
        transition: `top ${TIMING.expansion}ms ease, left ${TIMING.expansion}ms ease, width ${TIMING.expansion}ms ease, height ${TIMING.expansion}ms ease`,
      };
    }

    if (phase === 'expanded') {
      return {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: 999,
        transition: `top ${TIMING.expansion}ms ease, left ${TIMING.expansion}ms ease, width ${TIMING.expansion}ms ease, height ${TIMING.expansion}ms ease`,
      };
    }

    if (phase === 'collapsing') {
      // Content fading out — card stays at full size
      return {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: 999,
      };
    }

    if (phase === 'contracting') {
      // Content faded — now shrink card back to original position
      let freshRect = rect;
      if (cardRef.current && containerRef.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const eRect = cardRef.current.getBoundingClientRect();
        freshRect = {
          top: eRect.top - cRect.top,
          left: eRect.left - cRect.left,
          width: eRect.width,
          height: eRect.height,
        };
      }
      return {
        position: 'absolute',
        top: `${freshRect.top}px`,
        left: `${freshRect.left}px`,
        width: `${freshRect.width}px`,
        height: `${freshRect.height}px`,
        zIndex: 999,
        transition: `top ${TIMING.contraction}ms ease, left ${TIMING.contraction}ms ease, width ${TIMING.contraction}ms ease, height ${TIMING.contraction}ms ease`,
      };
    }

    return {};
  }, [phase]);

  return {
    expandedCard,
    phase,
    expand,
    collapse,
    getCloneStyle,
    isExpanded: expandedCard !== null,
    TIMING,
  };
}
