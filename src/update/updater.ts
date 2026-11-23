/** What the updater needs from the browser. */
export interface UpdaterHost {
  /** Ask the server whether a newer version of the app exists. */
  check: () => void
  /** Restart the page, which then shows the newest version. */
  reload: () => void
}

export interface Updater {
  /** The app was opened or brought back to the front. */
  appShown: () => void
  /** A newer version has been downloaded and is ready to be shown. */
  newVersionReady: () => void
  /** True while a door is opening: a reload then would cut the case's reveal short. */
  setBusy: (busy: boolean) => void
}

/**
 * Decides when to look for a new version and when to switch to it: look each
 * time the app is shown, switch as soon as no door is in the middle of opening.
 */
export function createUpdater(host: UpdaterHost): Updater {
  let ready = false
  let busy = false
  let reloaded = false

  const reloadWhenIdle = () => {
    if (!ready || busy || reloaded) return
    reloaded = true
    host.reload()
  }

  return {
    appShown: () => host.check(),
    newVersionReady() {
      ready = true
      reloadWhenIdle()
    },
    setBusy(next) {
      busy = next
      reloadWhenIdle()
    },
  }
}
