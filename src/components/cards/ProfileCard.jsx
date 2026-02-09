import { forwardRef } from 'react';
import charlieWebp from '../../assets/images/charlie.webp';

const ProfileCard = forwardRef(function ProfileCard({ tiltHandlers = {}, ...props }, ref) {
  return (
    <aside
      ref={ref}
      data-card="profile"
      className="profile-card rounded-card bg-gradient-gold shadow-card-inset flex-1 min-w-[400px] h-full overflow-hidden flex flex-col justify-end items-center max-lg:min-w-0 max-lg:h-[55vh] max-lg:min-h-[350px] max-lg:flex-auto max-lg:w-auto max-sm:min-w-0 max-sm:w-full max-sm:h-auto max-sm:min-h-[320px]"
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
