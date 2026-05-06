import { generateSW } from 'workbox-build'

const { count, size } = await generateSW({
  swDest: 'public/sw.js',

  // Activate immediately, take control of all clients
  skipWaiting: true,
  clientsClaim: true,

  // Precache only stable public assets (icons, manifest, splash screens)
  // Next.js JS/CSS chunks are handled via runtime caching below
  globDirectory: 'public',
  globPatterns: [
    'icons/**/*.png',
    'splash/**/*.png',
    'apple-touch-icon.png',
    'favicon*.{ico,png}',
    'manifest.json',
  ],

  runtimeCaching: [
    // Next.js static chunks (hashed filenames) — cache forever
    {
      urlPattern: /\/_next\/static\/.+/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-v1',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Next.js image optimisation endpoint
    {
      urlPattern: /\/_next\/image\?.+/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-images-v1',
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // HTML pages (root and any navigation) — network first, 5 s timeout, fall back to cache
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-v1',
        networkTimeoutSeconds: 5,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // /api/rates — NetworkFirst with offline fallback to cache
    {
      urlPattern: /\/api\/rates/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-rates-v1',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
})

console.log(`✓ SW generated: ${count} files precached (${(size / 1024).toFixed(1)} KB)`)
