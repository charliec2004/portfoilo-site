import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
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
import useReducedMotion from './hooks/useReducedMotion';
import {
  PAGE_TOOLTIP_GATE_DESKTOP_MS,
  PAGE_TOOLTIP_GATE_MOBILE_MS,
} from './constants/tooltipTiming';

export default function App() {
  const aboutRef = useRef(null);
  const profileRef = useRef(null);
  const skillsRef = useRef(null);
  const contactRef = useRef(null);
  const projectsRef = useRef(null);
  const socialRef = useRef(null);
  const leftColRef = useRef(null);

  const cardRefs = useMemo(
    () => [aboutRef, profileRef, skillsRef, contactRef, projectsRef, socialRef],
    []
  );
  useIntroAnimation(cardRefs);

  const { expandedCard, phase, expand, collapse, getCloneStyle, isExpanded, TIMING } =
    useCardExpansion();

  const tilt = useMagneticTilt();
  const konamiActivated = useKonamiCode();
  useScrollReveal(cardRefs);
  const { isMobile, mobileExpandedCard, toggleMobile } = useMobileExpansion();
  const reducedMotion = useReducedMotion();
  const tooltipGateMs = isMobile ? PAGE_TOOLTIP_GATE_MOBILE_MS : PAGE_TOOLTIP_GATE_DESKTOP_MS;
  const [tooltipPageReady, setTooltipPageReady] = useState(() => reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setTooltipPageReady(true);
      return;
    }
    setTooltipPageReady(false);
    const id = window.setTimeout(() => setTooltipPageReady(true), tooltipGateMs);
    return () => window.clearTimeout(id);
  }, [reducedMotion, tooltipGateMs]);

  const scrollToSection = useCallback(
    (sectionRef) => {
      if (!sectionRef?.current) return;
      sectionRef.current.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [reducedMotion]
  );

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
    <div className="bg-gradient-page text-text-primary flex h-screen max-lg:h-auto max-lg:min-h-screen flex-col items-center gap-4 overflow-hidden p-4 max-lg:gap-5 max-lg:overflow-visible max-lg:p-5">
      <Header
        useDrawerNav={isMobile}
        onSkillsClick={handleSkillsClick}
        onAboutClick={handleAboutClick}
        onCopyEmail={handleCopyEmail}
        onNavigateProjects={() => scrollToSection(projectsRef)}
      />
      <Overlay active={isExpanded && phase !== 'collapsing' && phase !== 'contracting'} onClick={handleOverlayClick} />

      {isMobile ? (
        <div className="flex flex-col gap-4 w-full flex-1">
          <div className="flex gap-4 max-sm:flex-col">
            <AboutCard ref={aboutRef} onClick={handleAboutClick} mobileExpanded={mobileExpandedCard === 'about'} />
            <ProfileCard ref={profileRef} />
          </div>
          <ProjectsCard ref={projectsRef} />
          <SkillsCard ref={skillsRef} isMobile tooltipPageReady={tooltipPageReady} />
          <ContactCard ref={contactRef} onCopyEmail={handleCopyEmail} />
          <SocialLinksCard ref={socialRef} tooltipPageReady={tooltipPageReady} />
        </div>
      ) : (
        <MainGrid>
          <LeftColumn
            ref={leftColRef}
            expandedCard={expandedCard}
            phase={phase}
            cloneStyle={getCloneStyle()}
            onCollapse={collapse}
            expansionTiming={TIMING}
            tiltHandlers={tilt}
            tooltipPageReady={tooltipPageReady}
            topRow={
              <>
                <AboutCard ref={aboutRef} onClick={handleAboutClick} expanded={expandedCard === 'about'} phase={phase} expansionTiming={TIMING} tiltHandlers={tilt} />
                <ProfileCard ref={profileRef} tiltHandlers={tilt} />
              </>
            }
            bottomRow={
              <>
                <SkillsCard
                  ref={skillsRef}
                  onClick={handleSkillsClick}
                  expanded={expandedCard === 'skills'}
                  phase={phase}
                  expansionTiming={TIMING}
                  tiltHandlers={tilt}
                  tooltipPageReady={tooltipPageReady}
                  slotHidden={expandedCard === 'skills' && phase !== 'idle'}
                />
                <ContactCard ref={contactRef} tiltHandlers={tilt} onCopyEmail={handleCopyEmail} />
              </>
            }
          />
          <RightColumn>
            <ProjectsCard ref={projectsRef} tiltHandlers={tilt} />
            <SocialLinksCard ref={socialRef} tiltHandlers={tilt} tooltipPageReady={tooltipPageReady} />
          </RightColumn>
        </MainGrid>
      )}

      <Footer />
      <FilmGrain />
      <Cursor />
      {konamiActivated && <Confetti />}
      <Terminal />
      {showCopyToast && <CopyToast key={copyToastKey} onClose={handleCopyToastClose} />}
    </div>
  );
}
