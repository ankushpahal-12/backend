/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'expense-tracker-network-v1';
const STATIC_CACHE_KEYS = [
	'/',
	'/index.html',
	'/manifest.json',
	'/favicon.ico',
];

const API_CACHE_PREFIX = '/api/';

const openCache = async () => caches.open(CACHE_NAME);

self.addEventListener('install', event => {
	event.waitUntil(
		openCache().then(async cache => {
			// Cache each resource individually so one failure doesn't break the entire install
			await Promise.allSettled(
				STATIC_CACHE_KEYS.map(key =>
					cache.add(key).catch(err =>
						console.warn(`[SW] Failed to cache ${key}:`, err.message)
					)
				)
			);
		}),
	);

	self.skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => Promise.all(
			cacheNames
				.filter(cacheName => cacheName !== CACHE_NAME)
				.map(cacheName => caches.delete(cacheName)),
		)),
	);

	self.clients.claim();
});

self.addEventListener('fetch', event => {
	const { request } = event;

	if (request.method !== 'GET') {
		return;
	}

	const url = new URL(request.url);

	if (url.origin !== self.location.origin) {
		return;
	}

	if (url.pathname.startsWith(API_CACHE_PREFIX)) {
		event.respondWith(
			fetch(request)
				.then(async response => {
					if (!response.ok) {
						return response;
					}

					const cache = await openCache();
					cache.put(request, response.clone());
					return response;
				})
				.catch(async () => {
					const cached = await caches.match(request);
					if (cached) return cached;
					const fallback = await caches.match('/index.html');
					return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
				}),
		);
		return;
	}

	event.respondWith(
		caches.match(request).then(cached => {
			if (cached) return cached;
			return fetch(request).catch(async () => {
				const fallback = await caches.match('/index.html');
				return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
			});
		}),
	);
});

self.addEventListener('message', event => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	if (event.data?.type === 'CLEAR_CACHE') {
		event.waitUntil(caches.delete(CACHE_NAME));
	}

	if (event.data?.type === 'GET_CACHE_SIZE' && event.ports[0]) {
		event.waitUntil(
			caches.open(CACHE_NAME).then(cache => cache.keys().then(keys => {
				event.ports[0].postMessage({ size: keys.length });
			})),
		);
	}
});
