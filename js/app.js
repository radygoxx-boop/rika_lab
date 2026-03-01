// =============================================
//  RIKA LAB — App Entry
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  loadState();
  
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  
  // Init home screen
  renderHome();
  
  // Tab navigation
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
  
  // Random nav button (middle special btn)
  document.getElementById('random-nav-btn').addEventListener('click', () => {
    startQuiz(null, null, true);
  });
  
  // Point overlay close
  document.getElementById('point-overlay-close').addEventListener('click', hidePointOverlay);
  
  // Badge unlock overlay close on bg tap
  document.querySelector('#badge-unlock-overlay .overlay-bg').addEventListener('click', hideBadgeUnlock);
  
  // iOS PWA: prevent overscroll bounce on fixed elements
  document.addEventListener('touchmove', e => {
    if (e.target.closest('.screen') === null) e.preventDefault();
  }, { passive: false });
  
  // PWA install prompt (Android)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show a custom install button here
  });
  
  // Prevent context menu on long press
  document.addEventListener('contextmenu', e => e.preventDefault());
});
