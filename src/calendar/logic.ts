import type { DropId } from '../deal/drops.ts'
import type { Deal, Grade } from '../deal/types.ts'

export const YEAR = 2026
const DECEMBER = 11

export type DoorState = 'locked' | 'available' | 'opened'

/** Door N unlocks at local midnight on N December and stays unlocked afterwards. */
export function doorState(day: number, now: Date, opened: ReadonlySet<number>): DoorState {
  if (opened.has(day)) return 'opened'
  return now.getTime() >= new Date(YEAR, DECEMBER, day).getTime() ? 'available' : 'locked'
}

export interface Gift {
  day: number
  grade: Grade
  drop: DropId
  /** True for the second case of a bonus door. */
  bonus: boolean
}

/** Every drop from the opened doors, in door order. */
export function giftList(deal: Deal, opened: ReadonlySet<number>): Gift[] {
  return deal
    .filter((door) => opened.has(door.day))
    .flatMap((door) => door.cases.map((c, i) => ({ day: door.day, grade: c.grade, drop: c.drop, bonus: i > 0 })))
}

/**
 * The date the app should treat as "now". In development, `?date=2026-12-05`
 * overrides it (local noon of that day) so the month can be walked through.
 */
export function resolveNow(realNow: Date, search: string, dev: boolean): Date {
  if (!dev) return realNow
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(new URLSearchParams(search).get('date') ?? '')
  if (!match) return realNow
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day, 12)
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isRealDate ? date : realNow
}
