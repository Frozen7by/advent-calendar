import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * The version shown in the app: how many commits the build has behind it, and
 * the last one's short hash, like "36 · a721572". The number grows with every
 * deploy, so two devices can be compared at a glance.
 */
function appVersion(): string {
  try {
    const git = (args: string) => execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    return `${git('rev-list --count HEAD')} · ${git('rev-parse --short HEAD')}`
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative paths, so the same build works from a domain root or a sub-path (GitHub Pages).
  base: './',
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
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
