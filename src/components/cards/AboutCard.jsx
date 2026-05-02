import { forwardRef, useMemo, useState, useEffect } from 'react';
import profileIcon from '../../assets/icons/profile.svg';
import useReducedMotion from '../../hooks/useReducedMotion';

const ABOUT_TEXT = {
  short: "I like building things.",
  full: "I like building things. I move fast, learn by doing, and change course when something breaks or actually gets used. Decisions don't really mean anything until they hit reality. I have no patience for complexity that isn't earning its keep. I work across engineering and product because that's where ideas stop being ideas and start being real. What I care about is momentum, honest feedback, and progress that adds up. This site is a running log of what I'm building, what's working, and what I'm still figuring out.",
};

/**
 * iPhone-sized viewports skip tap-to-expand entirely: the bio is shown in
 * full from the start, the card is non-interactive, and the cursor cue is
 * removed. Matches `SMALL_MOBILE_MAX_PX` in `SkillsCard.jsx` so both cards
 * behave consistently in the small-mobile band.
 */
const SMALL_MOBILE_MAX_PX = 640;

// Bio text scales down a touch on iPhone-class viewports so a paragraph
// of bio doesn't blow out the card height.
const textClass =
  'font-accent text-text-secondary font-normal leading-relaxed text-[clamp(1.02rem,4.4vw,1.25rem)] sm:text-[1.25rem]';

function useDesktopExpansionOpacity(phase, expansionTiming, reducedMotion) {
  return useMemo(() => {
    const expansionMs = expansionTiming?.expansion ?? 400;
    const collapseFadeMs = expansionTiming?.contentFadeOut ?? 150;
    const shortFadeMs = 150;
    const fullFadeMs = 300;

    if (reducedMotion) {
      switch (phase) {
        case 'expanded':
          return {
            short: { opacity: 0, transition: 'none' },
            full: { opacity: 1, transition: 'none' },
          };
        case 'collapsing':
        case 'contracting':
        case 'expanding':
        default:
          return {
            short: { opacity: 1, transition: 'none' },
            full: { opacity: 0, transition: 'none' },
          };
      }
    }

    switch (phase) {
      case 'expanding':
        return {
          short: {
            opacity: 1,
            transition: 'opacity 0s linear',
          },
          full: {
            opacity: 0,
            transition: 'opacity 0s linear',
          },
        };
      case 'expanded':
        return {
          short: {
            opacity: 0,
            transition: `opacity ${shortFadeMs}ms ease`,
            transitionDelay: `${expansionMs}ms`,
          },
          full: {
            opacity: 1,
            transition: `opacity ${fullFadeMs}ms ease`,
            transitionDelay: `${expansionMs + shortFadeMs}ms`,
          },
        };
      case 'collapsing':
        return {
          short: {
            opacity: 1,
            transition: `opacity ${collapseFadeMs}ms ease`,
            transitionDelay: '0ms',
          },
          full: {
            opacity: 0,
            transition: `opacity ${collapseFadeMs}ms ease`,
            transitionDelay: '0ms',
          },
        };
      case 'contracting':
        return {
          short: {
            opacity: 1,
            transition: 'none',
            transitionDelay: '0ms',
          },
          full: {
            opacity: 0,
            transition: 'none',
            transitionDelay: '0ms',
          },
        };
      default:
        return {
          short: {
            opacity: 1,
            transition: 'none',
          },
          full: {
            opacity: 0,
            transition: 'none',
          },
        };
    }
  }, [phase, expansionTiming, reducedMotion]);
}

const AboutCard = forwardRef(function AboutCard({ onClick, expanded, phase, expansionTiming, tiltHandlers = {}, mobileExpanded = false }, ref) {
  const reducedMotion = useReducedMotion();
  const desktopOpacity = useDesktopExpansionOpacity(phase, expansionTiming, reducedMotion);

  // Detect iPhone-sized viewports. At this size we always show the full
  // bio, no tap needed, no animation. See SMALL_MOBILE_MAX_PX comment.
  const [isSmallMobile, setIsSmallMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= SMALL_MOBILE_MAX_PX
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsSmallMobile(window.innerWidth <= SMALL_MOBILE_MAX_PX);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const desktopExpansionActive = Boolean(expanded && phase && phase !== 'idle');
  // Card is interactive only on desktop and in the mid-mobile band.
  // Small-mobile is always-expanded → no click target, no cursor cue.
  const isInteractive = !isSmallMobile;
  const showFullInline = isSmallMobile || mobileExpanded;

  return (
    <article
      ref={ref}
      data-card="about"
      className={`rounded-card bg-gradient-green shadow-card-inset flex-2 h-full flex flex-col justify-between overflow-hidden max-lg:flex-auto max-lg:w-full max-lg:h-auto p-6 xl:p-8 max-lg:p-7 max-sm:px-7 max-sm:py-8 ${
        isInteractive ? 'cursor-pointer hover:brightness-[0.88]' : ''
      }`}
      onClick={isInteractive ? onClick : undefined}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? 'Learn more about me' : undefined}
      aria-expanded={isInteractive ? (mobileExpanded || undefined) : undefined}
    >
      <header className="w-full flex items-center justify-between shrink-0 gap-3">
        {/* Heading scales with viewport so iPhone-SE-class screens don't
            collide with the profile icon next to it. clamp() floors at
            1.6rem (~25.6px) and caps at 2.5rem (40px) at >640px wide. */}
        <h2 className="text-text-primary font-semibold select-none whitespace-nowrap text-[clamp(1.6rem,7vw,2.5rem)] sm:text-[2.5rem]">
          About me
        </h2>
        <div className="shrink-0">
          <img src={profileIcon} alt="" className="select-none w-9 h-9 sm:w-auto sm:h-auto" />
        </div>
      </header>

      {desktopExpansionActive ? (
        <div className="relative flex-1 min-h-0 w-full flex flex-col justify-end mt-4 overflow-hidden">
          {/* Full bio behind — scroll when taller than slot */}
          <p
            className={`${textClass} absolute inset-x-0 bottom-0 max-h-full overflow-y-auto z-0`}
            style={{
              fontStyle: 'italic',
              ...desktopOpacity.full,
            }}
          >
            {ABOUT_TEXT.full}
          </p>
          {/* Short line on top — fades after geometry settles */}
          <p
            className={`${textClass} relative z-10 shrink-0`}
            style={{
              fontStyle: 'italic',
              pointerEvents: phase === 'expanded' ? 'none' : 'auto',
              ...desktopOpacity.short,
            }}
          >
            {ABOUT_TEXT.short}
          </p>
        </div>
      ) : (
        // Small-mobile: no transition (bio is final from first paint).
        // Mid-mobile: tap-to-expand max-height transition.
        <div
          className={`flex flex-col justify-end overflow-hidden shrink-0 mt-4 ${
            isSmallMobile ? '' : 'transition-[max-height] duration-400 ease-in-out'
          }`}
          style={
            isSmallMobile
              ? undefined
              : { maxHeight: mobileExpanded ? '500px' : '2.2em' }
          }
        >
          <p className={textClass} style={{ fontStyle: 'italic' }}>
            {showFullInline ? ABOUT_TEXT.full : ABOUT_TEXT.short}
          </p>
        </div>
      )}
    </article>
  );
});

export default AboutCard;
