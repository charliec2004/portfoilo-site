import { forwardRef } from 'react';
import { SKILLS, SKILL_CATEGORIES, BADGE_SHAPES } from '../../data/skills';
import toolsIcon from '../../assets/icons/tools.svg';

const skillModules = import.meta.glob('../../assets/skills/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const skillUrls = {};
for (const [path, url] of Object.entries(skillModules)) {
  const filename = path.split('/').pop();
  skillUrls[filename] = url;
}

const skillsByCategory = {};
for (const cat of SKILL_CATEGORIES) {
  skillsByCategory[cat] = SKILLS.filter((s) => s.category === cat);
}

const SkillsCard = forwardRef(function SkillsCard({ onClick, expanded, phase, expansionTiming, tiltHandlers = {}, mobileExpanded = false }, ref) {
  const showIcons = mobileExpanded || (expanded && phase === 'expanded');
  const iconDelay = mobileExpanded ? 200 : (expansionTiming?.skillIconDelay || 700);
  const iconStagger = expansionTiming?.skillIconStagger || 80;

  let globalIndex = 0;

  // Mobile inline expansion uses responsive Tailwind classes for the collapsed
  // max-height constraint, with an inline override when expanded. This avoids
  // applying the constraint on desktop where it would break the flex layout.

  return (
    <article
      ref={ref}
      data-card="skills"
      className={`rounded-card bg-gradient-green shadow-card-inset flex-1 h-full flex flex-col justify-center items-start p-8 ${showIcons ? 'overflow-visible' : 'overflow-hidden'} cursor-pointer hover:brightness-[0.88] max-lg:w-full max-lg:flex-auto max-lg:h-auto max-sm:p-6`}
      onClick={onClick}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={0}
      role="button"
      aria-label="View my skills and tools"
      aria-expanded={mobileExpanded || undefined}
    >
      <header className="w-full flex items-center justify-between mr-4">
        <p className="text-[0.85rem] font-accent italic text-text-primary font-normal leading-relaxed select-none">
          Things I use
        </p>
        <div className="shrink-0">
          <img src={toolsIcon} alt="" className="select-none" />
        </div>
      </header>
      <div
        className={`flex flex-col flex-1 w-full justify-center gap-5 min-h-8 ${!expanded ? 'max-lg:max-h-8 max-lg:overflow-hidden max-lg:[transition:max-height_0.5s_ease]' : ''}`}
        style={mobileExpanded ? { maxHeight: '800px' } : {}}
      >
        {SKILL_CATEGORIES.map((category, catIdx) => {
          const skills = skillsByCategory[category];
          return (
            <div key={category} className="flex flex-col gap-3">
              {/* Category separator — gold gradient line between groups */}
              {catIdx > 0 && (
                <div
                  className="w-full h-px my-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(179, 142, 57, 0.4), transparent)',
                    opacity: showIcons ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    transitionDelay: showIcons ? `${iconDelay - 150}ms` : '0ms',
                  }}
                />
              )}

              {/* Category label */}
              <p
                className="text-[0.7rem] font-heading font-semibold text-text-muted uppercase tracking-widest select-none"
                style={{
                  opacity: showIcons ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  transitionDelay: showIcons ? `${iconDelay - 100}ms` : '0ms',
                }}
              >
                {category}
              </p>

              {/* Skill badges */}
              <div className="flex flex-row items-start gap-4 flex-wrap">
                {skills.map((skill) => {
                  const idx = globalIndex++;
                  const shape = BADGE_SHAPES[idx % BADGE_SHAPES.length];
                  return (
                    <div
                      key={skill.name}
                      className="flex flex-col items-center gap-1.5"
                      style={{
                        opacity: showIcons ? 1 : 0,
                        transform: showIcons ? 'scale(1)' : 'scale(0.5)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        transitionDelay: showIcons ? `${iconDelay + idx * iconStagger}ms` : '0ms',
                        pointerEvents: showIcons ? 'auto' : 'none',
                      }}
                    >
                      <span
                        className={`skill-badge ${showIcons ? 'skill-tooltip' : ''}`}
                        data-tooltip={showIcons ? skill.tooltip : undefined}
                        tabIndex={showIcons ? 0 : -1}
                        style={{
                          borderRadius: shape.borderRadius,
                          transform: `rotate(${shape.rotate}deg)`,
                        }}
                      >
                        <img
                          src={skillUrls[skill.file]}
                          alt={skill.name}
                          className="w-8 h-8 max-sm:w-6 max-sm:h-6 select-none"
                          style={{ transform: `rotate(${-shape.rotate}deg)` }}
                        />
                      </span>
                      <span className="text-[0.65rem] font-heading font-medium text-text-muted select-none text-center leading-tight whitespace-nowrap">
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <h2 className="text-[2.5rem] text-text-primary font-semibold select-none whitespace-nowrap shrink-0 relative">
        Skills &amp; Tools
      </h2>
      {/* Mobile expand chevron */}
      <div className="hidden max-lg:flex justify-center w-full mt-1">
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

export default SkillsCard;
