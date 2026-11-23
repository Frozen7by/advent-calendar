import { describe, expect, it } from 'vitest'
import { isRoblox } from './drops.ts'
import { generateDeal, mulberry32, robloxCount, robloxDollars, validateDeal } from './rules.ts'
import type { Grade } from './types.ts'

const deals = Array.from({ length: 300 }, (_, i) => generateDeal(mulberry32(i + 1)))

describe('generateDeal', () => {
  it('has 24 doors numbered 1..24', () => {
    for (const d of deals) {
      expect(d.map((x) => x.day)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1))
    }
  })

  it('deals 12 common, 7 uncommon, 4 rare, 1 epic main cases, epic on door 24', () => {
    for (const d of deals) {
      const count = (g: Grade) => d.filter((x) => x.cases[0].grade === g).length
      expect([count('common'), count('uncommon'), count('rare'), count('epic')]).toEqual([12, 7, 4, 1])
      expect(d[23].cases[0].grade).toBe('epic')
    }
  })

  it('gives exactly two common doors a bonus case', () => {
    for (const d of deals) {
      const bonus = d.filter((x) => x.cases.length === 2)
      expect(bonus).toHaveLength(2)
      expect(bonus.every((x) => x.cases[0].grade === 'common')).toBe(true)
      expect(d.every((x) => x.cases.length === 1 || x.cases.length === 2)).toBe(true)
    }
  })

  it('never repeats a chore from the previous door or within a door', () => {
    for (const d of deals) {
      d.forEach((door, i) => {
        const chores = door.cases.map((c) => c.drop).filter((x) => !isRoblox(x))
        expect(new Set(chores).size).toBe(chores.length)
        const prev = i > 0 ? d[i - 1].cases.map((c) => c.drop) : []
        for (const c of chores) expect(prev).not.toContain(c)
      })
    }
  })

  it('applies the chance as rng() < chance', () => {
    expect(robloxCount(generateDeal(() => 0))).toBe(26)
    expect(robloxCount(generateDeal(() => 0.999))).toBe(0)
  })

  it('matches the spec odds over many deals', () => {
    const many = Array.from({ length: 3000 }, (_, i) => generateDeal(mulberry32(1000 + i)))
    const mean = many.reduce((s, d) => s + robloxCount(d), 0) / many.length
    expect(mean).toBeGreaterThan(2.8)
    expect(mean).toBeLessThan(3.2)
    const epicHit = many.filter((d) => isRoblox(d[23].cases[0].drop)).length / many.length
    expect(epicHit).toBeGreaterThan(0.93)
    expect(epicHit).toBeLessThan(0.97)
    const bonus = many.flatMap((d) => d.filter((x) => x.cases.length === 2).map((x) => x.cases[1].grade))
    const epicBonus = bonus.filter((g) => g === 'epic').length / bonus.length
    expect(epicBonus).toBeGreaterThan(0.025)
    expect(epicBonus).toBeLessThan(0.06)
  })
})

it('deals Roblox amounts of $2, $5, $10 and $20, smaller ones more often', () => {
  const many = Array.from({ length: 3000 }, (_, i) => generateDeal(mulberry32(5000 + i)))
  // The better the case, the bigger the donation it can hold.
  const cases = many.flatMap((d) => d.flatMap((x) => x.cases)).filter((c) => isRoblox(c.drop))
  const amounts = (grade: Grade) => [...new Set(cases.filter((c) => c.grade === grade).map((c) => c.drop))].sort()
  expect(amounts('common')).toEqual(['roblox2'])
  expect(amounts('uncommon')).toEqual(['roblox2', 'roblox5'])
  expect(amounts('rare')).toEqual(['roblox10', 'roblox2', 'roblox5'])
  expect(amounts('epic')).toEqual(['roblox10', 'roblox20'])
  expect(robloxDollars([{ day: 1, cases: [{ grade: 'rare', drop: 'roblox5' }, { grade: 'epic', drop: 'roblox20' }] }])).toBe(25)
})

describe('validateDeal', () => {
  it('accepts generated deals and valid hand edits', () => {
    for (const d of deals) expect(validateDeal(d)).toEqual([])
    const edited = structuredClone(deals[0])
    edited[4].cases[0].drop = 'roblox20'
    expect(validateDeal(edited)).toEqual([])
  })

  it.each([
    ['not an array', {}],
    ['23 doors', deals[0].slice(1)],
    ['days out of order', [...deals[0].slice(1), deals[0][0]]],
    ['unknown grade', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [{ grade: 'legendary', drop: 'trash' }] } : d))],
    ['unknown drop', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [{ grade: 'common', drop: 'robux' }] } : d))],
    ['no cases', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [] } : d))],
    ['three cases', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [d.cases[0], d.cases[0], d.cases[0]] } : d))],
  ])('reports a problem for %s', (_name, value) => {
    expect(validateDeal(value).length).toBeGreaterThan(0)
  })
})
