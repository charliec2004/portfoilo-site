import { useRef, useCallback, useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Overlay from './components/Overlay';
import MainGrid from './components/layout/MainGrid';
import LeftColumn from './components/layout/LeftColumn';
import RightColumn from './components/layout/RightColumn';
import AboutCard from './components/cards/AboutCard';
import ProfileCard from './components/cards/ProfileCard';
import SkillsCard from './components/cards/SkillsCard';
import ContactCard from './components/cards/ContactCard';
import ProjectsCard from './components/cards/ProjectsCard';
import SocialLinksCard from './components/cards/SocialLinksCard';
import FilmGrain from './components/FilmGrain';
import Cursor from './components/Cursor';
import Confetti from './components/Confetti';
import Terminal from './components/Terminal';
import CopyToast from './components/CopyToast';
import useIntroAnimation from './hooks/useIntroAnimation';
import useCardExpansion from './hooks/useCardExpansion';
import useMagneticTilt from './hooks/useMagneticTilt';
import useKonamiCode from './hooks/useKonamiCode';
import useScrollReveal from './hooks/useScrollReveal';
import useMobileExpansion from './hooks/useMobileExpansion';

export default function App() {
  const aboutRef = useRef(null);
  const profileRef = useRef(null);
  const skillsRef = useRef(null);
  const contactRef = useRef(null);
  const projectsRef = useRef(null);
  const socialRef = useRef(null);
  const leftColRef = useRef(null);

  const cardRefs = [aboutRef, profileRef, skillsRef, contactRef, projectsRef, socialRef];
  useIntroAnimation(cardRefs);

  const { expandedCard, phase, expand, collapse, getCloneStyle, isExpanded, TIMING } =
    useCardExpansion();

  const tilt = useMagneticTilt({ disabled: isExpanded });
  const konamiActivated = useKonamiCode();
  useScrollReveal(cardRefs);
  const { isMobile, mobileExpandedCard, toggleMobile } = useMobileExpansion();

  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copyToastKey, setCopyToastKey] = useState(0);

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('charlieconner04@gmail.com');
    } catch {
      const el = document.createElement('textarea');
      el.value = 'charlieconner04@gmail.com';
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopyToastKey((k) => k + 1);
    setShowCopyToast(true);
  }, []);

  const handleCopyToastClose = useCallback(() => {
    setShowCopyToast(false);
  }, []);

  const handleAboutClick = useCallback(() => {
    if (isMobile) {
      toggleMobile('about');
    } else if (aboutRef.current && leftColRef.current) {
      expand('about', aboutRef.current, leftColRef.current);
    }
  }, [isMobile, toggleMobile, expand]);

  const handleSkillsClick = useCallback(() => {
    if (isMobile) {
      toggleMobile('skills');
    } else if (skillsRef.current && leftColRef.current) {
      expand('skills', skillsRef.current, leftColRef.current);
    }
  }, [isMobile, toggleMobile, expand]);

  const handleOverlayClick = useCallback(() => {
    collapse();
  }, [collapse]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) collapse();
        if (mobileExpandedCard) toggleMobile(mobileExpandedCard);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isExpanded, collapse, mobileExpandedCard, toggleMobile]);

  return (
    <div className="bg-gradient-page h-screen flex flex-col items-center gap-4 p-4 text-text-primary overflow-hidden max-lg:h-auto max-lg:min-h-screen max-lg:overflow-visible">
      <Header onSkillsClick={handleSkillsClick} onAboutClick={handleAboutClick} onCopyEmail={handleCopyEmail} />
      <Overlay active={isExpanded && phase !== 'collapsing' && phase !== 'contracting'} onClick={handleOverlayClick} />
      <MainGrid>
        <LeftColumn
          ref={leftColRef}
          expandedCard={expandedCard}
          phase={phase}
          cloneStyle={getCloneStyle()}
          onCollapse={collapse}
          expansionTiming={TIMING}
          topRow={
            <>
              <AboutCard ref={aboutRef} onClick={handleAboutClick} tiltHandlers={tilt} mobileExpanded={mobileExpandedCard === 'about'} />
              <ProfileCard ref={profileRef} tiltHandlers={tilt} />
            </>
          }
          bottomRow={
            <>
              <SkillsCard ref={skillsRef} onClick={handleSkillsClick} tiltHandlers={tilt} mobileExpanded={mobileExpandedCard === 'skills'} />
              <ContactCard ref={contactRef} tiltHandlers={tilt} onCopyEmail={handleCopyEmail} />
            </>
          }
        />
        <RightColumn>
          <ProjectsCard ref={projectsRef} tiltHandlers={tilt} />
          <SocialLinksCard ref={socialRef} tiltHandlers={tilt} />
        </RightColumn>
      </MainGrid>
      <Footer />
      <FilmGrain />
      <Cursor />
      {konamiActivated && <Confetti />}
      <Terminal />
      {showCopyToast && <CopyToast key={copyToastKey} onClose={handleCopyToastClose} />}
    </div>
  );
}
