import { validateDeal } from '../deal/rules.ts'
import type { Deal } from '../deal/types.ts'
import dealJson from './deal.json'

/** Problems found in deal.json, for the development error screen. Empty when it is usable. */
export const dealProblems: string[] = validateDeal(dealJson)

/** The month's drops, fixed in advance by `npm run deal`. */
export const deal = dealJson as Deal
