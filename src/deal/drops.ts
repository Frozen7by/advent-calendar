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
  'setTable',
  'waterPlants',
  'read',
] as const

export type ChoreId = (typeof CHORE_IDS)[number]

/** The only good drop. */
export const ROBLOX = 'roblox'

export type DropId = ChoreId | typeof ROBLOX

export const DROP_IDS: readonly DropId[] = [ROBLOX, ...CHORE_IDS]

export const DROP_ICONS: Record<DropId, string> = {
  roblox: '💎',
  brushTeeth: '🪥',
  cleanRoom: '🧹',
  dishes: '🍽️',
  makeBed: '🛏️',
  packBag: '🎒',
  homework: '📚',
  trash: '🗑️',
  toys: '🧸',
  laundry: '🧺',
  setTable: '🍴',
  waterPlants: '🪴',
  read: '📖',
}
