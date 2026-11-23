import { calendarDoors } from '../calendar/logic.ts'
import { NOVEMBER_DAYS, validateDeal } from '../deal/rules.ts'
import type { Deal } from '../deal/types.ts'
import decemberJson from './deal.json'
import novemberJson from './november.json'

/** Problems found in the deal files, for the development error screen. Empty when they are usable. */
export const dealProblems: string[] = [
  ...validateDeal(novemberJson, NOVEMBER_DAYS).map((problem) => `november.json: ${problem}`),
  ...validateDeal(decemberJson).map((problem) => `deal.json: ${problem}`),
]

/** Every door's drops, fixed in advance by `npm run deal`: 23–30 November, then 1–24 December. */
export const doors = calendarDoors(novemberJson as Deal, decemberJson as Deal)
