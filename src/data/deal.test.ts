import { expect, it } from 'vitest'
import { validateDeal } from '../deal/rules.ts'
import dealJson from './deal.json'

// Guards the committed file: a hand-edit mistake fails here before the deploy builds.
it('ships a deal file the app can use', () => {
  expect(validateDeal(dealJson)).toEqual([])
})
