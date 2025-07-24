// ======================================
// INITIALIZATION
// ======================================
// Cache DOM elements for better performance 
const container = document.querySelector('.main__left')  // Container that holds the cards
const overlay   = document.querySelector('.overlay')     // Overlay element for dimming background
let hasExpanded = false                                 // Flag to prevent multiple cards expanding at once
let originalCardRect = null                            // Store original card dimensions for reversal

// Text content for About Me card
const aboutTexts = {
  original: "I enjoy creating digital solutions that solve real problems in thoughtful, creative ways through intuitive design and clever engineering...",
  expanded: "I enjoy creating digital solutions that solve real problems in thoughtful, creative ways through intuitive design and clever engineering. I care about how things work, how they feel, and how they hold up in the real world. I don’t box myself into one role. I move across the stack, across disciplines, and across ideas. I focus on clarity over complexity, blending logic with intention to build things that are useful, efficient, and built to last. I pride myself on shipping fast without cutting corners. I work best when I understand the big picture and can still dive deep when needed. I value sharp thinking, honest feedback, and process that gets out of the way. This site is a snapshot of what I’m building and where I’m headed."
}

/**
 * Animates text change with fade out/in effect
 * @param {HTMLElement} textElement - The text element to animate
 * @param {string} newText - The new text content
 * @param {number} duration - Animation duration in ms (default: 200)
 */
function animateTextChange(textElement, newText, duration = 200) {
  // Fade out
  textElement.style.transition = `opacity ${duration}ms ease`
  textElement.style.opacity = '0'
  
  // Change text and fade in
  setTimeout(() => {
    textElement.textContent = newText
    textElement.style.opacity = '1'
  }, duration)
}

/**
 * Handles click events on the "About Me" and "Skills" cards.
 * Clones the clicked card, positions it over the original,
 * animates it to fill the container, and toggles the overlay.
 * 
 * @param {Event} event - The click event object
 */
export function handleCardClick(event) {
  // Safety check: exit if a card is already expanded
  if (hasExpanded) return

  // Find if user clicked on an about/skills card (or child element)
  const card = event.target.closest('.card--about, .card--skills')
  if (!card) return  // Exit if click wasn't on a target card

  // Lock the expansion state to prevent multiple expansions
  hasExpanded = true

  // Create an exact copy of the clicked card
  const clone = card.cloneNode(true)
  clone.classList.add('card--clone')

  // Get precise measurements for the animation start/end positions
  const cardRect = card.getBoundingClientRect()
  const contRect = container.getBoundingClientRect()
  
  // Store original measurements for reversal animation
  originalCardRect = {
    top: cardRect.top - contRect.top,
    left: cardRect.left - contRect.left,
    width: cardRect.width,
    height: cardRect.height,
    card: card
  }
  
  // Position the clone exactly over the original card with inline styles
  Object.assign(clone.style, {
    position: 'absolute',
    top:    `${originalCardRect.top}px`,
    left:   `${originalCardRect.left}px`,
    width:  `${originalCardRect.width}px`,
    height: `${originalCardRect.height}px`,
    zIndex: '999',
    transition: 'top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease'
  })

  // Add clone to the container
  container.appendChild(clone)

  // Handle special card content based on type
  if (card.classList.contains('card--skills')) {
    populateSkillIcons(clone)
  } else if (card.classList.contains('card--about')) {
    // Change text in the cloned About Me card after expansion starts
    setTimeout(() => {
      const cloneText = clone.querySelector('.card__text')
      if (cloneText) {
        animateTextChange(cloneText, aboutTexts.expanded, 200)
      }
    }, 400) // Start text change after card expansion begins
  }

  // Force layout and then expand with proper timing
  clone.getBoundingClientRect()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Set the final expanded position (filling the container)
      clone.style.top = '0';
      clone.style.left = '0'; 
      clone.style.width = '100%';
      clone.style.height = '100%';
      overlay.classList.add('active');  // Show the dimming overlay
    })
  })
}

/**
 * Reverses the card animation when the overlay is clicked
 * 
 * @param {Event} event - The click event object
 */
function handleOverlayClick(event) {
  // Only proceed if we have an expanded card
  if (!hasExpanded || !originalCardRect) return
  
  // Find the clone we need to animate back
  const clone = container.querySelector('.card--clone')
  if (!clone) return
  
  // Get fresh measurements of the original card (in case of resize)
  const card = originalCardRect.card
  const freshCardRect = card.getBoundingClientRect()
  const contRect = container.getBoundingClientRect()
  
  // Remove the active class from overlay to hide it
  overlay.classList.remove('active')
  
  // Handle different card types before animating back
  const skillIcons = clone.querySelectorAll('.skill-icon')
  const isAboutCard = clone.classList.contains('card--about')
  
  // Change About Me text back to original immediately
  if (isAboutCard) {
    const cloneText = clone.querySelector('.card__text')
    if (cloneText) {
      animateTextChange(cloneText, aboutTexts.original, 150)
    }
  }
  
  if (skillIcons.length > 0) {
    // Quickly fade out all skill icons
    skillIcons.forEach(icon => {
      icon.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
      icon.style.opacity = '0'
      icon.style.transform = 'scale(0.5)'
    })
    
    // Wait for icons to fade out, then animate the card back
    setTimeout(() => {
      animateCardBack()
    }, 250) // Slightly longer than icon fade for clean transition
  } else {
    // No icons, animate back immediately (or after text change for About card)
    const delay = isAboutCard ? 150 : 0 // Wait for text change if About card
    setTimeout(() => {
      animateCardBack()
    }, delay)
  }
  
  function animateCardBack() {
    // Ensure the clone has the proper transition for the card animation
    clone.style.transition = 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease'
    
    // Force a reflow to ensure the transition is applied
    clone.offsetHeight
    
    // Animate the clone back to original position and size
    clone.style.top = `${freshCardRect.top - contRect.top}px`
    clone.style.left = `${freshCardRect.left - contRect.left}px`
    clone.style.width = `${freshCardRect.width}px`
    clone.style.height = `${freshCardRect.height}px`
    
    // Use a single transitionend listener with proper cleanup
    function handleTransitionEnd(e) {
      // Only respond to the clone's transitions, and specifically width (last to complete)
      if (e.target !== clone || e.propertyName !== 'width') return
      
      clone.removeEventListener('transitionend', handleTransitionEnd)
      
      // Remove the clone and reset state
      if (clone && clone.parentNode) {
        clone.remove()
      }
      hasExpanded = false
      originalCardRect = null
    }
    
    clone.addEventListener('transitionend', handleTransitionEnd)
    
    // Fallback timeout in case transitionend doesn't fire
    setTimeout(() => {
      clone.removeEventListener('transitionend', handleTransitionEnd)
      if (clone && clone.parentNode) {
        clone.remove()
      }
      hasExpanded = false
      originalCardRect = null
    }, 350) // Slightly longer than transition duration as fallback
  }
}

/**
 * Inserts a row of SVG icons into the .icon--container of the cloned Skills card
 * and animates them in one by one.
 */
function populateSkillIcons(clone) {
  const iconContainer = clone.querySelector('.icon--container');
  if (!iconContainer) return;
  
  // Don't populate if icons already exist
  if (iconContainer.children.length > 0) return;

  const svgs = [
    'html.svg', 'css.svg', 'javascript.svg', 'python.svg', 'java.svg',
    'cpp.svg', 'git.svg', 'npm.svg', 'figma.svg'
  ];

  svgs.forEach((file, i) => {
    const img = document.createElement('img');
    img.src = `assets/${file}`;
    img.alt = file.replace('.svg', '');
    img.classList.add('skill-icon');

    // start small/faded
    img.style.opacity   = '0';
    img.style.transform = 'scale(0.5)';
    img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    // append into the .icon--container
    iconContainer.appendChild(img);

    // stagger the fade/scale–up with better timing
    setTimeout(() => {
      img.style.opacity   = '1';
      img.style.transform = 'scale(1)';
    }, 700 + i * 80); // Start after card expansion, with tighter stagger
  });
}

/**
 * Handles clicks on header navigation buttons to trigger card expansions
 * 
 * @param {Event} event - The click event object
 */
function handleHeaderButtonClick(event) {
  const button = event.target.closest('.nav__button')
  if (!button) return
  
  const buttonText = button.textContent.trim().toLowerCase()
  let targetCard = null
  
  // Find the corresponding card based on button text
  if (buttonText === 'about me') {
    targetCard = document.querySelector('.card--about')
  } else if (buttonText === 'skills') {
    targetCard = document.querySelector('.card--skills')
  }
  
  // If we found a matching card, simulate a click on it
  if (targetCard) {
    // Create a synthetic click event on the target card
    const syntheticEvent = {
      target: targetCard,
      preventDefault: () => {},
      stopPropagation: () => {}
    }
    
    // Call the existing handleCardClick function
    handleCardClick(syntheticEvent)
  }
}

// ======================================
// EVENT BINDING
// ======================================
// Wait until DOM is fully loaded before attaching event listeners
window.addEventListener('DOMContentLoaded', () => {
  container?.addEventListener('click', handleCardClick)  // Listen for clicks on the container
  overlay?.addEventListener('click', handleOverlayClick) // Listen for clicks on the overlay
  
  // Add event listener for header navigation buttons
  const headerNav = document.querySelector('.header__nav')
  headerNav?.addEventListener('click', handleHeaderButtonClick)
})