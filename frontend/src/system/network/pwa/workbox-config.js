export default {
	globDirectory: 'dist',
	globPatterns: ['**/*.{html,js,css,ico,png,svg,webp,woff2}'],
	swSrc: 'src/system/network/pwa/service-worker.ts',
	swDest: 'public/service-worker.js',
	runtimeCaching: [
		{
			urlPattern: /^https?:\/\/.*\/api\//,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'expense-tracker-api-v1',
				networkTimeoutSeconds: 5,
			},
		},
		{
			urlPattern: ({ request }) => request.destination === 'image',
			handler: 'CacheFirst',
			options: {
				cacheName: 'expense-tracker-images-v1',
			},
		},
	],
};
