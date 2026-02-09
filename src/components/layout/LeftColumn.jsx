import { forwardRef } from 'react';
import AboutCard from '../cards/AboutCard';
import SkillsCard from '../cards/SkillsCard';

const LeftColumn = forwardRef(function LeftColumn(
  { topRow, bottomRow, expandedCard, phase, cloneStyle, onCollapse, expansionTiming },
  ref
) {
  // Render the expanded card clone as an absolutely-positioned overlay inside this container
  const renderClone = () => {
    if (!expandedCard || phase === 'idle') return null;

    if (expandedCard === 'about') {
      return (
        <div style={cloneStyle} className="rounded-card overflow-hidden">
          <AboutCard expanded phase={phase} expansionTiming={expansionTiming} />
        </div>
      );
    }

    if (expandedCard === 'skills') {
      return (
        <div style={cloneStyle} className="rounded-card overflow-hidden">
          <SkillsCard expanded phase={phase} expansionTiming={expansionTiming} />
        </div>
      );
    }

    return null;
  };

  return (
    <section
      ref={ref}
      className="flex flex-col gap-4 min-h-0 min-w-0 flex-[2_1_0] justify-between relative max-h-[1000px] max-lg:max-h-none max-lg:flex-auto max-lg:w-full max-lg:justify-start max-lg:min-h-[50vh]"
    >
      <div className="w-full flex gap-4 min-h-0 flex-[11] max-h-[55vh] max-lg:flex-auto max-lg:min-h-fit max-lg:max-h-none max-sm:flex-col max-sm:w-full max-sm:relative">
        {topRow}
      </div>
      <div className="w-full flex gap-4 min-h-0 flex-[9] max-h-[40vh] max-lg:flex-auto max-lg:min-h-fit max-lg:max-h-none max-sm:flex-col max-sm:w-full max-sm:relative">
        {bottomRow}
      </div>
      {renderClone()}
    </section>
  );
});

export default LeftColumn;
