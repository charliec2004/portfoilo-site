import { forwardRef, useMemo } from 'react';
import profileIcon from '../../assets/icons/profile.svg';
import useReducedMotion from '../../hooks/useReducedMotion';

const ABOUT_TEXT = {
  short: "I like building things.",
  full: "I like building things. I move fast, learn by doing, and change course when something breaks or actually gets used. Decisions don't really mean anything until they hit reality. I have no patience for complexity that isn't earning its keep. I work across engineering and product because that's where ideas stop being ideas and start being real. What I care about is momentum, honest feedback, and progress that adds up. This site is a running log of what I'm building, what's working, and what I'm still figuring out.",
};

const textClass =
  'text-[1.25rem] font-accent text-text-secondary font-normal leading-relaxed';

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

  const desktopExpansionActive = Boolean(expanded && phase && phase !== 'idle');

  return (
    <article
      ref={ref}
      data-card="about"
      className="rounded-card bg-gradient-green shadow-card-inset flex-2 h-full flex flex-col justify-between overflow-hidden cursor-pointer hover:brightness-[0.88] max-lg:flex-auto max-lg:w-full max-lg:h-auto p-6 xl:p-8 max-lg:p-7 max-sm:px-7 max-sm:py-8"
      onClick={onClick}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={0}
      role="button"
      aria-label="Learn more about me"
      aria-expanded={mobileExpanded || undefined}
    >
      <header className="w-full flex items-center justify-between shrink-0">
        <h2 className="text-[2.5rem] text-text-primary font-semibold select-none whitespace-nowrap">
          About me
        </h2>
        <div className="shrink-0">
          <img src={profileIcon} alt="" className="select-none" />
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
        <div
          className="flex flex-col justify-end overflow-hidden transition-[max-height] duration-400 ease-in-out shrink-0 mt-4"
          style={{ maxHeight: mobileExpanded ? '500px' : '2.2em' }}
        >
          <p className={textClass} style={{ fontStyle: 'italic' }}>
            {mobileExpanded ? ABOUT_TEXT.full : ABOUT_TEXT.short}
          </p>
        </div>
      )}
    </article>
  );
});

export default AboutCard;
