// Deals the doors and prints them.
//   npm run deal                 deal a new December, write src/data/deal.json, print it
//   npm run deal -- --november   deal new November doors (23–30), write src/data/november.json, print them
//   npm run deal -- --show       print both months without changing them
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { formatDeal } from '../src/deal/format.ts'
import type { DealNames } from '../src/deal/format.ts'
import { DECEMBER_DAYS, NOVEMBER_DAYS, generateDeal, generateNovember, validateDeal } from '../src/deal/rules.ts'
import type { DealDays, Rng } from '../src/deal/rules.ts'
import type { Deal } from '../src/deal/types.ts'

const root = join(import.meta.dirname, '..')
const stringsPath = join(root, 'src', 'i18n', 'locales', 'ru.json')

const strings = JSON.parse(readFileSync(stringsPath, 'utf8')) as {
  rarity: DealNames['grade']
  drop: DealNames['drop']
}
const names: DealNames = { grade: strings.rarity, drop: strings.drop }

interface Month {
  title: string
  path: string
  days: DealDays
  generate: (rng: Rng) => Deal
}

const november: Month = {
  title: 'November',
  path: join(root, 'src', 'data', 'november.json'),
  days: NOVEMBER_DAYS,
  generate: generateNovember,
}
const december: Month = {
  title: 'December',
  path: join(root, 'src', 'data', 'deal.json'),
  days: DECEMBER_DAYS,
  generate: generateDeal,
}

function readMonth(month: Month): Deal {
  const stored: unknown = JSON.parse(readFileSync(month.path, 'utf8'))
  const problems = validateDeal(stored, month.days)
  if (problems.length > 0) {
    console.error(`${month.path} has problems:\n${problems.map((p) => `  - ${p}`).join('\n')}`)
    process.exit(1)
  }
  return stored as Deal
}

function print(month: Month, deal: Deal) {
  console.log(`${month.title}\n${formatDeal(deal, names)}\n`)
}

if (process.argv.includes('--show')) {
  for (const month of [november, december]) print(month, readMonth(month))
} else {
  const month = process.argv.includes('--november') ? november : december
  const deal = month.generate(Math.random)
  writeFileSync(month.path, `${JSON.stringify(deal, null, 2)}\n`)
  print(month, deal)
}
