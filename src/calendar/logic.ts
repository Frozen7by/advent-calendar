import type { DropId } from '../deal/drops.ts'
import type { Deal, DealDoor, Grade } from '../deal/types.ts'

export const YEAR = 2026

/** The calendar runs from 23 November through December. */
export type Month = 11 | 12

/** The i18n key of each month's date format (`date.nov`, `date.dec`). */
export const MONTH_KEY = { 11: 'nov', 12: 'dec' } as const satisfies Record<Month, string>

export type DoorState = 'locked' | 'available' | 'opened'

/** A door of the calendar: a deal door placed in its month. */
export interface CalendarDoor extends DealDoor {
  /** The door's date, like "2026-11-23": unique across both months, and what is saved once it is opened. */
  id: string
  month: Month
}

export function doorId(month: Month, day: number): string {
  return `${YEAR}-${month}-${String(day).padStart(2, '0')}`
}

/** The November doors, then the December doors, in calendar order. */
export function calendarDoors(november: Deal, december: Deal): CalendarDoor[] {
  const place = (month: Month) => (door: DealDoor) => ({ id: doorId(month, door.day), month, ...door })
  return [...november.map(place(11)), ...december.map(place(12))]
}

/** A door unlocks at local midnight on its date and stays unlocked afterwards. */
export function doorState(door: CalendarDoor, now: Date, opened: ReadonlySet<string>): DoorState {
  if (opened.has(door.id)) return 'opened'
  return now.getTime() >= new Date(YEAR, door.month - 1, door.day).getTime() ? 'available' : 'locked'
}

export interface Gift {
  doorId: string
  month: Month
  day: number
  grade: Grade
  drop: DropId
  /** True for the second case of a bonus door. */
  bonus: boolean
}

/** Every drop from the opened doors, in door order. */
export function giftList(doors: readonly CalendarDoor[], opened: ReadonlySet<string>): Gift[] {
  return doors
    .filter((door) => opened.has(door.id))
    .flatMap((door) =>
      door.cases.map((c, i) => ({
        doorId: door.id,
        month: door.month,
        day: door.day,
        grade: c.grade,
        drop: c.drop,
        bonus: i > 0,
      })),
    )
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
