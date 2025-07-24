/**
 * Mobile Detection and Redirection Module
 * Handles automatic redirection between mobile and desktop versions
 */

const MOBILE_BREAKPOINT = 1150;
const REDIRECT_DELAY = 10;
const RESIZE_DEBOUNCE = 50;

const CONFIG = {
  mobile: {
    filename: 'mobile.html',
    path: './mobile.html'
  },
  desktop: {
    filename: 'index.html', 
    path: './index.html'
  }
};

/**
 * Determines if current viewport is mobile size
 * @returns {boolean} True if mobile viewport
 */
function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Gets current page information
 * @returns {Object} Page analysis object
 */
function getCurrentPageInfo() {
  const currentPath = window.location.pathname;
  const isOnMobilePage = currentPath.includes(CONFIG.mobile.filename);
  const isOnDesktopPage = currentPath.includes(CONFIG.desktop.filename) || 
                         currentPath === '/' || 
                         currentPath.endsWith('/');
  
  return {
    path: currentPath,
    isOnMobilePage,
    isOnDesktopPage,
    isMobile: isMobileViewport()
  };
}

/**
 * Performs redirect with error handling
 * @param {string} url - Target URL
 * @param {string} reason - Reason for redirect (for logging)
 */
function performRedirect(url, reason) {
  try {
    console.log(`Redirecting: ${reason}`);
    window.location.href = url;
  } catch (error) {
    console.error('Redirect failed:', error);
  }
}

/**
 * Main redirection logic
 */
function checkAndRedirect() {
  try {
    const pageInfo = getCurrentPageInfo();
    
    console.log('Page check:', pageInfo);
    
    // Redirect mobile users to mobile page
    if (pageInfo.isMobile && !pageInfo.isOnMobilePage) {
      performRedirect(CONFIG.mobile.path, 'Mobile user on desktop page');
      return;
    }
    
    // Redirect desktop users to desktop page
    if (!pageInfo.isMobile && pageInfo.isOnMobilePage) {
      performRedirect(CONFIG.desktop.path, 'Desktop user on mobile page');
      return;
    }
    
  } catch (error) {
    console.error('Mobile detection error:', error);
  }
}

/**
 * Debounced resize handler
 */
let resizeTimeoutId;
function handleResize() {
  clearTimeout(resizeTimeoutId);
  resizeTimeoutId = setTimeout(checkAndRedirect, RESIZE_DEBOUNCE);
}

/**
 * Delayed initial check
 */
function delayedInitialCheck() {
  setTimeout(checkAndRedirect, REDIRECT_DELAY);
}

/**
 * Initialize mobile detection
 */
function init() {
  // Initial check with delay
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', delayedInitialCheck);
  } else {
    delayedInitialCheck();
  }
  
  // Resize handler
  window.addEventListener('resize', handleResize, { passive: true });
}

// Start the module
init();