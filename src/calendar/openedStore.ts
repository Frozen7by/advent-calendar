import { doorId } from './logic.ts'

export const STORAGE_KEY = 'advent2026.opened'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** A door's date id, like "2026-11-23". */
const isDoorId = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

/** The first version saved December doors as their numbers 1..24. */
const isDecemberNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 24

/** The doors opened on this device, by date id. Anything unreadable counts as "none opened". */
export function loadOpened(storage: StorageLike): Set<string> {
  try {
    const stored: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return new Set()
    return new Set(
      stored.flatMap((entry: unknown) => {
        if (isDoorId(entry)) return [entry]
        if (isDecemberNumber(entry)) return [doorId(12, entry)]
        return []
      }),
    )
  } catch {
    return new Set()
  }
}

export function saveOpened(storage: StorageLike, opened: ReadonlySet<string>): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...opened].sort()))
  } catch {
    // Private mode or a full disk: the app keeps working for this session.
  }
}
