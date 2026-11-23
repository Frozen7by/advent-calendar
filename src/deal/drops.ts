export const CHORE_IDS = [
  'brushTeeth',
  'cleanRoom',
  'dishes',
  'makeBed',
  'packBag',
  'homework',
  'trash',
  'laundry',
  'cook',
  'waterPlants',
  'dictation',
] as const

export type ChoreId = (typeof CHORE_IDS)[number]

/** The good drops: a Roblox donation of a fixed amount in dollars. */
export const ROBLOX_IDS = ['roblox2', 'roblox5', 'roblox10', 'roblox20'] as const

export type RobloxId = (typeof ROBLOX_IDS)[number]

export const ROBLOX_DOLLARS: Record<RobloxId, number> = { roblox2: 2, roblox5: 5, roblox10: 10, roblox20: 20 }

/** Share of Roblox drops that get each amount: the smaller the amount, the more often. */
export const ROBLOX_WEIGHTS: Record<RobloxId, number> = { roblox2: 0.5, roblox5: 0.3, roblox10: 0.15, roblox20: 0.05 }

/** Prizes that are not Roblox. The parent puts them into a deal file by hand; they are never dealt at random. */
export const TREAT_IDS = ['plainSandwich'] as const

export type TreatId = (typeof TREAT_IDS)[number]

export type DropId = ChoreId | RobloxId | TreatId

export const DROP_IDS: readonly DropId[] = [...ROBLOX_IDS, ...TREAT_IDS, ...CHORE_IDS]

export function isRoblox(drop: string): drop is RobloxId {
  return (ROBLOX_IDS as readonly string[]).includes(drop)
}

/** A drop the child gets, as opposed to a chore the child does. Prizes get the gold look and the fanfare. */
export function isPrize(drop: string): drop is RobloxId | TreatId {
  return isRoblox(drop) || (TREAT_IDS as readonly string[]).includes(drop)
}

/** Picks a Roblox amount by ROBLOX_WEIGHTS from a random number in [0, 1). */
export function pickRoblox(random: number, allowed: readonly RobloxId[] = ROBLOX_IDS): RobloxId {
  // Among the allowed amounts the weights keep their proportions.
  let r = random * allowed.reduce((sum, id) => sum + ROBLOX_WEIGHTS[id], 0)
  for (const id of allowed) {
    if (r < ROBLOX_WEIGHTS[id]) return id
    r -= ROBLOX_WEIGHTS[id]
  }
  return allowed[allowed.length - 1]
}

export const DROP_ICONS: Record<DropId, string> = {
  roblox2: '💎',
  roblox5: '💎',
  roblox10: '💎',
  roblox20: '💎',
  plainSandwich: '🍞',
  brushTeeth: '🪥',
  cleanRoom: '🧹',
  dishes: '🍽️',
  makeBed: '🛏️',
  packBag: '🎒',
  homework: '📚',
  trash: '🗑️',
  laundry: '🧺',
  cook: '🍳',
  waterPlants: '🪴',
  dictation: '✍️',
}
