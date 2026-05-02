import { useState, useEffect } from 'react';
import MobileDrawer from './MobileDrawer';

export default function Header({
  useDrawerNav = false,
  onSkillsClick,
  onAboutClick,
  onCopyEmail,
  onNavigateProjects,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!useDrawerNav) setDrawerOpen(false);
  }, [useDrawerNav]);

  return (
    <>
      <header
        className={`rounded-card bg-gradient-green shadow-card-inset w-full max-w-[2000px] flex shrink-0 flex-row items-center justify-between ${
          useDrawerNav ? 'min-h-[4.25rem] h-auto px-5 py-3.5' : 'h-20 px-6 xl:px-8'
        }`}
      >
        <div className="flex min-w-0 shrink items-center gap-2 overflow-hidden">
          <h1
            className={`font-heading font-semibold tracking-[-0.7px] whitespace-nowrap shrink-0 ${
              useDrawerNav ? 'text-[clamp(1.45rem,5vw,2.5rem)]' : 'text-[clamp(1.6rem,2.6vw,2.5rem)]'
            }`}
          >
            Charlie Conner
          </h1>
          {!useDrawerNav ? (
            <>
              <span className="max-[1180px]:hidden shrink-0 select-none font-heading text-[2rem] font-[350] tracking-[-1.7px] text-text-muted">
                |
              </span>
              <span className="font-accent max-[1180px]:hidden min-w-0 shrink overflow-hidden text-ellipsis whitespace-nowrap text-[1.8rem] font-medium italic tracking-[-0.7px] text-text-accent">
                Computer Science Student
              </span>
            </>
          ) : null}
        </div>

        {useDrawerNav ? (
          <button
            type="button"
            className="mobile-nav-trigger flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[7px] rounded-2xl border border-white/15 bg-white/[0.04] transition-[background,border-color] duration-200 hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(179,142,57,0.65)]"
            aria-expanded={drawerOpen}
            aria-controls="mobile-site-nav"
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <span
              className={`mobile-nav-trigger-line block h-[2px] w-[1.35rem] rounded-full bg-text-primary transition-transform duration-200 ${drawerOpen ? 'translate-y-[9px] rotate-45' : ''}`}
              aria-hidden="true"
            />
            <span
              className={`mobile-nav-trigger-line block h-[2px] w-[1.35rem] rounded-full bg-text-primary transition-opacity duration-200 ${drawerOpen ? 'opacity-0' : ''}`}
              aria-hidden="true"
            />
            <span
              className={`mobile-nav-trigger-line block h-[2px] w-[1.35rem] rounded-full bg-text-primary transition-transform duration-200 ${drawerOpen ? '-translate-y-[9px] -rotate-45' : ''}`}
              aria-hidden="true"
            />
          </button>
        ) : (
          <nav className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 whitespace-nowrap max-sm:hidden">
            <button type="button" className="nav-button" onClick={onCopyEmail}>
              Contact Me
            </button>
            <span className="font-accent hidden select-none text-[0.9rem] text-text-primary sm:inline">
              ·
            </span>
            <button type="button" className="nav-button" onClick={onSkillsClick}>
              Skills
            </button>
            <span className="font-accent hidden select-none text-[0.9rem] text-text-primary sm:inline">
              ·
            </span>
            <button type="button" className="nav-button" onClick={onAboutClick}>
              About Me
            </button>
          </nav>
        )}
      </header>

      {useDrawerNav ? (
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onAboutClick={onAboutClick}
          onSkillsClick={onSkillsClick}
          onCopyEmail={onCopyEmail}
          onNavigateProjects={onNavigateProjects}
        />
      ) : null}
    </>
  );
}
