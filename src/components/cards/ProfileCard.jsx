import { forwardRef } from 'react';
import charlieWebp from '../../assets/images/charlie.webp';

const ProfileCard = forwardRef(function ProfileCard({ tiltHandlers = {} }, ref) {
  return (
    // Card sizing notes:
    // - Small mobile: `flex-auto h-auto min-h-[320px]` previously let the
    //   column's flex-grow stretch the card past the image's natural
    //   height — the image then sat at the bottom (justify-end) with a
    //   huge gold rectangle above it. `flex-none aspect-[4/5]` gives the
    //   card a fixed shape sized off its width; the image fills it
    //   exactly via `object-cover` + `h-full`.
    // - min-width snaps at xl(1280) via Tailwind classes instead of a
    //   `calc(... * var(--mid-progress))` inline style. Firefox silently
    //   drops length-divided-by-length custom-property substitutions so
    //   the inline calc resolved to 0 in Firefox, squishing the card.
    <aside
      ref={ref}
      data-card="profile"
      className="profile-card rounded-card bg-gradient-gold shadow-card-inset flex-1 h-full overflow-hidden flex flex-col justify-end items-center min-w-[240px] xl:min-w-[400px] max-lg:!min-w-0 max-lg:flex-none max-lg:h-auto max-lg:w-auto max-lg:aspect-[4/5] max-sm:!min-w-0 max-sm:w-full max-sm:aspect-[1/1]"
      onMouseMove={tiltHandlers.onMouseMove}
      onMouseLeave={tiltHandlers.onMouseLeave}
    >
      <img
        src={charlieWebp}
        alt="Charlie Conner portrait"
        className="profile-card__img w-full h-full object-cover select-none rounded-card"
        style={{ maxWidth: '450px' }}
      />
    </aside>
  );
});

export default ProfileCard;
