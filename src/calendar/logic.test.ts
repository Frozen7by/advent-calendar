import { expect, it } from 'vitest'
import type { Deal } from '../deal/types.ts'
import { calendarDoors, doorState, giftList, resolveNow } from './logic.ts'
import type { CalendarDoor } from './logic.ts'

const none = new Set<string>()
const dec = (day: number): CalendarDoor => ({ id: `2026-12-${String(day).padStart(2, '0')}`, month: 12, day, cases: [] })
const nov = (day: number): CalendarDoor => ({ id: `2026-11-${day}`, month: 11, day, cases: [] })

it('puts the November doors before the December doors, each with its own date id', () => {
  const doors = calendarDoors(
    [{ day: 23, cases: [{ grade: 'common', drop: 'trash' }] }],
    [
      { day: 1, cases: [{ grade: 'rare', drop: 'cook' }] },
      { day: 23, cases: [{ grade: 'epic', drop: 'roblox20' }] },
    ],
  )
  expect(doors).toEqual([
    { id: '2026-11-23', month: 11, day: 23, cases: [{ grade: 'common', drop: 'trash' }] },
    { id: '2026-12-01', month: 12, day: 1, cases: [{ grade: 'rare', drop: 'cook' }] },
    { id: '2026-12-23', month: 12, day: 23, cases: [{ grade: 'epic', drop: 'roblox20' }] },
  ])
})

it('locks everything before 1 December 2026', () => {
  expect(doorState(dec(1), new Date(2026, 10, 30, 23, 59), none)).toBe('locked')
  expect(doorState(dec(10), new Date(2025, 11, 20), none)).toBe('locked')
})

it('opens door N at local midnight on N December', () => {
  expect(doorState(dec(1), new Date(2026, 11, 1, 0, 0), none)).toBe('available')
  expect(doorState(dec(5), new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(dec(6), new Date(2026, 11, 5, 23, 59), none)).toBe('locked')
})

it('opens a November door at local midnight on its November day', () => {
  expect(doorState(nov(23), new Date(2026, 10, 22, 23, 59), none)).toBe('locked')
  expect(doorState(nov(23), new Date(2026, 10, 23, 0, 0), none)).toBe('available')
  expect(doorState(nov(30), new Date(2026, 10, 29, 12), none)).toBe('locked')
  expect(doorState(nov(24), new Date(2026, 11, 3), none)).toBe('available')
  // The November 24 door opening does not open the December 24 door.
  expect(doorState(dec(24), new Date(2026, 10, 24, 12), none)).toBe('locked')
})

it('keeps missed doors available, also after the 24th', () => {
  expect(doorState(dec(3), new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(dec(24), new Date(2027, 0, 10), none)).toBe('available')
})

it('reports opened doors as opened, by date id', () => {
  expect(doorState(dec(3), new Date(2026, 11, 5), new Set(['2026-12-03']))).toBe('opened')
  expect(doorState(dec(23), new Date(2026, 11, 23), new Set(['2026-11-23']))).toBe('available')
})

it('lists gifts of opened doors in order, bonus flagged', () => {
  const december: Deal = [
    { day: 1, cases: [{ grade: 'common', drop: 'trash' }] },
    {
      day: 2,
      cases: [
        { grade: 'common', drop: 'cook' },
        { grade: 'rare', drop: 'roblox5' },
      ],
    },
    { day: 3, cases: [{ grade: 'rare', drop: 'homework' }] },
  ]
  const november: Deal = [{ day: 30, cases: [{ grade: 'uncommon', drop: 'dishes' }] }]
  const doors = calendarDoors(november, december)
  expect(giftList(doors, new Set(['2026-12-02', '2026-12-01', '2026-11-30']))).toEqual([
    { doorId: '2026-11-30', month: 11, day: 30, grade: 'uncommon', drop: 'dishes', bonus: false },
    { doorId: '2026-12-01', month: 12, day: 1, grade: 'common', drop: 'trash', bonus: false },
    { doorId: '2026-12-02', month: 12, day: 2, grade: 'common', drop: 'cook', bonus: false },
    { doorId: '2026-12-02', month: 12, day: 2, grade: 'rare', drop: 'roblox5', bonus: true },
  ])
})

it('overrides the date only in development', () => {
  const real = new Date(2026, 10, 23, 9)
  expect(resolveNow(real, '?date=2026-12-05', true)).toEqual(new Date(2026, 11, 5, 12))
  expect(resolveNow(real, '?date=2026-12-05', false)).toBe(real)
  expect(resolveNow(real, '?date=nonsense', true)).toBe(real)
  expect(resolveNow(real, '?date=2026-13-45', true)).toBe(real)
  expect(resolveNow(real, '', true)).toBe(real)
})
