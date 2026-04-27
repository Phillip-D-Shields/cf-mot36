/// <reference lib="webworker" />

// Minimal service worker — required for PWA installability.
// No caching, no offline support. Every request goes straight to the network.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());