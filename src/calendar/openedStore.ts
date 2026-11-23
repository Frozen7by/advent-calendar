export const STORAGE_KEY = 'advent2026.opened'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const isDoorNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 24

/** The doors opened on this device. Anything unreadable counts as "none opened". */
export function loadOpened(storage: StorageLike): Set<number> {
  try {
    const stored: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter(isDoorNumber) : [])
  } catch {
    return new Set()
  }
}

export function saveOpened(storage: StorageLike, opened: ReadonlySet<number>): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...opened].sort((a, b) => a - b)))
  } catch {
    // Private mode or a full disk: the app keeps working for this session.
  }
}
