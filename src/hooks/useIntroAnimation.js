import { useEffect, useRef } from 'react';
import useReducedMotion from './useReducedMotion';

const INTRO = {
  duration: 800,
  delay: 250,
  profileIntroDuration: 300,
  profileIntroScale: 0.72,
  profileIntroEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
  profileHold: 0.35,
  initialProfileScale: 0.96,
  initialCardScale: 0.88,
  profilePeakScale: 1.06,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

export default function useIntroAnimation(cardRefs) {
  const played = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (played.current) return;
    if (reducedMotion) {
      played.current = true;
      return;
    }
    if (typeof document.body?.animate !== 'function') {
      played.current = true;
      return;
    }

    const cards = cardRefs
      .map((ref) => ref.current)
      .filter(Boolean);

    if (cards.length === 0) {
      played.current = true;
      return;
    }

    played.current = true;

    const profileCard = cards.find((el) =>
      el.dataset.card === 'profile'
    );

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const states = cards.map((card, index) => {
      const rect = card.getBoundingClientRect();
      const tx = centerX - (rect.left + rect.width / 2);
      const ty = centerY - (rect.top + rect.height / 2);
      const isProfile = card === profileCard;
      const startScale = isProfile ? INTRO.initialProfileScale : INTRO.initialCardScale;
      const introScale = isProfile ? INTRO.profileIntroScale : startScale;

      return {
        card,
        isProfile,
        start: `translate(${tx}px, ${ty}px) scale(${startScale})`,
        intro: `translate(${tx}px, ${ty}px) scale(${introScale})`,
        peak: `translate(${tx}px, ${ty}px) scale(${INTRO.profilePeakScale})`,
        zIndex: isProfile ? cards.length + 5 : cards.length - index,
      };
    });

    let profileIntroAnim = null;

    const cleanup = (mainAnimations = []) => {
      // Cancel all animations to remove fill: 'forwards' presentation styles
      mainAnimations.forEach((a) => a.cancel());
      if (profileIntroAnim) profileIntroAnim.cancel();

      states.forEach(({ card }) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.willChange = '';
        card.style.zIndex = '';
      });
    };

    // Set initial hidden state
    states.forEach(({ card, intro, zIndex }) => {
      card.style.transform = intro;
      card.style.opacity = '0';
      card.style.willChange = 'transform, opacity';
      card.style.zIndex = String(zIndex);
    });

    const profileState = states.find((s) => s.isProfile);

    const runMain = () => {
      if (profileState) {
        profileState.card.style.transform = profileState.start;
        profileState.card.style.opacity = '1';
      }

      const animations = states.map(({ card, isProfile, start, peak }) => {
        const keyframes = isProfile
          ? [
              { transform: start, opacity: 1 },
              { transform: peak, opacity: 1, offset: INTRO.profileHold },
              { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
            ]
          : [
              { transform: start, opacity: 0 },
              { transform: start, opacity: 0, offset: INTRO.profileHold },
              { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
            ];

        return card.animate(keyframes, {
          duration: INTRO.duration,
          easing: INTRO.easing,
          delay: INTRO.delay,
          fill: 'forwards',
        });
      });

      Promise.all(animations.map((a) => a.finished.catch(() => {})))
        .finally(() => cleanup(animations));
    };

    if (profileState) {
      profileIntroAnim = profileState.card.animate(
        [
          { transform: profileState.intro, opacity: 0 },
          { transform: profileState.start, opacity: 1 },
        ],
        {
          duration: INTRO.profileIntroDuration,
          easing: INTRO.profileIntroEasing,
          fill: 'forwards',
        }
      );
      profileIntroAnim.finished.then(runMain).catch(runMain);
    } else {
      runMain();
    }
  }, [cardRefs, reducedMotion]);
}
