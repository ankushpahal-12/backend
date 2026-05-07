/**
 * Service Worker
 * Manages offline caching and integrity checking
 */

const CACHE_NAME = 'expense-tracker-v1';
const CACHE_WHITELIST = [
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/security.js',
  '/advanced-protection.js',
  '/zero-trust-client.js',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(CACHE_WHITELIST);
    })
  );

  // Force new version to become active
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages
  self.clients.claim();
});

/**
 * Fetch event - cache static assets, network for API
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (response.status >= 400) {
            return response;
          }

          // Clone response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first
  if (CACHE_WHITELIST.some((path) => url.pathname === path || url.pathname.endsWith(path))) {
    event.respondWith(
      caches
        .match(request)
        .then((response) => {
          if (response) {
            // Validate integrity if available
            return validateIntegrity(response, request).then((valid) => {
              return valid ? response : fetch(request);
            });
          }

          // Not in cache, fetch and cache
          return fetch(request)
            .then((response) => {
              if (response.status >= 400) {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });

              return response;
            });
        })
        .catch(() => {
          // Return offline page if asset not found
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => caches.match(request))
  );
});

/**
 * Validate response integrity using ETag
 */
async function validateIntegrity(response, request) {
  try {
    const etag = response.headers.get('etag');
    const storedEtag = await getStoredETag(request.url);

    if (etag && storedEtag && etag !== storedEtag) {
      console.warn(`[SW] Integrity check failed for ${request.url}`);
      return false;
    }

    // Store current ETag
    if (etag) {
      await storeETag(request.url, etag);
    }

    return true;
  } catch (error) {
    console.error('[SW] Integrity validation error:', error);
    return true; // Allow on error
  }
}

/**
 * Store ETag in IndexedDB
 */
async function storeETag(url, etag) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ServiceWorkerDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('etags', 'readwrite');
      const store = tx.objectStore('etags');

      store.put({ url, etag, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('etags')) {
        db.createObjectStore('etags', { keyPath: 'url' });
      }
    };
  });
}

/**
 * Get stored ETag from IndexedDB
 */
async function getStoredETag(url) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ServiceWorkerDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('etags', 'readonly');
      const store = tx.objectStore('etags');

      const getRequest = store.get(url);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.etag || null);
      };
    };

    request.onupgradeneeded = () => {
      resolve(null); // First time
    };
  });
}

/**
 * Handle messages from client
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }

  if (event.data.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        event.ports[0].postMessage({ size: requests.length });
      });
    });
  }
});

console.log('[SW] Service worker loaded');
