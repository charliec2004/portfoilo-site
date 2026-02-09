import { forwardRef } from 'react';
import profileIcon from '../../assets/icons/profile.svg';

const ABOUT_TEXT = {
  short: "I like building things.",
  full: "I like building things. I move quickly, learn by doing, and adjust based on what breaks or gets used, because I believe decisions only matter once they meet reality. I hate unnecessary complexity. I work across engineering and product because that is where ideas get pressure tested and turned into something real. I care deeply about momentum, honest feedback, and progress that compounds. This site is a running log of what I am building, what works, and what I am still figuring out."
};

const AboutCard = forwardRef(function AboutCard({ onClick, expanded, phase, expansionTiming, tiltHandlers = {}, mobileExpanded = false }, ref) {
  // Desktop clone cross-fade flags
  const shortVisible = !expanded || phase !== 'expanded';
  const fullVisible = expanded && phase === 'expanded';

  return (
    <article
      ref={ref}
      data-card="about"
      className="rounded-card bg-gradient-green shadow-card-inset flex-2 h-full flex flex-col justify-start p-8 overflow-hidden cursor-pointer hover:brightness-[0.88] max-lg:flex-auto max-lg:w-full max-lg:h-auto max-sm:p-6"
      onClick={onClick}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={0}
      role="button"
      aria-label="Learn more about me"
      aria-expanded={mobileExpanded || undefined}
    >
      <header className="w-full flex items-center justify-between mr-4 max-lg:mb-8">
        <div className="flex flex-col">
          <h2 className="text-[2.5rem] text-text-primary font-semibold select-none whitespace-nowrap">
            About me
          </h2>
        </div>
        <div className="shrink-0">
          <img src={profileIcon} alt="" className="select-none" />
        </div>
      </header>
      <div
        className={`flex-1 flex flex-col justify-end ${!expanded ? 'max-lg:max-h-20 max-lg:overflow-hidden max-lg:[transition:max-height_0.4s_ease]' : ''}`}
        style={mobileExpanded ? { maxHeight: '500px' } : {}}
      >
        {expanded ? (
          <div className="relative">
            {/* Short text: in normal flow, determines layout height */}
            <p
              className="text-[1.25rem] font-accent italic text-text-secondary font-normal leading-relaxed"
              style={{
                opacity: shortVisible ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              {ABOUT_TEXT.short}
            </p>
            {/* Full text: absolutely positioned overlay, cross-fades with short */}
            <p
              className="absolute bottom-0 left-0 right-0 text-[1.25rem] font-accent italic text-text-secondary font-normal leading-relaxed"
              style={{
                opacity: fullVisible ? 1 : 0,
                transition: fullVisible ? 'opacity 0.3s ease 0.15s' : 'opacity 0.15s ease',
              }}
              aria-hidden={!fullVisible}
            >
              {ABOUT_TEXT.full}
            </p>
          </div>
        ) : (
          <p className="text-[1.25rem] font-accent italic text-text-secondary font-normal leading-relaxed">
            {mobileExpanded ? ABOUT_TEXT.full : ABOUT_TEXT.short}
          </p>
        )}
      </div>
      {/* Mobile expand chevron — hidden on desktop */}
      <div className="hidden max-lg:flex justify-center mt-2">
        <span
          className="text-text-muted text-[0.6rem] select-none transition-transform duration-300"
          style={{ transform: mobileExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </div>
    </article>
  );
});

export default AboutCard;
