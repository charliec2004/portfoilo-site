import { forwardRef } from 'react';
import resumeIcon from '../../assets/icons/resume.svg';
import githubIcon from '../../assets/icons/github.svg';
import linkedinIcon from '../../assets/icons/linkedin.svg';

const SocialLinksCard = forwardRef(function SocialLinksCard({ tiltHandlers = {}, ...props }, ref) {
  return (
    <nav
      ref={ref}
      data-card="social"
      className="rounded-card bg-gradient-green shadow-card-inset w-full shrink-0 min-h-[80px] py-2 flex flex-row justify-center items-center gap-4 overflow-hidden"
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
    >
      <a
        href="/Charles_Conner_Resume.pdf"
        download="Charles_Conner_Resume.pdf"
        rel="noopener"
        className="flex flex-col justify-center items-center p-4 shrink-0 group"
        aria-label="Download resume"
      >
        <img
          src={resumeIcon}
          alt="Resume"
          className="select-none transition-[filter] duration-300 group-hover:brightness-[0.85] group-focus-visible:brightness-[0.85]"
        />
      </a>

      <div
        className="w-[0.94px] h-[46.158px] shrink-0 bg-separator"
        aria-hidden="true"
      />

      <a
        href="https://github.com/charliec2004"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col justify-center items-center p-4 shrink-0 group"
        aria-label="GitHub profile"
      >
        <img
          src={githubIcon}
          alt="GitHub"
          className="select-none transition-[filter] duration-300 group-hover:brightness-[0.85] group-focus-visible:brightness-[0.85]"
        />
      </a>

      <div
        className="w-[0.94px] h-[46.158px] shrink-0 bg-separator"
        aria-hidden="true"
      />

      <a
        href="https://linkedin.com/in/charles-conner04"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col justify-center items-center p-4 shrink-0 group"
        aria-label="LinkedIn profile"
      >
        <img
          src={linkedinIcon}
          alt="LinkedIn"
          className="select-none transition-[filter] duration-300 group-hover:brightness-[0.85] group-focus-visible:brightness-[0.85]"
        />
      </a>
    </nav>
  );
});

export default SocialLinksCard;
