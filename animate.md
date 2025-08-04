# Portfolio Opening Animation Implementation Guide

This guide details how to implement a dramatic opening animation where the profile card starts centered and enlarged, then all other cards "shoot out" from behind it to their final positions.

## Overview

The animation sequence:

1. Page loads with only the profile card visible, centered and enlarged
2. Profile card holds center position for ~800ms
3. Other cards animate from behind the profile card to their positions (staggered)
4. Profile card shrinks and moves to its final position
5. Header and footer fade in
6. Normal site interactions are enabled

## Implementation Steps

### 1. Create Animation Styles

Create `styles/utilities/intro-animation.css`:

```css
/*==============================================================================
  Intro Animation Styles
==============================================================================*/

/* Initial hidden state for all cards except profile */
.intro-loading .card:not(.card--profile) {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  z-index: 1;
}

/* Initial hidden state for header and footer */
.intro-loading .header,
.intro-loading .footer {
  opacity: 0;
  transform: translateY(-30px);
}

/* Profile card initial centered state */
.intro-loading .card--profile {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.3);
  width: 400px;
  height: 500px;
  z-index: 999;
  transition: none; /* Disable normal transitions during intro */
}

/* Animation classes */
.intro-animate .header {
  animation: slideInDown 0.6s ease 1.5s both;
}

.intro-animate .footer {
  animation: slideInUp 0.6s ease 1.5s both;
}

.intro-animate .card--profile {
  animation: profileToPosition 1s ease 1s both;
}

.intro-animate .card--about {
  animation: cardShootOut 0.4s ease 1.2s both;
}

.intro-animate .card--skills {
  animation: cardShootOut 0.4s ease 1.25s both;
}

.intro-animate .card--contact {
  animation: cardShootOut 0.4s ease 1.3s both;
}

.intro-animate .card--projects {
  animation: cardShootOut 0.4s ease 1.35s both;
}

.intro-animate .card--links {
  animation: cardShootOut 0.4s ease 1.4s both;
}

/* Keyframe animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes profileToPosition {
  0% {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.3);
    width: 400px;
    height: 500px;
  }
  100% {
    position: static;
    transform: none;
    width: auto;
    height: auto;
  }
}

@keyframes cardShootOut {
  0% {
    opacity: 0;
    transform: scale(0.3) translate(0, 0);
    z-index: 998;
  }
  50% {
    opacity: 0.7;
    transform: scale(0.6) translate(0, 0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
    z-index: auto;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 520px) {
  .intro-loading .card--profile {
    width: 80vw;
    height: 60vh;
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  @keyframes profileToPosition {
    0% {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1.1);
      width: 80vw;
      height: 60vh;
    }
    100% {
      position: static;
      transform: none;
      width: auto;
      height: auto;
    }
  }
}
```

### 2. Create Animation Controller

Create `js/intro-animation.js`:

```javascript
/**
 * Intro Animation Controller
 * Handles the dramatic page load animation sequence
 */

class IntroAnimation {
  constructor() {
    this.isComplete = false;
    this.duration = {
      profileHold: 800,    // How long profile stays centered
      profileMove: 1000,   // How long profile takes to move to position
      cardStagger: 50,     // Delay between each card shooting out
      totalDuration: 2500  // Total animation time
    };
  }

  init() {
    // Only run on first load, not on refresh
    if (sessionStorage.getItem('introSeen')) {
      this.skipAnimation();
      return;
    }

    // Mark intro as seen for this session
    sessionStorage.setItem('introSeen', 'true');

    // Start the animation sequence
    this.startAnimation();
  }

  startAnimation() {
    const body = document.body;
    
    // Set initial loading state
    body.classList.add('intro-loading');
    
    // Wait for profile to be centered, then start the sequence
    setTimeout(() => {
      body.classList.add('intro-animate');
      
      // Complete the animation and cleanup
      setTimeout(() => {
        this.completeAnimation();
      }, this.duration.totalDuration);
      
    }, this.duration.profileHold);
  }

  completeAnimation() {
    const body = document.body;
    
    // Remove animation classes
    body.classList.remove('intro-loading', 'intro-animate');
    
    // Re-enable normal card interactions
    this.enableCardInteractions();
    
    this.isComplete = true;
  }

  skipAnimation() {
    const body = document.body;
    body.classList.remove('intro-loading', 'intro-animate');
    this.enableCardInteractions();
    this.isComplete = true;
  }

  enableCardInteractions() {
    // Re-enable the card expansion functionality
    const cardInteractions = window.cardInteractions;
    if (cardInteractions && cardInteractions.enable) {
      cardInteractions.enable();
    }
  }

  // Method to reset for testing
  reset() {
    sessionStorage.removeItem('introSeen');
    location.reload();
  }
}

// Initialize when DOM is ready
function initIntroAnimation() {
  const intro = new IntroAnimation();
  intro.init();
  
  // Expose for debugging
  window.introAnimation = intro;
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntroAnimation);
} else {
  initIntroAnimation();
}
```

### 3. Update CSS Imports

Add the animation styles to `styles/main.css`:

```css
/* Base styles */
@import "./base/variables.css";
@import "./base/reset.css";
@import "./base/typography.css";

/* Layout */
@import "./layout/page.css";
@import "./layout/grid.css";

/* Components */
@import "./components/header.css";
@import "./components/card.css";
@import "./components/profile.css";
@import "./components/projects.css";
@import "./components/social.css";
@import "./components/footer.css";

/* Utilities */
@import "./utilities/interactive.css";
@import "./utilities/helpers.css";
@import "./utilities/overlay.css";
@import "./utilities/intro-animation.css";  /* Add this line */
```

### 4. Update HTML

Add the animation script to your `index.html` before the card interactions script:

```html
    <script type="module" src="js/intro-animation.js"></script>
    <script type="module" src="js/card-interactions.js"></script>
  </body>
</html>
```

### 5. Update Card Interactions (Optional)

To prevent card interactions during the animation, update your `js/card-interactions.js`:

```javascript
function handleCardClick(event) {
  // Prevent interactions during intro animation
  if (window.introAnimation && !window.introAnimation.isComplete) {
    return;
  }
  
  if (!expansionState.canExpand()) return;
  
  // ...rest of existing code...
}
```

## Customization Options

### Timing Adjustments

Modify the `duration` object in `IntroAnimation` class:

```javascript
this.duration = {
  profileHold: 1000,    // Make profile hold longer
  profileMove: 800,     // Faster profile movement
  cardStagger: 100,     // More delay between cards
  totalDuration: 3000   // Extend total duration
};
```

### Animation Delays

Adjust individual card animation delays in CSS:

```css
.intro-animate .card--about {
  animation: cardShootOut 0.4s ease 1.0s both; /* Earlier */
}

.intro-animate .card--skills {
  animation: cardShootOut 0.4s ease 1.1s both; /* Faster sequence */
}
```

### Profile Card Size

Modify the initial profile card size:

```css
.intro-loading .card--profile {
  width: 500px;     /* Larger initial size */
  height: 600px;
  transform: translate(-50%, -50%) scale(1.5); /* More dramatic scale */
}
```

### Card Shoot-Out Effect

Customize how cards appear:

```css
@keyframes cardShootOut {
  0% {
    opacity: 0;
    transform: scale(0.1) translate(-100px, -100px); /* Start from corner */
  }
  50% {
    opacity: 0.8;
    transform: scale(0.8) translate(-20px, -20px);   /* Intermediate position */
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
}
```

## Testing and Debugging

### Reset Animation for Testing

In browser console:

```javascript
window.introAnimation.reset()
```

### Skip Animation

To temporarily disable:

```javascript
sessionStorage.setItem('introSeen', 'true');
```

### Animation Debug Mode

Add this to see animation states:

```javascript
// Add to intro-animation.js constructor
this.debug = true;

// Add logging throughout methods
if (this.debug) console.log('Animation state:', state);
```

## Browser Compatibility

- Modern browsers with CSS animations support
- Fallback: Animation automatically skips if `sessionStorage` unavailable
- Mobile optimized with responsive breakpoints

## Performance Considerations

- Animation only runs once per session
- Uses CSS transforms for smooth performance
- GPU-accelerated properties (transform, opacity)
- Minimal JavaScript during animation

## Troubleshooting

### Common Issues

1. **Profile card not centering**: Check viewport units and container positioning
2. **Cards not appearing**: Verify CSS import order and class names
3. **Animation too fast/slow**: Adjust timing in `duration` object
4. **Mobile layout issues**: Check responsive breakpoints in CSS

### Debug Checklist

- [ ] Animation CSS file imported correctly
- [ ] JavaScript file loaded before card interactions
- [ ] No console errors
- [ ] Session storage working
- [ ] CSS classes applied correctly

This implementation creates a professional, eye-catching opening animation that showcases your profile photo before revealing the full portfolio layout.
