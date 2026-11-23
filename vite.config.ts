import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
