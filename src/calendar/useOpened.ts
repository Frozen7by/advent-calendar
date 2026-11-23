import { useCallback, useRef, useState } from 'react'
import { STORAGE_KEY, loadOpened, saveOpened } from './openedStore.ts'
import type { StorageLike } from './openedStore.ts'

const noStorage: StorageLike = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

/** `localStorage`, or a stand-in that remembers nothing when the browser refuses access. */
function browserStorage(): StorageLike {
  try {
    return window.localStorage
  } catch {
    return noStorage
  }
}

/** The doors opened on this device, kept in `localStorage`. */
export function useOpened() {
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => loadOpened(browserStorage()))
  const current = useRef(opened)

  /** Saves synchronously, so the door stays opened even if the app is closed right after. */
  const markOpened = useCallback((id: string) => {
    if (current.current.has(id)) return
    const next = new Set(current.current).add(id)
    current.current = next
    saveOpened(browserStorage(), next)
    setOpened(next)
  }, [])

  const resetOpened = useCallback(() => {
    try {
      browserStorage().removeItem(STORAGE_KEY)
    } catch {
      // Nothing was saved, so there is nothing to clear.
    }
    current.current = new Set<string>()
    setOpened(current.current)
  }, [])

  return { opened, markOpened, resetOpened }
}
