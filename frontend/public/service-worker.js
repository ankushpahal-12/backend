/**
 * Service Worker
 * Manages offline caching and integrity checking
 */

const CACHE_NAME = 'expense-tracker-v1';
const CACHE_WHITELIST = [
  '/index.html',
  '/manifest.json',
  '/security.js',
  '/advanced-protection.js',
  '/zero-trust-client.js',
  
];

/**
 * Initialize IndexedDB schema
 * This ensures the database and object stores are created once during install
 */
async function initializeIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open('ServiceWorkerDB', 2);

    request.onerror = () => {
      console.error('[SW] Failed to initialize IndexedDB:', request.error);
      resolve(); // Don't block installation
    };

    request.onsuccess = () => {
      const db = request.result;
      console.log('[SW] IndexedDB initialized, version:', db.version);
      db.close();
      resolve();
    };

    request.onupgradeneeded = (event) => {
      try {
        const db = event.target.result;
        console.log('[SW] Database upgrade to version', db.version);
        if (!db.objectStoreNames.contains('etags')) {
          db.createObjectStore('etags', { keyPath: 'url' });
          console.log('[SW] Created "etags" object store');
        }
      } catch (error) {
        console.error('[SW] Error during database upgrade:', error);
      }
    };
  });
}

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    Promise.all([
      // Initialize IndexedDB schema first
      initializeIndexedDB(),
      // Then cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        // Cache each file individually with error handling
        // This prevents one failed file from breaking the entire cache
        return Promise.allSettled(
          CACHE_WHITELIST.map((url) =>
            cache.add(url).catch((error) => {
              console.warn(`[SW] Failed to cache ${url}:`, error.message);
              // Continue despite errors
              return Promise.resolve();
            })
          )
        ).then(() => {
          console.log('[SW] Static assets caching completed');
        });
      }).catch((error) => {
        console.error('[SW] Cache error:', error);
        // Don't fail the entire install if caching fails
        return Promise.resolve();
      })
    ])
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
 * Store ETag in IndexedDB with retry logic
 */
async function storeETag(url, etag, retries = 3) {
  return new Promise((resolve) => {
    const request = indexedDB.open('ServiceWorkerDB', 2);

    request.onerror = () => {
      console.warn('[SW] Failed to open IndexedDB for storeETag:', request.error);
      resolve(); // Don't fail, just skip caching
    };

    request.onsuccess = () => {
      const db = request.result;
      try {
        // Check if object store exists
        if (!db.objectStoreNames.contains('etags')) {
          console.warn('[SW] Object store "etags" not found, retrying...');
          db.close();
          // Retry after a short delay
          if (retries > 0) {
            setTimeout(() => storeETag(url, etag, retries - 1), 100);
          }
          resolve();
          return;
        }

        const tx = db.transaction('etags', 'readwrite');
        const store = tx.objectStore('etags');

        store.put({ url, etag, timestamp: Date.now() });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          console.warn('[SW] Transaction error in storeETag:', tx.error);
          db.close();
          resolve();
        };
      } catch (error) {
        console.warn('[SW] Error in storeETag:', error);
        db.close();
        resolve();
      }
    };

    request.onupgradeneeded = (event) => {
      try {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('etags')) {
          db.createObjectStore('etags', { keyPath: 'url' });
          console.log('[SW] Created "etags" object store in storeETag');
        }
      } catch (error) {
        console.warn('[SW] Error creating object store in storeETag:', error);
      }
    };
  });
}

/**
 * Get stored ETag from IndexedDB with retry logic
 */
async function getStoredETag(url, retries = 3) {
  return new Promise((resolve) => {
    const request = indexedDB.open('ServiceWorkerDB', 2);

    request.onerror = () => {
      console.warn('[SW] Failed to open IndexedDB for getStoredETag:', request.error);
      resolve(null); // Don't fail, just return null
    };

    request.onsuccess = () => {
      const db = request.result;
      try {
        // Check if object store exists
        if (!db.objectStoreNames.contains('etags')) {
          console.warn('[SW] Object store "etags" not found in getStoredETag, retrying...');
          db.close();
          // Retry after a short delay
          if (retries > 0) {
            setTimeout(() => getStoredETag(url, retries - 1), 100);
          }
          resolve(null);
          return;
        }

        const tx = db.transaction('etags', 'readonly');
        const store = tx.objectStore('etags');

        const getRequest = store.get(url);

        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result?.etag || null);
        };

        tx.onerror = () => {
          console.warn('[SW] Transaction error in getStoredETag:', tx.error);
          db.close();
          resolve(null);
        };
      } catch (error) {
        console.warn('[SW] Error in getStoredETag:', error);
        db.close();
        resolve(null);
      }
    };

    request.onupgradeneeded = (event) => {
      try {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('etags')) {
          db.createObjectStore('etags', { keyPath: 'url' });
          console.log('[SW] Created "etags" object store in getStoredETag');
        }
      } catch (error) {
        console.warn('[SW] Error creating object store in getStoredETag:', error);
      }
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
