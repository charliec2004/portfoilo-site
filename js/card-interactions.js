/**
 * Card Interactions Module
 * Handles card expansion animations and interactions
 */

// ===========================================
// CONSTANTS AND CONFIGURATION
// ===========================================
const CONFIG = {
  selectors: {
    container: '.layout__left',
    overlay: '.overlay',
    aboutCard: '.card--about',
    skillsCard: '.card--skills',
    headerNav: '.header__nav',
    cloneCard: '.card--clone',
    iconContainer: '.card__icon-container',
    cardText: '.card__text'
  },
  
  classes: {
    clone: 'card--clone',
    overlayActive: 'active'
  },
  
  timing: {
    cardExpansion: 400,
    cardReturn: 300,
    textFade: 200,
    textChangeDelay: 150,
    skillIconDelay: 700,
    skillIconStagger: 80,
    skillIconFade: 250,
    fallbackTimeout: 350
  },
  
  skills: [
    'html.svg', 'css.svg', 'javascript.svg', 'python.svg', 'java.svg',
    'cpp.svg', 'git.svg', 'npm.svg', 'figma.svg'
  ]
};

const ABOUT_TEXT = {
  short: "I like making things that work well and feel good to use.",
  full: "I like making things that work well and feel good to use. I enjoy the process of figuring out how something should work, building it, and seeing people actually use it. I move between design and engineering because both sides shape how ideas become real. I care about clear thinking, solid systems, and details that quietly make a difference. This site is just a place to share what I’m building and learning over time."
};

const INTRO_CONFIG = {
  duration: 1400,
  delay: 550,
  profileIntroDuration: 520,
  profileIntroScale: 0.72,
  profileIntroEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
  profileHold: 0.35,
  initialProfileScale: 0.96,
  initialCardScale: 0.88,
  profilePeakScale: 1.06,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
};

let introPlayed = false;

// ===========================================
// INTRO ANIMATION
// ===========================================
function playIntroAnimation() {
  if (introPlayed) return;
  
  const body = document.body;
  if (!body) {
    introPlayed = true;
    return;
  }
  
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    introPlayed = true;
    body.classList.add('page--intro-complete');
    return;
  }
  
  const cards = Array.from(document.querySelectorAll('.card'));
  const profileCard = cards.find((card) => card.classList.contains('card--profile'));
  
  if (!cards.length || !profileCard) {
    introPlayed = true;
    body.classList.add('page--intro-complete');
    return;
  }

  if (typeof profileCard.animate !== 'function') {
    introPlayed = true;
    body.classList.add('page--intro-complete');
    return;
  }
  
  introPlayed = true;
  body.classList.add('page--intro');
  
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  const states = cards.map((card, index) => {
    const rect = card.getBoundingClientRect();
    const translateX = centerX - (rect.left + rect.width / 2);
    const translateY = centerY - (rect.top + rect.height / 2);
    const isProfile = card === profileCard;
    const startScale = isProfile ? INTRO_CONFIG.initialProfileScale : INTRO_CONFIG.initialCardScale;
    const introScale = isProfile ? INTRO_CONFIG.profileIntroScale : startScale;
    
    return {
      card,
      isProfile,
      startTransform: `translate(${translateX}px, ${translateY}px) scale(${startScale})`,
      introTransform: `translate(${translateX}px, ${translateY}px) scale(${introScale})`,
      peakTransform: `translate(${translateX}px, ${translateY}px) scale(${INTRO_CONFIG.profilePeakScale})`,
      zIndex: isProfile ? cards.length + 5 : cards.length - index
    };
  });
  
  const cleanup = (() => {
    let cleaned = false;
    return () => {
      if (cleaned) return;
      cleaned = true;
      states.forEach(({ card }) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.willChange = '';
        card.style.zIndex = '';
      });
      body.classList.remove('page--intro');
      body.classList.add('page--intro-complete');
    };
  })();
  
  states.forEach(({ card, introTransform, zIndex }) => {
    card.style.transform = introTransform;
    card.style.opacity = '0';
    card.style.willChange = 'transform, opacity';
    card.style.zIndex = String(zIndex);
  });
  
  const profileState = states.find((state) => state.isProfile);
  let profileIntroAnimation = null;
  
  if (profileState) {
    try {
      profileIntroAnimation = profileState.card.animate(
        [
          { transform: profileState.introTransform, opacity: 0 },
          { transform: profileState.startTransform, opacity: 1 }
        ],
        {
          duration: INTRO_CONFIG.profileIntroDuration,
          easing: INTRO_CONFIG.profileIntroEasing,
          fill: 'forwards'
        }
      );
    } catch (error) {
      console.error('Profile intro animation failed:', error);
      profileIntroAnimation = null;
      profileState.card.style.transform = profileState.startTransform;
      profileState.card.style.opacity = '1';
    }
  }
  
  const runMainAnimations = () => {
    if (profileState) {
      profileState.card.style.transform = profileState.startTransform;
      profileState.card.style.opacity = '1';
    }
    
    let animations = [];
    try {
      animations = states.map(({ card, isProfile, startTransform, peakTransform }) => {
        const keyframes = isProfile
          ? [
              { transform: startTransform, opacity: 1 },
              { transform: peakTransform, opacity: 1, offset: INTRO_CONFIG.profileHold },
              { transform: 'translate(0px, 0px) scale(1)', opacity: 1 }
            ]
          : [
              { transform: startTransform, opacity: 0 },
              { transform: startTransform, opacity: 0, offset: INTRO_CONFIG.profileHold },
              { transform: 'translate(0px, 0px) scale(1)', opacity: 1 }
            ];
        
        return card.animate(keyframes, {
          duration: INTRO_CONFIG.duration,
          easing: INTRO_CONFIG.easing,
          delay: INTRO_CONFIG.delay,
          fill: 'forwards'
        });
      });
    } catch (error) {
      console.error('Intro animation failed to start:', error);
      cleanup();
      return;
    }
    
    Promise.all(animations.map((animation) => animation.finished.catch(() => {}))).finally(cleanup);
  };
  
  if (profileIntroAnimation) {
    profileIntroAnimation.finished
      .then(() => runMainAnimations())
      .catch((error) => {
        console.error('Profile intro animation interrupted:', error);
        runMainAnimations();
      });
  } else {
    runMainAnimations();
  }
}

// ===========================================
// STATE MANAGEMENT
// ===========================================
class CardExpansionState {
  constructor() {
    this.isExpanded = false;
    this.originalCardData = null;
    this.currentClone = null;
  }
  
  setExpanded(cardData, clone) {
    this.isExpanded = true;
    this.originalCardData = cardData;
    this.currentClone = clone;
  }
  
  reset() {
    this.isExpanded = false;
    this.originalCardData = null;
    this.currentClone = null;
  }
  
  canExpand() {
    return !this.isExpanded;
  }
}

const expansionState = new CardExpansionState();

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
/**
 * Safely query selector with error handling
 */
function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Query selector failed: ${selector}`, error);
    return null;
  }
}

/**
 * Get element dimensions and position
 */
function getElementRect(element, container) {
  if (!element || !container) return null;
  
  try {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return {
      top: elementRect.top - containerRect.top,
      left: elementRect.left - containerRect.left,
      width: elementRect.width,
      height: elementRect.height
    };
  } catch (error) {
    console.error('Failed to get element rect:', error);
    return null;
  }
}

/**
 * Animate text change with fade effect
 */
function animateTextChange(textElement, newText, duration = CONFIG.timing.textFade) {
  if (!textElement) return Promise.resolve();
  
  return new Promise((resolve) => {
    textElement.style.transition = `opacity ${duration}ms ease`;
    textElement.style.opacity = '0';
    
    setTimeout(() => {
      textElement.textContent = newText;
      textElement.style.opacity = '1';
      resolve();
    }, duration);
  });
}

/**
 * Get the appropriate container for card expansion based on screen size
 */
function getExpansionContainer(targetCard) {
  const isMobile = window.innerWidth <= 770;
  
  if (isMobile) {
    // On mobile, expand within the row container
    const row = targetCard.closest('.layout__row');
    return row || safeQuerySelector(CONFIG.selectors.container);
  } else {
    // On larger screens, use the main left container
    return safeQuerySelector(CONFIG.selectors.container);
  }
}

/**
 * Create and position card clone
 */
function createCardClone(originalCard, container) {
  if (!originalCard) return null;
  
  // Get the appropriate container based on screen size
  const expansionContainer = getExpansionContainer(originalCard);
  if (!expansionContainer) return null;
  
  try {
    const clone = originalCard.cloneNode(true);
    clone.classList.add(CONFIG.classes.clone, 'card--interaction-locked');
    
    const rect = getElementRect(originalCard, expansionContainer);
    if (!rect) return null;
    
    // Set initial position and styling
    Object.assign(clone.style, {
      position: 'absolute',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '999',
      transition: 'top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease'
    });
    
    expansionContainer.appendChild(clone);
    return { clone, originalRect: rect, container: expansionContainer };
    
  } catch (error) {
    console.error('Failed to create card clone:', error);
    return null;
  }
}

// ===========================================
// SKILL ICONS MANAGEMENT
// ===========================================
function populateSkillIcons(clone) {
  const iconContainer = safeQuerySelector(CONFIG.selectors.iconContainer, clone);
  if (!iconContainer || iconContainer.children.length > 0) return;
  
  CONFIG.skills.forEach((filename, index) => {
    try {
      const img = document.createElement('img');
      img.src = `assets/${filename}`;
      img.alt = filename.replace('.svg', '');
      img.classList.add('skill-icon');
      
      // Initial state
      Object.assign(img.style, {
        opacity: '0',
        transform: 'scale(0.5)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
      });
      
      iconContainer.appendChild(img);
      
      // Staggered animation
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, CONFIG.timing.skillIconDelay + index * CONFIG.timing.skillIconStagger);
      
    } catch (error) {
      console.error(`Failed to create skill icon: ${filename}`, error);
    }
  });
}

function fadeOutSkillIcons(clone) {
  const skillIcons = clone.querySelectorAll('.skill-icon');
  if (skillIcons.length === 0) return Promise.resolve();
  
  return new Promise((resolve) => {
    skillIcons.forEach(icon => {
      icon.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      icon.style.opacity = '0';
      icon.style.transform = 'scale(0.5)';
    });
    
    setTimeout(resolve, CONFIG.timing.skillIconFade);
  });
}

// ===========================================
// CARD EXPANSION LOGIC
// ===========================================
function expandCard(clone, overlay, container) {
  if (!clone || !overlay || !container) return;
  
  // Force layout calculation
  clone.getBoundingClientRect();
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        // Expand to fill the appropriate container
        Object.assign(clone.style, {
          top: '0',
          left: '0',
          width: '100%',
          height: '100%'
        });
        
        overlay.classList.add(CONFIG.classes.overlayActive);
        
      } catch (error) {
        console.error('Failed to expand card:', error);
      }
    });
  });
}

function contractCard(clone, originalRect) {
  if (!clone || !originalRect) return Promise.reject('Invalid parameters');
  
  return new Promise((resolve, reject) => {
    try {
      clone.style.transition = 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease';
      clone.offsetHeight; // Force reflow
      
      // Animate back to original position
      Object.assign(clone.style, {
        top: `${originalRect.top}px`,
        left: `${originalRect.left}px`,
        width: `${originalRect.width}px`,
        height: `${originalRect.height}px`
      });
      
      function handleTransitionEnd(event) {
        if (event.target !== clone || event.propertyName !== 'width') return;
        
        cleanup();
        resolve();
      }
      
      function cleanup() {
        clone.removeEventListener('transitionend', handleTransitionEnd);
        clearTimeout(fallbackTimeout);
      }
      
      clone.addEventListener('transitionend', handleTransitionEnd);
      
      // Fallback timeout
      const fallbackTimeout = setTimeout(() => {
        cleanup();
        resolve();
      }, CONFIG.timing.fallbackTimeout);
      
    } catch (error) {
      console.error('Failed to contract card:', error);
      reject(error);
    }
  });
}

// ===========================================
// MAIN EVENT HANDLERS
// ===========================================
function handleCardClick(event) {
  if (!expansionState.canExpand()) return;
  
  const targetCard = event.target.closest(`${CONFIG.selectors.aboutCard}, ${CONFIG.selectors.skillsCard}`);
  if (!targetCard) return;
  
  const overlay = safeQuerySelector(CONFIG.selectors.overlay);
  
  if (!overlay) {
    console.error('Required elements not found');
    return;
  }
  
  const cloneData = createCardClone(targetCard);
  if (!cloneData) return;
  
  const { clone, originalRect, container } = cloneData;
  expansionState.setExpanded({ ...originalRect, card: targetCard, container }, clone);
  targetCard.classList.add('card--interaction-locked');
  
  // Handle different card types
  if (targetCard.classList.contains('card--skills')) {
    populateSkillIcons(clone);
  } else if (targetCard.classList.contains('card--about')) {
    setTimeout(() => {
      const cloneText = safeQuerySelector(CONFIG.selectors.cardText, clone);
      if (cloneText) {
        animateTextChange(cloneText, ABOUT_TEXT.full);
      }
    }, CONFIG.timing.cardExpansion);
  }
  
  expandCard(clone, overlay, container);
}

async function handleOverlayClick(event) {
  if (!expansionState.isExpanded || !expansionState.currentClone) return;
  
  const { currentClone, originalCardData } = expansionState;
  const overlay = safeQuerySelector(CONFIG.selectors.overlay);
  
  if (!overlay) return;
  
  // Hide overlay immediately
  overlay.classList.remove(CONFIG.classes.overlayActive);
  
  try {
    // Handle different card types
    const isSkillsCard = currentClone.classList.contains('card--skills');
    const isAboutCard = currentClone.classList.contains('card--about');
    
    if (isSkillsCard) {
      await fadeOutSkillIcons(currentClone);
    } else if (isAboutCard) {
      const cloneText = safeQuerySelector(CONFIG.selectors.cardText, currentClone);
      if (cloneText) {
        await animateTextChange(cloneText, ABOUT_TEXT.short, CONFIG.timing.textChangeDelay);
      }
    }
    
    // Get fresh measurements for the original card using the stored container
    const originalCard = originalCardData.card;
    const expansionContainer = originalCardData.container || getExpansionContainer(originalCard);
    const freshRect = getElementRect(originalCard, expansionContainer);
    const rectToUse = freshRect || originalCardData;
    
    // Contract the card
    await contractCard(currentClone, rectToUse);
    
    // Cleanup
    if (currentClone && currentClone.parentNode) {
      currentClone.remove();
    }
    
  } catch (error) {
    console.error('Error during card contraction:', error);
    // Force cleanup on error
    if (currentClone && currentClone.parentNode) {
      currentClone.remove();
    }
  } finally {
    const originalCard = originalCardData && originalCardData.card;
    if (originalCard) {
      originalCard.classList.remove('card--interaction-locked');
    }
    expansionState.reset();
  }
}

function handleHeaderButtonClick(event) {
  const button = event.target.closest('.nav__button');
  if (!button) return;
  
  const buttonText = button.textContent.trim().toLowerCase();
  let targetSelector = null;
  
  if (buttonText === 'about me') {
    targetSelector = CONFIG.selectors.aboutCard;
  } else if (buttonText === 'skills') {
    targetSelector = CONFIG.selectors.skillsCard;
  }
  
  if (targetSelector) {
    const targetCard = safeQuerySelector(targetSelector);
    if (targetCard) {
      const syntheticEvent = {
        target: targetCard,
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      handleCardClick(syntheticEvent);
    }
  }
}

// ===========================================
// INITIALIZATION
// ===========================================
function initializeEventListeners() {
  const container = safeQuerySelector(CONFIG.selectors.container);
  const overlay = safeQuerySelector(CONFIG.selectors.overlay);
  const headerNav = safeQuerySelector(CONFIG.selectors.headerNav);
  
  if (container) {
    container.addEventListener('click', handleCardClick);
  } else {
    console.warn('Card container not found');
  }
  
  if (overlay) {
    overlay.addEventListener('click', handleOverlayClick);
  } else {
    console.warn('Overlay element not found');
  }
  
  if (headerNav) {
    headerNav.addEventListener('click', handleHeaderButtonClick);
  } else {
    console.warn('Header navigation not found');
  }
}

// ===========================================
// MODULE INITIALIZATION
// ===========================================
function init() {
  const startListeners = () => initializeEventListeners();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startListeners, { once: true });
  } else {
    startListeners();
  }
  
  const startIntro = () => {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => playIntroAnimation());
    } else {
      playIntroAnimation();
    }
  };
  
  if (document.readyState === 'complete') {
    startIntro();
  } else {
    window.addEventListener('load', startIntro, { once: true });
  }
}

// Start the module
init();
