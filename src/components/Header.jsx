export default function Header({ onSkillsClick, onAboutClick, onCopyEmail }) {
  return (
    <header className="rounded-card bg-gradient-green shadow-card-inset w-full h-20 max-w-[2000px] flex flex-row justify-between items-center px-8 shrink-0">
      <div className="flex items-center gap-2 shrink min-w-0 overflow-hidden">
        <h1 className="text-[2.5rem] font-heading font-semibold tracking-[-0.7px] whitespace-nowrap shrink-0">
          Charlie Conner
        </h1>
        <span className="text-[2rem] text-text-muted font-heading font-[350] tracking-[-1.7px] select-none shrink-0 max-sm:hidden">
          |
        </span>
        <span className="text-text-accent font-accent text-[1.8rem] italic font-medium tracking-[-0.7px] whitespace-nowrap overflow-hidden text-ellipsis shrink min-w-0 max-sm:hidden">
          Computer Science Student
        </span>
      </div>
      <nav className="flex items-center gap-2 shrink-0 whitespace-nowrap max-sm:hidden">
        <button type="button" className="nav-button" onClick={onCopyEmail}>
          Contact Me
        </button>
        <span className="text-text-primary text-[0.9rem] font-accent select-none">·</span>
        <button type="button" className="nav-button" onClick={onSkillsClick}>
          Skills
        </button>
        <span className="text-text-primary text-[0.9rem] font-accent select-none">·</span>
        <button type="button" className="nav-button" onClick={onAboutClick}>
          About Me
        </button>
      </nav>
    </header>
  );
}
