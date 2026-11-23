import { expect, it } from 'vitest'
import type { Deal } from '../deal/types.ts'
import { doorState, giftList, resolveNow } from './logic.ts'

const none = new Set<number>()

it('locks everything before 1 December 2026', () => {
  expect(doorState(1, new Date(2026, 10, 30, 23, 59), none)).toBe('locked')
  expect(doorState(10, new Date(2025, 11, 20), none)).toBe('locked')
})

it('opens door N at local midnight on N December', () => {
  expect(doorState(1, new Date(2026, 11, 1, 0, 0), none)).toBe('available')
  expect(doorState(5, new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(6, new Date(2026, 11, 5, 23, 59), none)).toBe('locked')
})

it('keeps missed doors available, also after the 24th', () => {
  expect(doorState(3, new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(24, new Date(2027, 0, 10), none)).toBe('available')
})

it('reports opened doors as opened', () => {
  expect(doorState(3, new Date(2026, 11, 5), new Set([3]))).toBe('opened')
})

it('lists gifts of opened doors in order, bonus flagged', () => {
  const deal: Deal = [
    { day: 1, cases: [{ grade: 'common', drop: 'trash' }] },
    {
      day: 2,
      cases: [
        { grade: 'common', drop: 'toys' },
        { grade: 'rare', drop: 'roblox5' },
      ],
    },
    { day: 3, cases: [{ grade: 'rare', drop: 'homework' }] },
  ]
  expect(giftList(deal, new Set([2, 1]))).toEqual([
    { day: 1, grade: 'common', drop: 'trash', bonus: false },
    { day: 2, grade: 'common', drop: 'toys', bonus: false },
    { day: 2, grade: 'rare', drop: 'roblox5', bonus: true },
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
