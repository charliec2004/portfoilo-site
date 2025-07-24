function checkMobileAndRedirect() {
  const isMobile = window.innerWidth <= 1150;
  const currentPage = window.location.pathname;
  const isOnMobilePage = currentPage.includes('mobile.html') || currentPage.endsWith('mobile.html');
  const isOnIndexPage = currentPage.includes('index.html') || currentPage.endsWith('index.html') || currentPage === '/' || currentPage.endsWith('/');
  
  console.log('Mobile check:', { isMobile, currentPage, isOnMobilePage, isOnIndexPage }); // Debug log
  
  if (isMobile && !isOnMobilePage) {
    console.log('Redirecting to mobile...'); // Debug log
    window.location.href = './mobile.html';
  } else if (!isMobile && isOnMobilePage) {
    console.log('Redirecting to desktop...'); // Debug log
    window.location.href = './index.html';
  }
}

// Check on page load with minimal delay
function delayedCheck() {
  setTimeout(checkMobileAndRedirect, 10);
}

// Check on page load
window.addEventListener('DOMContentLoaded', delayedCheck);

// Much faster resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(checkMobileAndRedirect, 50); // Reduced from 250ms to 50ms
});