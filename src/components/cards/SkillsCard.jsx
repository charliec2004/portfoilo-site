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

/**
 * Inside the mobile band (<960px), Skills behaves in two sub-bands:
 *   - SMALL_MOBILE_MAX_PX and below: card is always expanded, badges
 *     animate in via IntersectionObserver scroll-reveal.
 *   - Above SMALL_MOBILE_MAX_PX (up to the desktop breakpoint): card is
 *     collapsed by default and taps to expand inline (matches AboutCard).
 * Matches Tailwind's `sm` breakpoint so it lines up with other `max-sm:*`
 * tweaks elsewhere in the file.
 */
const SMALL_MOBILE_MAX_PX = 640;

const SkillsCard = forwardRef(function SkillsCard({
  onClick,
  expanded,
  phase,
  expansionTiming,
  tiltHandlers = {},
  isMobile = false,
  /** Mobile mid-band: controlled by App's useMobileExpansion (tap-to-expand). */
  mobileExpanded = false,
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

  // Sub-band detector inside the mobile range. See SMALL_MOBILE_MAX_PX above.
  const [isSmallMobile, setIsSmallMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= SMALL_MOBILE_MAX_PX
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsSmallMobile(window.innerWidth <= SMALL_MOBILE_MAX_PX);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile mode: 'small' = always-on + scroll reveal, 'mid' = tap-to-expand.
  const mobileMode = isMobile ? (isSmallMobile ? 'small' : 'mid') : null;
  const isMidMobileTapToExpand = mobileMode === 'mid';

  const cardInnerRef = useRef(null);

  // showIcons drives the badge stagger animation in.
  // - Desktop: gated on phase === 'expanded'.
  // - Mobile small (iPhone-sized): always visible immediately. The user
  //   explicitly asked that nothing require tap-or-scroll to reveal at
  //   this size — everything is already expanded.
  // - Mobile mid: gated on tap (mobileExpanded).
  let showIcons;
  if (!isMobile) {
    showIcons = desktopShowIcons;
  } else if (mobileMode === 'small') {
    showIcons = true;
  } else {
    showIcons = mobileExpanded;
  }

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

  // Card is interactive on desktop AND in the mid-mobile tap-to-expand band.
  // Small-mobile keeps the card always-expanded and non-interactive (the
  // skill grid auto-reveals on scroll, so there's nothing to toggle).
  const isInteractive = !isMobile || isMidMobileTapToExpand;
  const articleClickHandler = isInteractive ? onClick : undefined;

  return (
    <article
      ref={ref}
      data-card="skills"
      // STRUCTURAL CLIP: `overflow-hidden` on the article guarantees the
      // rounded-card box can never be visually exceeded, regardless of how
      // many skills exist or how short the slot becomes. Scrolling is
      // delegated to the inner badge container below — see `skills-scroll`
      // class. Tooltips render via a portal to document.body, so clipping
      // here doesn't affect them.
      className={`rounded-card bg-gradient-green shadow-card-inset flex-1 h-full flex flex-col justify-start items-stretch gap-6 xl:gap-8 p-6 xl:p-8 overflow-hidden max-lg:w-full max-lg:flex-auto max-lg:h-auto max-lg:p-7 max-sm:px-7 max-sm:py-8 ${isInteractive ? 'cursor-pointer hover:brightness-[0.88]' : ''} ${slotHidden ? 'opacity-0 pointer-events-none' : ''}`}
      onClick={articleClickHandler}
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
      tabIndex={isInteractive ? (slotHidden ? -1 : 0) : undefined}
      aria-hidden={slotHidden ? true : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? 'View my skills and tools' : undefined}
      aria-expanded={isMidMobileTapToExpand ? mobileExpanded : undefined}
    >
      <header className="w-full flex items-center justify-between shrink-0">
        <p className="text-[0.85rem] font-accent italic text-text-primary font-normal leading-relaxed select-none">
          Things I use
        </p>
        <div className="shrink-0 flex items-center gap-3">
          {/* Mid-mobile expand affordance — chevron rotates with state.
              Hidden in every other mode so it doesn't add visual noise. */}
          {isMidMobileTapToExpand ? (
            <span
              aria-hidden="true"
              className="font-mono text-[1.1rem] text-text-muted select-none transition-transform duration-300"
              style={{ transform: mobileExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              v
            </span>
          ) : null}
          <img src={toolsIcon} alt="" className="select-none" />
        </div>
      </header>
      {/* Mid-mobile collapse: animate the grid container's row from 0fr→1fr
          (true content height, no rubber band) and fade in. Other modes keep
          the grid mounted full-size and need `flex-1 min-h-0` so the wrapper
          absorbs the remaining article height — without it `mt-auto` on the
          "Skills & Tools" h2 below has no free space to push into and the
          h2 gets pushed past the card slot. */}
      <div
        className={`grid w-full ${
          isMidMobileTapToExpand
            ? 'overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
            : 'flex-1 min-h-0'
        }`}
        style={
          isMidMobileTapToExpand
            ? {
                gridTemplateRows: mobileExpanded ? '1fr' : '0fr',
                opacity: mobileExpanded ? 1 : 0,
              }
            : { gridTemplateRows: '1fr' }
        }
        aria-hidden={isMidMobileTapToExpand ? !mobileExpanded : undefined}
        // When expanded in mid-mobile, the article's onClick toggles collapse.
        // Stop propagation here so taps on the skill grid don't bubble up and
        // close the card mid-interaction. Header / footer (siblings of this
        // div) still bubble up and act as the toggle affordance.
        onClick={
          isMidMobileTapToExpand && mobileExpanded
            ? (e) => e.stopPropagation()
            : undefined
        }
      >
      <div
        ref={cardInnerRef}
        // BOUNDED SCROLL: when content > available row height, the badges
        // scroll *inside* this container instead of pushing the "Skills &
        // Tools" footer past the article's clip. `overflow-x-hidden` is
        // explicit so the rare horizontal overflow from rotated badge
        // wrappers can't ever leak. `skills-scroll` enables a thin styled
        // scrollbar (see app.css). On mid-mobile-tap-to-expand mode we keep
        // it hidden so the parent grid-row collapse stays clean.
        className={`flex flex-col w-full min-h-0 gap-10 overflow-y-auto overflow-x-hidden skills-scroll max-lg:flex-none ${isMidMobileTapToExpand ? 'overflow-hidden' : ''}`}
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
      </div>
      <h2 className="text-text-primary font-semibold select-none whitespace-nowrap shrink-0 mt-auto pt-12 max-sm:pt-10 relative text-[clamp(1.6rem,7vw,2.5rem)] sm:text-[2.5rem]">
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
