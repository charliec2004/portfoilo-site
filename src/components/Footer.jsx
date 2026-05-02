export default function Footer() {
  return (
    <footer className="w-full shrink-0 text-center text-text-primary text-[0.5rem] font-sans">
      © 2025 Charles Conner. All rights reserved.
      {/* Terminal hotkey hint is desktop-only — there's no backtick key on
          a touch keyboard and the terminal feature isn't wired up for tap. */}
      <span className="text-text-muted ml-2 max-lg:hidden">press <kbd className="font-mono">`</kbd> to open terminal</span>
    </footer>
  );
}
