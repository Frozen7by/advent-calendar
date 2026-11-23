import { createUpdater } from './updater.ts'

/** Asks the browser to fetch the service worker again; a changed one downloads the new version. */
function check() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.update())
    // Offline, or the server is unreachable: the app keeps running the version it has.
    .catch(() => {})
}

export const updater = createUpdater({ check, reload: () => window.location.reload() })

/**
 * Keeps an installed app up to date without anyone closing it: looks for a new
 * version whenever the app comes to the front, and reloads once it has arrived.
 */
export function startAutoUpdate() {
  if (!('serviceWorker' in navigator)) return
  const serviceWorker = navigator.serviceWorker

  // The service worker takes control of the page twice in its life: at the very
  // first install (nothing to reload for) and whenever a newer version replaces it.
  let controlled = serviceWorker.controller !== null
  serviceWorker.addEventListener('controllerchange', () => {
    if (controlled) updater.newVersionReady()
    controlled = true
  })

  // A cold launch is checked by the browser itself; this covers an app left open in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') updater.appShown()
  })
}
