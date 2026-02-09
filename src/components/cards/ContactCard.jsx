import { forwardRef } from 'react';
import contactIcon from '../../assets/icons/contact.svg';

const ContactCard = forwardRef(function ContactCard({ tiltHandlers = {}, onCopyEmail, ...props }, ref) {
  return (
    <article
      ref={ref}
      data-card="contact"
      className="rounded-card bg-gradient-gold shadow-card-inset flex-1 h-full p-8 pb-5 overflow-hidden max-lg:w-full max-lg:flex-auto max-lg:h-auto max-sm:p-6"
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
    >
      <button
        type="button"
        onClick={onCopyEmail}
        className="flex flex-col justify-center items-start w-full h-full transition-[filter] duration-300 hover:brightness-[0.85] text-left bg-transparent border-none p-0"
        aria-label="Copy email to clipboard"
      >
        <header className="w-full flex items-center justify-between mr-4 max-lg:mb-8">
          <p className="text-[0.85rem] font-accent italic text-text-primary select-none">
            Let&apos;s connect
          </p>
          <div className="shrink-0">
            <img src={contactIcon} alt="" className="select-none" />
          </div>
        </header>
        <div className="flex-1 flex flex-col justify-end">
          <h2 className="text-[3.75rem] text-text-primary font-accent font-bold select-none whitespace-nowrap tracking-[-1.2px] max-lg:text-[2.5rem] max-lg:tracking-normal max-sm:text-[3.5rem]">
            Contact me
          </h2>
        </div>
      </button>
    </article>
  );
});

export default ContactCard;
