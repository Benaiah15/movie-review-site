// A basic Service Worker to satisfy PWA installation requirements
self.addEventListener('install', (event) => {
  console.log('[MovieSpace PWA] Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle all network requests normally
});