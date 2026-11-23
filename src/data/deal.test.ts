import { expect, it } from 'vitest'
import { NOVEMBER_DAYS, validateDeal } from '../deal/rules.ts'
import dealJson from './deal.json'
import novemberJson from './november.json'

// Guards the committed files: a hand-edit mistake fails here before the deploy builds.
it('ships a December deal file the app can use', () => {
  expect(validateDeal(dealJson)).toEqual([])
})

it('ships a November deal file the app can use', () => {
  expect(validateDeal(novemberJson, NOVEMBER_DAYS)).toEqual([])
})
