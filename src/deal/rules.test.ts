import { describe, expect, it } from 'vitest'
import { isPrize, isRoblox } from './drops.ts'
import {
  NOVEMBER_DAYS,
  ROBLOX_BY_GRADE,
  ROBLOX_CHANCE,
  generateDeal,
  generateNovember,
  mulberry32,
  robloxCount,
  robloxDollars,
  validateDeal,
} from './rules.ts'
import type { Deal, Grade } from './types.ts'

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

describe('generateNovember', () => {
  const novembers = Array.from({ length: 3000 }, (_, i) => generateNovember(mulberry32(9000 + i)))

  it('has one case behind each of the doors 23..30 November', () => {
    for (const n of novembers.slice(0, 300)) {
      expect(n.map((x) => x.day)).toEqual([23, 24, 25, 26, 27, 28, 29, 30])
      expect(n.every((x) => x.cases.length === 1)).toBe(true)
      expect(validateDeal(n, NOVEMBER_DAYS)).toEqual([])
    }
  })

  it('weights each door grade 12 : 7 : 4 : 1, with no guaranteed epic', () => {
    const grades = novembers.flatMap((n) => n.map((x) => x.cases[0].grade))
    const share = (g: Grade) => grades.filter((x) => x === g).length / grades.length
    expect(share('common')).toBeCloseTo(12 / 24, 1)
    expect(share('uncommon')).toBeCloseTo(7 / 24, 1)
    expect(share('rare')).toBeCloseTo(4 / 24, 1)
    expect(share('epic')).toBeGreaterThan(0.03)
    expect(share('epic')).toBeLessThan(0.055)
  })

  it('uses the December Roblox chance and amount limits per grade', () => {
    const cases = novembers.flatMap((n) => n.map((x) => x.cases[0]))
    for (const grade of ['common', 'uncommon', 'rare', 'epic'] as const) {
      const ofGrade = cases.filter((c) => c.grade === grade)
      const roblox = ofGrade.filter((c) => isRoblox(c.drop))
      expect(roblox.length / ofGrade.length).toBeCloseTo(ROBLOX_CHANCE[grade], 1)
      for (const c of roblox) expect(ROBLOX_BY_GRADE[grade]).toContain(c.drop)
    }
  })

  it('never repeats a chore from the previous door', () => {
    for (const n of novembers.slice(0, 300)) {
      n.forEach((door, i) => {
        if (i > 0 && !isRoblox(door.cases[0].drop)) expect(door.cases[0].drop).not.toBe(n[i - 1].cases[0].drop)
      })
    }
  })
})

describe('hand-placed prizes', () => {
  const sandwich: Deal = [{ day: 1, cases: [{ grade: 'rare', drop: 'plainSandwich' }] }]

  it('are prizes, but not Roblox: they cost the parent no donation', () => {
    expect(isPrize('plainSandwich')).toBe(true)
    expect(isPrize('roblox5')).toBe(true)
    expect(isPrize('trash')).toBe(false)
    expect(robloxCount(sandwich)).toBe(0)
    expect(robloxDollars(sandwich)).toBe(0)
  })

  it('are accepted in a deal file', () => {
    const edited = structuredClone(deals[0])
    edited[4].cases[0].drop = 'plainSandwich'
    expect(validateDeal(edited)).toEqual([])
  })

  it('are never dealt at random', () => {
    const dealt = [...deals, ...Array.from({ length: 300 }, (_, i) => generateNovember(mulberry32(i + 1)))]
    const drops = new Set(dealt.flatMap((d) => d.flatMap((x) => x.cases.map((c) => c.drop))))
    expect(drops.has('plainSandwich')).toBe(false)
  })
})

describe('validateDeal', () => {
  it('checks a November deal against the November doors', () => {
    const november = generateNovember(mulberry32(3))
    expect(validateDeal(november)).not.toEqual([])
    expect(validateDeal(deals[0], NOVEMBER_DAYS)).not.toEqual([])
    expect(validateDeal(november.slice(1), NOVEMBER_DAYS)).not.toEqual([])
  })

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
