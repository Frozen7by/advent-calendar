// Deals the month and prints it.
//   npm run deal            deal a new month, write src/data/deal.json, print it
//   npm run deal -- --show  print the current deal without changing it
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { formatDeal } from '../src/deal/format.ts'
import type { DealNames } from '../src/deal/format.ts'
import { generateDeal, validateDeal } from '../src/deal/rules.ts'
import type { Deal } from '../src/deal/types.ts'

const root = join(import.meta.dirname, '..')
const dealPath = join(root, 'src', 'data', 'deal.json')
const stringsPath = join(root, 'src', 'i18n', 'locales', 'ru.json')

const strings = JSON.parse(readFileSync(stringsPath, 'utf8')) as {
  rarity: DealNames['grade']
  drop: DealNames['drop']
}
const names: DealNames = { grade: strings.rarity, drop: strings.drop }

let deal: Deal
if (process.argv.includes('--show')) {
  const stored: unknown = JSON.parse(readFileSync(dealPath, 'utf8'))
  const problems = validateDeal(stored)
  if (problems.length > 0) {
    console.error(`${dealPath} has problems:\n${problems.map((p) => `  - ${p}`).join('\n')}`)
    process.exit(1)
  }
  deal = stored as Deal
} else {
  deal = generateDeal(Math.random)
  writeFileSync(dealPath, `${JSON.stringify(deal, null, 2)}\n`)
}

console.log(formatDeal(deal, names))
