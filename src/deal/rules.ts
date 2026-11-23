import { CHORE_IDS, DROP_IDS, ROBLOX_DOLLARS, isRoblox, pickRoblox } from './drops.ts'
import type { ChoreId, DropId, RobloxId } from './drops.ts'
import { GRADES } from './types.ts'
import type { Deal, DealCase, Grade } from './types.ts'

/** Returns a number in [0, 1), like Math.random. */
export type Rng = () => number

export const DOOR_COUNT = 24
export const EPIC_DAY = 24
export const BONUS_DOORS = 2

/** Which days a deal file covers, in order. */
export interface DealDays {
  first: number
  count: number
}

export const DECEMBER_DAYS: DealDays = { first: 1, count: DOOR_COUNT }
/** The extra doors before December: 23–30 November. */
export const NOVEMBER_DAYS: DealDays = { first: 23, count: 8 }

export const GRADE_DOORS: Record<Grade, number> = { common: 12, uncommon: 7, rare: 4, epic: 1 }
export const ROBLOX_CHANCE: Record<Grade, number> = { common: 0.01, uncommon: 0.1, rare: 0.25, epic: 0.95 }

/** Which Roblox amounts each grade can drop: the better the case, the bigger the donation. */
export const ROBLOX_BY_GRADE: Record<Grade, readonly RobloxId[]> = {
  common: ['roblox2'],
  uncommon: ['roblox2', 'roblox5'],
  rare: ['roblox2', 'roblox5', 'roblox10'],
  epic: ['roblox10', 'roblox20'],
}

/** Small seeded generator, so tests can replay a deal. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A random grade weighted like the doors: 12 : 7 : 4 : 1. */
function weightedGrade(rng: Rng): Grade {
  let r = rng() * DOOR_COUNT
  for (const grade of GRADES) {
    if (r < GRADE_DOORS[grade]) return grade
    r -= GRADE_DOORS[grade]
  }
  return 'epic'
}

/** Fills one door's cases: Roblox by the grade's chance, otherwise a chore not used on the previous door. */
function dealCases(grades: Grade[], previousChores: readonly ChoreId[], rng: Rng) {
  const chores: ChoreId[] = []
  const cases: DealCase[] = grades.map((grade) => {
    if (rng() < ROBLOX_CHANCE[grade]) return { grade, drop: pickRoblox(rng(), ROBLOX_BY_GRADE[grade]) }
    const allowed = CHORE_IDS.filter((c) => !previousChores.includes(c) && !chores.includes(c))
    const chore = allowed[Math.floor(rng() * allowed.length)]
    chores.push(chore)
    return { grade, drop: chore }
  })
  return { cases, chores }
}

export function generateDeal(rng: Rng): Deal {
  const nonEpic: Grade[] = (['common', 'uncommon', 'rare'] as const).flatMap((grade) =>
    Array<Grade>(GRADE_DOORS[grade]).fill(grade),
  )
  const mainGrades: Grade[] = [...shuffle(nonEpic, rng), 'epic']

  const commonDays = mainGrades.flatMap((grade, i) => (grade === 'common' ? [i + 1] : []))
  const bonusDays = new Set(shuffle(commonDays, rng).slice(0, BONUS_DOORS))

  const deal: Deal = []
  let previousChores: ChoreId[] = []
  for (let day = 1; day <= DOOR_COUNT; day++) {
    const grades = [mainGrades[day - 1]]
    if (bonusDays.has(day)) grades.push(weightedGrade(rng))

    const { cases, chores } = dealCases(grades, previousChores, rng)
    deal.push({ day, cases })
    previousChores = chores
  }
  return deal
}

/**
 * The November doors: one case each, its grade drawn at random with the
 * December weights (12 : 7 : 4 : 1). No bonus cases and no guaranteed epic.
 */
export function generateNovember(rng: Rng): Deal {
  const deal: Deal = []
  let previousChores: ChoreId[] = []
  for (let day = NOVEMBER_DAYS.first; day < NOVEMBER_DAYS.first + NOVEMBER_DAYS.count; day++) {
    const { cases, chores } = dealCases([weightedGrade(rng)], previousChores, rng)
    deal.push({ day, cases })
    previousChores = chores
  }
  return deal
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Checks the shape of a deal, not its odds: the parent may hand-edit drops.
 * Returns human-readable problems; an empty list means the deal is usable.
 */
export function validateDeal(value: unknown, days: DealDays = DECEMBER_DAYS): string[] {
  if (!Array.isArray(value)) return ['The deal must be a list of doors.']
  const problems: string[] = []
  if (value.length !== days.count) problems.push(`Expected ${days.count} doors, found ${value.length}.`)

  value.forEach((door: unknown, i) => {
    const where = `Door at position ${i + 1}`
    if (!isRecord(door)) {
      problems.push(`${where} is not an object.`)
      return
    }
    const day = days.first + i
    if (door.day !== day) problems.push(`${where} has day ${String(door.day)}, expected ${day}.`)
    const cases = door.cases
    if (!Array.isArray(cases) || cases.length < 1 || cases.length > 2) {
      problems.push(`${where} must have one or two cases.`)
      return
    }
    cases.forEach((c: unknown) => {
      if (!isRecord(c)) {
        problems.push(`${where} has a case that is not an object.`)
        return
      }
      if (!GRADES.includes(c.grade as Grade)) problems.push(`${where} has unknown grade "${String(c.grade)}".`)
      if (!DROP_IDS.includes(c.drop as DropId)) problems.push(`${where} has unknown drop "${String(c.drop)}".`)
    })
  })
  return problems
}

export function robloxCount(deal: Deal): number {
  return deal.reduce((sum, door) => sum + door.cases.filter((c) => isRoblox(c.drop)).length, 0)
}

/** What the month's Roblox drops cost the parent, in dollars. */
export function robloxDollars(deal: Deal): number {
  return deal
    .flatMap((door) => door.cases.map((c) => c.drop))
    .filter(isRoblox)
    .reduce((sum, drop) => sum + ROBLOX_DOLLARS[drop], 0)
}
