import { expect, it } from 'vitest'
import { DROP_IDS } from './drops.ts'
import type { DropId } from './drops.ts'
import { formatDeal } from './format.ts'
import type { DealNames } from './format.ts'
import type { Deal } from './types.ts'

const names: DealNames = {
  grade: { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический' },
  drop: Object.fromEntries(DROP_IDS.map((id) => [id, id])) as Record<DropId, string>,
}

it('prints one line per door, bonus cases inline, then the Roblox total', () => {
  const deal: Deal = [
    { day: 1, cases: [{ grade: 'common', drop: 'trash' }] },
    {
      day: 12,
      cases: [
        { grade: 'common', drop: 'toys' },
        { grade: 'rare', drop: 'roblox' },
      ],
    },
  ]
  expect(formatDeal(deal, names).split('\n')).toEqual([
    ' 1  Обычный: trash',
    '12  Обычный: toys  +  Редкий: roblox',
    '',
    'Roblox: 1',
  ])
})
