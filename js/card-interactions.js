/**
 * Card Interactions Module
 * Handles card expansion animations and interactions
 */

// ===========================================
// CONSTANTS AND CONFIGURATION
// ===========================================
const CONFIG = {
  selectors: {
    container: '.main__left',
    overlay: '.overlay',
    aboutCard: '.card--about',
    skillsCard: '.card--skills',
    headerNav: '.header__nav',
    cloneCard: '.card--clone',
    iconContainer: '.icon--container',
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
  short: "I enjoy creating digital solutions that solve real problems in thoughtful, creative ways through intuitive design and clever engineering...",
  full: "I enjoy creating digital solutions that solve real problems in thoughtful, creative ways through intuitive design and clever engineering. I care about how things work, how they feel, and how they hold up in the real world. I don't box myself into one role. I move across the stack, across disciplines, and across ideas. I focus on clarity over complexity, blending logic with intention to build things that are useful, efficient, and built to last. I pride myself on shipping fast without cutting corners. I work best when I understand the big picture and can still dive deep when needed. I value sharp thinking, honest feedback, and process that gets out of the way. This site is a snapshot of what I'm building and where I'm headed."
};

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
 * Create and position card clone
 */
function createCardClone(originalCard, container) {
  if (!originalCard || !container) return null;
  
  try {
    const clone = originalCard.cloneNode(true);
    clone.classList.add(CONFIG.classes.clone);
    
    const rect = getElementRect(originalCard, container);
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
    
    container.appendChild(clone);
    return { clone, originalRect: rect };
    
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
function expandCard(clone, overlay) {
  if (!clone || !overlay) return;
  
  // Force layout calculation
  clone.getBoundingClientRect();
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        // Expand to fill container
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
  
  const container = safeQuerySelector(CONFIG.selectors.container);
  const overlay = safeQuerySelector(CONFIG.selectors.overlay);
  
  if (!container || !overlay) {
    console.error('Required elements not found');
    return;
  }
  
  const cloneData = createCardClone(targetCard, container);
  if (!cloneData) return;
  
  const { clone, originalRect } = cloneData;
  expansionState.setExpanded({ ...originalRect, card: targetCard }, clone);
  
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
  
  expandCard(clone, overlay);
}

async function handleOverlayClick(event) {
  if (!expansionState.isExpanded || !expansionState.currentClone) return;
  
  const { currentClone, originalCardData } = expansionState;
  const overlay = safeQuerySelector(CONFIG.selectors.overlay);
  const container = safeQuerySelector(CONFIG.selectors.container);
  
  if (!overlay || !container) return;
  
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
    
    // Get fresh measurements for the original card
    const originalCard = originalCardData.card;
    const freshRect = getElementRect(originalCard, container);
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
  } else {
    initializeEventListeners();
  }
}

// Start the module
init();
