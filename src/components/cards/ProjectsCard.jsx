import { forwardRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import useGitHubRepos from '../../hooks/useGitHubRepos';

const LANG_COLORS = {
  Python: '#3572A5',
  Java: '#B07219',
  JavaScript: '#F1E05A',
  HTML: '#E34C26',
  CSS: '#563D7C',
  'C++': '#F34B7D',
};

const ProjectsCard = forwardRef(function ProjectsCard({ tiltHandlers = {}, ...props }, ref) {
  const { data: ghData, loading } = useGitHubRepos(PROJECTS);
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleProject = (name) => {
    setExpandedProject((prev) => (prev === name ? null : name));
  };

  return (
    <section
      ref={ref}
      data-card="projects"
      className="rounded-card bg-gradient-green shadow-card-inset w-full flex-1 flex flex-col p-8 max-sm:p-6 gap-4 overflow-hidden"
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
    >
      <header className="w-full flex flex-col items-start gap-2">
        <h2 className="text-[2.5rem] text-text-primary font-semibold select-none whitespace-nowrap">
          Projects
        </h2>
        <p className="text-[0.85rem] font-accent italic text-text-primary font-normal leading-relaxed select-none">
          Things I built
        </p>
      </header>

      <div className="flex flex-col gap-4 w-full overflow-y-auto">
        {PROJECTS.map((project) => {
          const gh = ghData[project.repo];
          const isOpen = expandedProject === project.name;

          return (
            <div key={project.name} className="flex flex-col">
              {/* Project title row */}
              <button
                type="button"
                className="group flex flex-col shrink min-w-0 overflow-hidden whitespace-nowrap relative pb-[0.35rem] text-left"
                onClick={() => toggleProject(project.name)}
                aria-expanded={isOpen}
              >
                <p className="text-[1.25rem] font-mono italic text-text-primary font-normal leading-relaxed tracking-[0.01rem] select-none transition-colors duration-300 group-hover:text-text-accent group-focus-visible:text-text-accent">
                  <span className="not-italic inline-block transition-transform duration-350 group-hover:translate-x-1 group-focus-visible:translate-x-1">
                    {isOpen ? 'v' : '>'}
                  </span>
                  {' '}{project.name}
                </p>
                <div className="bg-text-primary h-px w-full -mt-[0.4rem] scale-x-0 origin-left transition-transform duration-450 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </button>

              {/* GitHub metadata */}
              {gh && (
                <div className="flex items-center gap-3 mt-1 text-[0.7rem] text-text-muted font-heading">
                  {gh.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: LANG_COLORS[gh.language] || '#ccc' }}
                      />
                      {gh.language}
                    </span>
                  )}
                  {gh.stars > 0 && <span>&#9733; {gh.stars}</span>}
                  {gh.updatedAt && <span>{gh.updatedAt}</span>}
                </div>
              )}

              {/* Expandable detail panel */}
              <div
                className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
                style={{ maxHeight: isOpen ? '300px' : '0px' }}
              >
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
                    View on GitHub &rarr;
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default ProjectsCard;
