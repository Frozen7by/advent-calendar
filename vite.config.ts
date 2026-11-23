import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths, so the same build works from a domain root or a sub-path (GitHub Pages).
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // App icons (Android, iOS home screen, favicon) are generated from this one SVG.
      pwaAssets: { image: 'public/favicon.svg' },
      manifest: {
        name: 'Адвент-календарь',
        short_name: 'Адвент',
        lang: 'ru',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        theme_color: '#12203a',
        background_color: '#12203a',
      },
      workbox: {
        // Precache everything so the app works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
  ],
})
