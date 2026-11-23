export const CHORE_IDS = [
  'brushTeeth',
  'cleanRoom',
  'dishes',
  'makeBed',
  'packBag',
  'homework',
  'trash',
  'toys',
  'laundry',
  'cook',
  'waterPlants',
] as const

export type ChoreId = (typeof CHORE_IDS)[number]

/** The good drops: a Roblox donation of a fixed amount in dollars. */
export const ROBLOX_IDS = ['roblox2', 'roblox5', 'roblox10', 'roblox20'] as const

export type RobloxId = (typeof ROBLOX_IDS)[number]

export const ROBLOX_DOLLARS: Record<RobloxId, number> = { roblox2: 2, roblox5: 5, roblox10: 10, roblox20: 20 }

/** Share of Roblox drops that get each amount: the smaller the amount, the more often. */
export const ROBLOX_WEIGHTS: Record<RobloxId, number> = { roblox2: 0.5, roblox5: 0.3, roblox10: 0.15, roblox20: 0.05 }

export type DropId = ChoreId | RobloxId

export const DROP_IDS: readonly DropId[] = [...ROBLOX_IDS, ...CHORE_IDS]

export function isRoblox(drop: string): drop is RobloxId {
  return (ROBLOX_IDS as readonly string[]).includes(drop)
}

/** Picks a Roblox amount by ROBLOX_WEIGHTS from a random number in [0, 1). */
export function pickRoblox(random: number): RobloxId {
  let r = random
  for (const id of ROBLOX_IDS) {
    if (r < ROBLOX_WEIGHTS[id]) return id
    r -= ROBLOX_WEIGHTS[id]
  }
  return 'roblox20'
}

export const DROP_ICONS: Record<DropId, string> = {
  roblox2: '💎',
  roblox5: '💎',
  roblox10: '💎',
  roblox20: '💎',
  brushTeeth: '🪥',
  cleanRoom: '🧹',
  dishes: '🍽️',
  makeBed: '🛏️',
  packBag: '🎒',
  homework: '📚',
  trash: '🗑️',
  toys: '🧸',
  laundry: '🧺',
  cook: '🍳',
  waterPlants: '🪴',
}
