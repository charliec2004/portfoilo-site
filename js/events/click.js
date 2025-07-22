// ======================================
// INITIALIZATION
// ======================================
// Cache DOM elements for better performance 
const container = document.querySelector('.main__left')  // Container that holds the cards
const overlay   = document.querySelector('.overlay')     // Overlay element for dimming background
let hasExpanded = false                                 // Flag to prevent multiple cards expanding at once
let originalCardRect = null                            // Store original card dimensions for reversal

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

  // ======================================
  // CLONE CREATION
  // ======================================
  // Create an exact copy of the clicked card
  const clone = card.cloneNode(true)
  clone.classList.add('card--clone')  // Mark it with special class for styling

  // ======================================
  // POSITIONING SETUP
  // ======================================
  // Get precise measurements for the animation start/end positions
  const cardRect = card.getBoundingClientRect()  // Original card's size/position
  const contRect = container.getBoundingClientRect()  // Container's size/position
  
  // Store original measurements for reversal animation
  originalCardRect = {
    top: cardRect.top - contRect.top,
    left: cardRect.left - contRect.left,
    width: cardRect.width,
    height: cardRect.height,
    card: card  // Reference to original card for future measurements
  }
  
  // Position the clone exactly over the original card with inline styles
  Object.assign(clone.style, {
    position: 'absolute',  // Take it out of normal document flow
    top:    `${originalCardRect.top}px`,  // Position relative to container
    left:   `${originalCardRect.left}px`,
    width:  `${originalCardRect.width}px`,  // Match original dimensions
    height: `${originalCardRect.height}px`,
    zIndex: '999',  // Ensure it appears above everything else
    transition: 'top 0.5s ease, left 0.5s ease, width 0.5s ease, height 0.5s ease'  // Smooth animation
  })

  // Add clone to the container
  container.appendChild(clone)

  // Force layout recalculation so browser recognizes starting position
  clone.getBoundingClientRect()

  // ======================================
  // ANIMATION SEQUENCE
  // ======================================
  // Wait for two animation frames to ensure initial styling is applied
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
  
  // Animate the clone back to original position and size
  clone.style.top = `${freshCardRect.top - contRect.top}px`
  clone.style.left = `${freshCardRect.left - contRect.left}px`
  clone.style.width = `${freshCardRect.width}px`
  clone.style.height = `${freshCardRect.height}px`
  
  // Wait for animation to complete, then remove the clone
  clone.addEventListener('transitionend', function onTransitionEnd(e) {
    // Don't filter by property name - any completed transition is fine
    
    // Make sure we only run this cleanup once
    clone.removeEventListener('transitionend', onTransitionEnd)
    
    // Remove the clone and reset state
    clone.remove()
    hasExpanded = false
    originalCardRect = null
  }, { once: true })  // <-- 'once: true' is good but belt-and-suspenders with removeEventListener
}

// ======================================
// EVENT BINDING
// ======================================
// Wait until DOM is fully loaded before attaching event listeners
window.addEventListener('DOMContentLoaded', () => {
  container?.addEventListener('click', handleCardClick)  // Listen for clicks on the container
  overlay?.addEventListener('click', handleOverlayClick) // Listen for clicks on the overlay
})