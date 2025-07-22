// cache once
const container = document.querySelector('.main__left')
const overlay   = document.querySelector('.overlay')
let hasExpanded = false

/**
 * Handles click events on the "About Me" and "Skills" cards.
 * Clones the clicked card, positions it over the original,
 * animates it to fill the container, and toggles the overlay.
 */
export function handleCardClick(event) {
  // bail if we've already expanded once
  if (hasExpanded) return

  const card = event.target.closest('.card--about, .card--skills')
  if (!card) return

  // mark as expanded so further clicks do nothing
  hasExpanded = true

  // clone + mark it
  const clone = card.cloneNode(true)
  clone.classList.add('card--clone')

  // measure & set CSS-vars for initial geometry
  const cardRect = card.getBoundingClientRect()
  const contRect = container.getBoundingClientRect()
  Object.assign(clone.style, {
    position: 'absolute',
    top:    `${cardRect.top  - contRect.top}px`,
    left:   `${cardRect.left - contRect.left}px`,
    width:  `${cardRect.width}px`, 
    height: `${cardRect.height}px`,
    zIndex: '999',
    transition: 'top 0.5s ease, left 0.5s ease, width 0.5s ease, height 0.5s ease'
  })

  container.appendChild(clone)

  // ← 1) force a reflow so the browser picks up the initial vars
  clone.getBoundingClientRect()

  // ← 2) wait two animation frames, *then* toggle the expanded class
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      clone.style.top = '0';
      clone.style.left = '0'; 
      clone.style.width = '100%';
      clone.style.height = '100%';
      overlay.classList.add('active');
    })
  })
}

// attach once on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  container?.addEventListener('click', handleCardClick)
})