import type { DropId } from './drops.ts'
import { robloxCount } from './rules.ts'
import type { Deal, Grade } from './types.ts'

export interface DealNames {
  grade: Record<Grade, string>
  drop: Record<DropId, string>
}

/** The month as text: one line per door, then the number of Roblox drops. */
export function formatDeal(deal: Deal, names: DealNames): string {
  const lines = deal.map((door) => {
    const cases = door.cases.map((c) => `${names.grade[c.grade]}: ${names.drop[c.drop]}`)
    return `${String(door.day).padStart(2)}  ${cases.join('  +  ')}`
  })
  return [...lines, '', `Roblox: ${robloxCount(deal)}`].join('\n')
}
