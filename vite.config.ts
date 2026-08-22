import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: 'Moe`s PubQuiz',
        short_name: 'Moe`s PubQuiz',
        description: 'Lokaler Spielleiter für abwechslungsreiche Pub-Quiz-Abende.',
        theme_color: '#d4a24c',
        background_color: '#0b1c2c',
        display: 'standalone',
        orientation: 'any',
        lang: 'de',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ogg,oga,wav,mp3,webm,opus}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/flagcdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quiz-pictures',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/interactive-examples\.mdn\.mozilla\.net\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quiz-audio',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
