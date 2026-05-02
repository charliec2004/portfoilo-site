import { forwardRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import useGitHubRepos from '../../hooks/useGitHubRepos';

const LANG_COLORS = {
  TypeScript: '#3178C6',
  Python: '#3572A5',
  Java: '#B07219',
  JavaScript: '#F1E05A',
  HTML: '#E34C26',
  CSS: '#563D7C',
  'C++': '#F34B7D',
};

/* ──────────────────────────────────────────────────────────────────────
 * Project detail expand/collapse animation — INTENTIONALLY DISABLED.
 * ──────────────────────────────────────────────────────────────────────
 * Decision (2026-05-01): the previous max-height ease-in-out slide felt
 * rubbery/"explode-y" on short descriptions (max-height animates the gap,
 * not the actual content height, so it rubber-bands). We're shipping with
 * an instant snap toggle for now — the underline lock-on + arrow flip
 * already give clear visual feedback on click.
 *
 * The animated path is preserved below the snap path in JSX. To re-enable,
 * flip PROJECT_PANEL_ANIM_ENABLED to `true`. The preserved animation uses
 * the modern CSS grid-row trick (`grid-template-rows: 0fr <-> 1fr`) which
 * animates to the panel's *true* content height — no 300px cap, no rubber
 * band on short descriptions, no jank on long ones. Tweak the duration /
 * easing constants below if/when re-enabling.
 * ──────────────────────────────────────────────────────────────────────
 */
const PROJECT_PANEL_ANIM_ENABLED = false;
const PROJECT_PANEL_ANIM_DURATION_MS = 220;
const PROJECT_PANEL_ANIM_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'; // Apple-style ease-out

const ProjectsCard = forwardRef(function ProjectsCard({ tiltHandlers = {} }, ref) {
  const { data: ghData } = useGitHubRepos(PROJECTS);
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleProject = (name) => {
    setExpandedProject((prev) => (prev === name ? null : name));
  };

  return (
    <section
      ref={ref}
      data-card="projects"
      className="rounded-card bg-gradient-green shadow-card-inset w-full flex-1 flex flex-col gap-4 overflow-hidden p-6 xl:p-8 max-lg:p-7 max-sm:px-7 max-sm:py-8"
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
    >
      <header className="w-full flex flex-col items-start gap-2">
        {/* Same fluid heading scale as the other cards. */}
        <h2 className="text-text-primary font-semibold select-none whitespace-nowrap text-[clamp(1.6rem,7vw,2.5rem)] sm:text-[2.5rem]">
          Projects
        </h2>
        <p className="text-[0.85rem] font-accent italic text-text-primary font-normal leading-relaxed select-none">
          Things I built
        </p>
      </header>

      <div className="flex flex-col gap-4 max-sm:gap-6 w-full overflow-y-auto">
        {PROJECTS.map((project) => {
          const gh = ghData[project.repo];
          const isOpen = expandedProject === project.name;

          return (
            <div key={project.name} className="flex flex-col">
              {/* Project title row */}
              <button
                type="button"
                className="group flex flex-col w-full min-w-0 relative pb-[0.35rem] text-left"
                onClick={() => toggleProject(project.name)}
                aria-expanded={isOpen}
                title={!isOpen ? project.name : undefined}
              >
                <p
                  className={`project-title font-mono italic text-text-primary font-normal leading-relaxed tracking-[0.01rem] select-none transition-colors duration-300 group-hover:text-text-accent group-focus-visible:text-text-accent text-[clamp(1.02rem,4.6vw,1.25rem)] sm:text-[1.25rem] ${
                    isOpen
                      ? 'whitespace-normal break-words'
                      : 'overflow-hidden text-ellipsis whitespace-nowrap'
                  }`}
                >
                  <span
                    className="not-italic inline-block mr-1.5 transition-transform duration-350 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    aria-hidden="true"
                  >
                    {isOpen ? 'v' : '>'}
                  </span>
                  {project.name}
                </p>
                <div
                  className={`bg-text-primary h-px w-full -mt-[0.4rem] origin-left transition-transform duration-450 ${
                    isOpen
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100'
                  }`}
                />
              </button>

              {/* Subtitle for non-GitHub projects */}
              {project.subtitle && !project.repo && (
                <p
                  className={`mt-1 text-[0.7rem] font-heading ${project.subtitleAccent ? 'project-subtitle-accent-shimmer' : 'text-text-muted'}`}
                >
                  {project.subtitle}
                </p>
              )}

              {/* GitHub metadata */}
              {project.repo && gh && (
                <div className="flex items-center gap-3 mt-1 text-[0.7rem] text-text-muted font-heading">
                  {gh.languages?.map((l) => (
                    <span key={l.name} className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: LANG_COLORS[l.name] || '#ccc' }}
                      />
                      {l.name}
                    </span>
                  ))}
                  {gh.stars > 0 && <span>&#9733; {gh.stars}</span>}
                  {gh.updatedAt && <span>{gh.updatedAt}</span>}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  Expandable detail panel.

                  Two render paths exist below. The active one is selected
                  by PROJECT_PANEL_ANIM_ENABLED (top of file).

                  - SNAP (current/default): `isOpen && <details/>`. Instant
                    toggle, zero transition — picked over the previous
                    max-height slide because that slide felt tacky on short
                    content.

                  - ANIMATED (preserved, not wired up): grid-template-rows
                    0fr <-> 1fr trick. Animates to true content height
                    with a synced opacity fade. Flip the constant to true
                    to use it.

                  Detail content is shared between both paths via the
                  `detail` variable so we never drift the markup.
                  ──────────────────────────────────────────────────────── */}
              {(() => {
                const detail = (
                  <div className="pt-3 pb-2 flex flex-col gap-3">
                    <p className="text-[0.85rem] font-accent italic text-text-secondary leading-relaxed whitespace-normal">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="text-[0.7rem] font-heading font-medium px-2.5 py-1 rounded-full border border-text-accent/30 text-text-accent"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.8rem] font-heading font-semibold text-text-accent hover:underline self-start"
                    >
                      {project.repo ? 'View on GitHub' : 'Visit'} &rarr;
                    </a>
                  </div>
                );

                if (PROJECT_PANEL_ANIM_ENABLED) {
                  // Animated path — kept intact for easy re-enable.
                  // grid-template-rows transitions to the panel's natural
                  // height (no rubber-band, no 300px cap). The inner
                  // `min-h-0 overflow-hidden` is required for the row
                  // collapse to actually clip the child during animation.
                  const transition = `grid-template-rows ${PROJECT_PANEL_ANIM_DURATION_MS}ms ${PROJECT_PANEL_ANIM_EASING}, opacity ${PROJECT_PANEL_ANIM_DURATION_MS}ms ${PROJECT_PANEL_ANIM_EASING}`;
                  return (
                    <div
                      className="grid"
                      style={{
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        opacity: isOpen ? 1 : 0,
                        transition,
                      }}
                      aria-hidden={!isOpen}
                    >
                      <div className="min-h-0 overflow-hidden">{detail}</div>
                    </div>
                  );
                }

                // Snap path (current default): instant toggle, no motion.
                return isOpen ? detail : null;
              })()}
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default ProjectsCard;
