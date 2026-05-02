import { forwardRef, useState, useEffect, useRef, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { SKILLS, SKILL_CATEGORIES, BADGE_SHAPES } from '../../data/skills';
import toolsIcon from '../../assets/icons/tools.svg';
import { clampFloatingTooltipPosition } from '../../utils/clampFloatingTooltip';
import { readTooltipTiltTransform } from '../../utils/readTooltipTiltTransform';
import { TOOLTIP_DWELL_MS } from '../../constants/tooltipTiming';
import useReducedMotion from '../../hooks/useReducedMotion';

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

const SkillsCard = forwardRef(function SkillsCard({
  onClick,
  expanded,
  phase,
  expansionTiming,
  tiltHandlers = {},
  isMobile = false,
  /** Desktop expansion: hide grid-slot card while clone overlay is showing */
  slotHidden = false,
  tooltipPageReady = false,
}, ref) {
  const reducedMotion = useReducedMotion();
  const skillTooltipTipId = useId();

  const desktopShowIcons = expanded && phase === 'expanded';
  const iconDelay = isMobile ? 0 : (expansionTiming?.skillIconDelay || 700);
  const iconStagger = isMobile ? 0 : (expansionTiming?.skillIconStagger || 80);
  /** Matches badge opacity/transform transition duration */
  const SKILL_ICON_ENTER_MS = 300;

  const [mobileScrollRevealed, setMobileScrollRevealed] = useState(false);
  const cardInnerRef = useRef(null);

  useEffect(() => {
    if (!isMobile) return;
    const el = cardInnerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMobileScrollRevealed(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  const showIcons = isMobile ? mobileScrollRevealed : desktopShowIcons;

  const [skillMotionReady, setSkillMotionReady] = useState(false);

  useEffect(() => {
    if (!showIcons) {
      setSkillMotionReady(false);
      return;
    }
    const lastIdx = SKILLS.length - 1;
    const elapsed =
      isMobile
        ? lastIdx * 40 + SKILL_ICON_ENTER_MS
        : iconDelay + lastIdx * iconStagger + SKILL_ICON_ENTER_MS;
    const id = window.setTimeout(() => setSkillMotionReady(true), elapsed);
    return () => window.clearTimeout(id);
  }, [showIcons, isMobile, iconDelay, iconStagger]);

  const badgeHoverReady =
    showIcons && skillMotionReady && !isMobile && tooltipPageReady;

  const [skillTooltip, setSkillTooltip] = useState(null);
  const [skillTipEntered, setSkillTipEntered] = useState(false);
  const skillTooltipAnchorRef = useRef(null);
  const skillTooltipShellRef = useRef(null);
  const skillTooltipTiltRef = useRef(null);
  const skillTooltipContentRef = useRef(null);
  const hideTooltipTimeoutRef = useRef(null);
  const dwellTimerRef = useRef(null);

  const clearDwellTimer = useCallback(() => {
    if (dwellTimerRef.current != null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const cancelScheduledHideTooltip = useCallback(() => {
    if (hideTooltipTimeoutRef.current != null) {
      window.clearTimeout(hideTooltipTimeoutRef.current);
      hideTooltipTimeoutRef.current = null;
    }
  }, []);

  const hideSkillTooltip = useCallback(() => {
    clearDwellTimer();
    cancelScheduledHideTooltip();
    skillTooltipAnchorRef.current = null;
    setSkillTooltip(null);
    setSkillTipEntered(false);
  }, [clearDwellTimer, cancelScheduledHideTooltip]);

  const scheduleHideSkillTooltip = useCallback(() => {
    clearDwellTimer();
    cancelScheduledHideTooltip();
    hideTooltipTimeoutRef.current = window.setTimeout(() => {
      hideTooltipTimeoutRef.current = null;
      hideSkillTooltip();
    }, 80);
  }, [clearDwellTimer, cancelScheduledHideTooltip, hideSkillTooltip]);

  const scheduleSkillTooltipForBadge = useCallback(
    (e, skill) => {
      if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
      if (!badgeHoverReady) return;
      cancelScheduledHideTooltip();
      clearDwellTimer();
      const anchor = e.currentTarget;
      dwellTimerRef.current = window.setTimeout(() => {
        dwellTimerRef.current = null;
        skillTooltipAnchorRef.current = anchor;
        setSkillTipEntered(false);
        setSkillTooltip({ text: skill.tooltip, anchorKey: skill.name });
      }, TOOLTIP_DWELL_MS);
    },
    [badgeHoverReady, cancelScheduledHideTooltip, clearDwellTimer]
  );

  useEffect(() => {
    if (!showIcons) hideSkillTooltip();
  }, [showIcons, hideSkillTooltip]);

  useEffect(
    () => () => {
      clearDwellTimer();
      cancelScheduledHideTooltip();
    },
    [clearDwellTimer, cancelScheduledHideTooltip]
  );

  useEffect(() => {
    if (!skillTooltip) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      hideSkillTooltip();
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [skillTooltip, hideSkillTooltip]);

  useLayoutEffect(() => {
    if (
      !skillTooltip
      || !skillTooltipShellRef.current
      || !skillTooltipTiltRef.current
      || !skillTooltipContentRef.current
      || !skillTooltipAnchorRef.current
    ) {
      return;
    }

    const shell = skillTooltipShellRef.current;
    const tiltWrap = skillTooltipTiltRef.current;
    const content = skillTooltipContentRef.current;

    let prevTilt = '';

    const clampPosition = () => {
      const anchor = skillTooltipAnchorRef.current;
      if (!anchor?.isConnected || !tiltWrap) return;
      clampFloatingTooltipPosition(anchor, shell, content);
    };

    const applyTiltIfChanged = () => {
      const anchor = skillTooltipAnchorRef.current;
      if (!anchor?.isConnected || !tiltWrap) return;
      const next = readTooltipTiltTransform(anchor);
      if (next !== prevTilt) {
        tiltWrap.style.transform = next;
        prevTilt = next;
      }
    };

    const clampNow = () => {
      clampPosition();
      applyTiltIfChanged();
    };

    const scrollOpts = { capture: true, passive: true };
    const resizeOpts = { passive: true };

    if (reducedMotion) {
      setSkillTipEntered(true);
      clampNow();
      queueMicrotask(clampNow);

      const ro = new ResizeObserver(clampNow);
      ro.observe(content);
      window.addEventListener('resize', clampNow, resizeOpts);
      window.addEventListener('scroll', clampNow, scrollOpts);

      return () => {
        ro.disconnect();
        window.removeEventListener('resize', clampNow, resizeOpts);
        window.removeEventListener('scroll', clampNow, scrollOpts);
      };
    }

    setSkillTipEntered(false);
    clampNow();
    queueMicrotask(clampNow);

    let followRaf = null;
    const tickFollow = () => {
      if (!document.hidden) {
        clampPosition();
        applyTiltIfChanged();
      }
      followRaf = requestAnimationFrame(tickFollow);
    };

    let kickoff = requestAnimationFrame(() => {
      clampNow();
      requestAnimationFrame(() => {
        clampNow();
        setSkillTipEntered(true);
        requestAnimationFrame(clampNow);
        followRaf = requestAnimationFrame(tickFollow);
      });
    });

    const ro = new ResizeObserver(clampNow);
    ro.observe(content);

    window.addEventListener('resize', clampNow, resizeOpts);

    return () => {
      cancelAnimationFrame(kickoff);
      if (followRaf != null) cancelAnimationFrame(followRaf);
      ro.disconnect();
      window.removeEventListener('resize', clampNow, resizeOpts);
    };
  }, [skillTooltip, reducedMotion]);

  let globalIndex = 0;

  return (
    <article
      ref={ref}
      data-card="skills"
      className={`rounded-card bg-gradient-green shadow-card-inset flex-1 h-full flex flex-col justify-start items-stretch gap-8 p-8 overflow-visible max-lg:w-full max-lg:flex-auto max-lg:h-auto max-lg:p-7 max-sm:px-7 max-sm:py-8 ${isMobile ? '' : 'cursor-pointer hover:brightness-[0.88]'} ${slotHidden ? 'opacity-0 pointer-events-none' : ''}`}
      onClick={isMobile ? undefined : onClick}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={isMobile ? undefined : slotHidden ? -1 : 0}
      aria-hidden={slotHidden ? true : undefined}
      role={isMobile ? undefined : 'button'}
      aria-label={isMobile ? undefined : 'View my skills and tools'}
    >
      <header className="w-full flex items-center justify-between shrink-0">
        <p className="text-[0.85rem] font-accent italic text-text-primary font-normal leading-relaxed select-none">
          Things I use
        </p>
        <div className="shrink-0">
          <img src={toolsIcon} alt="" className="select-none" />
        </div>
      </header>
      <div
        ref={cardInnerRef}
        className="flex flex-col flex-1 w-full min-h-0 gap-10 overflow-visible max-lg:flex-none"
      >
        {SKILL_CATEGORIES.map((category, catIdx) => {
          const skills = skillsByCategory[category];
          return (
            <div key={category} className="flex flex-col gap-4 min-w-0">
              {catIdx > 0 && (
                <div
                  className="skills-category-rule w-full h-px shrink-0 mb-5 max-sm:mb-4"
                  aria-hidden="true"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(179, 142, 57, 0.4), transparent)',
                    opacity: showIcons ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    transitionDelay: showIcons ? `${iconDelay > 0 ? iconDelay - 150 : 0}ms` : '0ms',
                  }}
                />
              )}

              <p
                className="text-[0.7rem] font-heading font-semibold text-text-muted uppercase tracking-widest select-none"
                style={{
                  opacity: showIcons ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  transitionDelay: showIcons ? `${iconDelay > 0 ? iconDelay - 100 : 0}ms` : '0ms',
                }}
              >
                {category}
              </p>

              <div className="skills-badge-grid grid w-full grid-cols-[repeat(auto-fill,minmax(6.25rem,1fr))] gap-x-4 gap-y-6 justify-items-center max-sm:grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] max-sm:gap-x-3 max-sm:gap-y-5">
                {skills.map((skill) => {
                  const idx = globalIndex++;
                  const shape = BADGE_SHAPES[idx % BADGE_SHAPES.length];
                  const mobileStagger = idx * 40;
                  return (
                    <div
                      key={skill.name}
                      className="flex flex-col items-center gap-2 w-full min-w-0 px-0.5"
                      style={{
                        opacity: showIcons ? 1 : 0,
                        transform: showIcons ? 'scale(1)' : 'scale(0.5)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        transitionDelay: showIcons
                          ? `${isMobile ? mobileStagger : (iconDelay + idx * iconStagger)}ms`
                          : '0ms',
                        pointerEvents: showIcons ? (badgeHoverReady ? 'auto' : 'none') : 'none',
                      }}
                    >
                      <span
                        className={`skill-badge${badgeHoverReady ? ' skill-tooltip skill-tooltip--portal-target' : ''}`}
                        data-tooltip-tilt-z={shape.rotate}
                        aria-describedby={
                          skillTooltip?.anchorKey === skill.name ? skillTooltipTipId : undefined
                        }
                        tabIndex={badgeHoverReady ? 0 : -1}
                        onMouseEnter={badgeHoverReady ? (e) => scheduleSkillTooltipForBadge(e, skill) : undefined}
                        onMouseLeave={badgeHoverReady ? scheduleHideSkillTooltip : undefined}
                        onFocus={badgeHoverReady ? (e) => scheduleSkillTooltipForBadge(e, skill) : undefined}
                        onBlur={badgeHoverReady ? hideSkillTooltip : undefined}
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
                      <span className="text-[0.65rem] font-heading font-medium text-text-muted select-none text-center leading-snug whitespace-normal max-w-full px-0.5">
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
      <h2 className="text-[2.5rem] text-text-primary font-semibold select-none whitespace-nowrap shrink-0 mt-auto pt-12 max-sm:pt-10 relative">
        Skills &amp; Tools
      </h2>
      {skillTooltip && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={skillTooltipShellRef}
              className="skill-tooltip-shell skill-tooltip-portal--fine-pointer-only"
            >
              <div ref={skillTooltipTiltRef} className="skill-tooltip-tilt-follow">
                <div
                  ref={skillTooltipContentRef}
                  id={skillTooltipTipId}
                  role="tooltip"
                  className={`skill-tooltip-portal ${skillTipEntered ? 'is-visible' : ''}`}
                >
                  {skillTooltip.text}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </article>
  );
});

export default SkillsCard;
