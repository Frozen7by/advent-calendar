# Advent Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 24-door advent calendar PWA where each door plays a reel-style case opening that lands on a drop fixed in advance, with a «Мои подарки» page, deployed to GitHub Pages.

**Architecture:** Pure TypeScript modules hold all rules (deal generation and validation, door states, opening flow, reel maths) and are unit-tested. A committed deal file is the single source of drops; the app only stores which doors were opened on the device. React renders three views (calendar, opening stage overlay, gifts) switched by state, animated with Motion.

**Tech Stack:** Vite 8, React 19, TypeScript 7, Motion, i18next / react-i18next, vite-plugin-pwa, Vitest, Node 24 (runs `scripts/deal.ts` directly), GitHub Actions + GitHub Pages.

**Spec:** [docs/superpowers/specs/2026-11-23-advent-calendar-design.md](../specs/2026-11-23-advent-calendar-design.md)

## Global Constraints

- Doors: 24, for 1–24 December 2026. Door N becomes available at local midnight on N December 2026 by the device clock.
- Grades and Roblox chances: common 12 doors / 1%, uncommon 7 / 10%, rare 4 / 25%, epic 1 / 95%. Door 24 is the epic door.
- Two common doors carry a bonus case with grade weighted 12:7:4:1.
- Drops come only from `src/data/deal.json`. Nothing in the app rolls a drop.
- The only saved state is the set of opened door numbers, in `localStorage`.
- Every user-facing string goes through i18next from `src/i18n/locales/ru.json`. Russian is the only language.
- No backend, no network calls at runtime, works offline.
- No artwork, names or sounds from CS:GO or Brawl Stars. Visuals are CSS/SVG/emoji; sounds are synthesised.
- `tsconfig` has `erasableSyntaxOnly` and `verbatimModuleSyntax`: no enums, use `import type` for types.
- Files under `src/deal/` are also run by Node directly: their relative imports use the `.ts` extension, and they must not import JSON, React, or use `import.meta.env`.
- `npm test`, `npm run lint` and `npm run build` pass at the end of every task.
- Commit at the end of every task, in the style of the existing history (short imperative subject, no prefix).

## Review Focus

1. The app is closed or reloaded while the reel is spinning: on relaunch the door must be opened, with its gifts listed and no second animation. Pinned in Task 4.
2. The installed app is resumed the next morning without a restart: today's door must become available. Pinned in Task 5.
3. A child mashes the case or the collect button: one tap's worth of effect, no skipped bonus case, no double record. Pinned in Task 4.
4. `localStorage` throws or holds junk (private mode, old data): the calendar still loads with no doors opened. Pinned in Task 3.
5. Screen widths from 320 px (small phone) to 1366 px (iPad landscape): the reel stops with the winning card under the marker and no empty strip visible. Pinned in Task 7.

## File Structure

| File | Responsibility |
|---|---|
| `src/deal/types.ts` | `Grade`, `DealCase`, `DealDoor`, `Deal` |
| `src/deal/drops.ts` | Drop ids, chore list, emoji icons |
| `src/deal/rules.ts` | Constants, `generateDeal`, `validateDeal`, `robloxCount`, `mulberry32` |
| `src/deal/format.ts` | `formatDeal` for the command's printout |
| `scripts/deal.ts` | `npm run deal` command |
| `src/data/deal.json` | The deal (generated, hand-editable) |
| `src/data/deal.ts` | Typed `deal` export and `dealProblems` |
| `src/calendar/logic.ts` | `doorState`, `giftList`, `resolveNow` |
| `src/calendar/openedStore.ts` | Load/save opened set, tolerant of bad storage |
| `src/calendar/useOpened.ts`, `useNow.ts` | React hooks over the two above |
| `src/opening/flow.ts` | Opening state machine |
| `src/opening/reel.ts` | Reel constants, `reelOffset`, `buildStrip` |
| `src/opening/OpeningStage.tsx`, `Reel.tsx`, `CaseBox.tsx` | Opening overlay |
| `src/components/DropCard.tsx` | One drop as a card (reel, door, reveal) |
| `src/screens/CalendarScreen.tsx`, `Door.tsx`, `GiftsScreen.tsx` | The two screens |
| `src/sound/sound.ts` | Tick and fanfare |
| `.github/workflows/deploy.yml` | Build, test, publish to Pages |

Styles: plain CSS files next to the components that use them. Grade colours are CSS variables in `src/index.css`: `--grade-common: #8b9bb4; --grade-uncommon: #4cc38a; --grade-rare: #4c8dff; --grade-epic: #b05cff; --gold: #ffd166`.

---

### Task 1: Deal rules

**Files:**
- Create: `src/deal/types.ts`, `src/deal/drops.ts`, `src/deal/rules.ts`
- Test: `src/deal/rules.test.ts`
- Modify: `package.json` (add `"test": "vitest run"`)

**Interfaces:**
- Produces (`drops.ts`):
  - `CHORE_IDS = ['brushTeeth','cleanRoom','dishes','makeBed','packBag','homework','trash','toys','laundry','setTable','waterPlants','read'] as const`
  - `type ChoreId`, `const ROBLOX = 'roblox'`, `type DropId = ChoreId | 'roblox'`, `const DROP_IDS: readonly DropId[]`
  - `DROP_ICONS: Record<DropId, string>` — roblox 💎, brushTeeth 🪥, cleanRoom 🧹, dishes 🍽️, makeBed 🛏️, packBag 🎒, homework 📚, trash 🗑️, toys 🧸, laundry 🧺, setTable 🍴, waterPlants 🪴, read 📖
- Produces (`types.ts`): `GRADES = ['common','uncommon','rare','epic'] as const`, `type Grade`, `interface DealCase { grade: Grade; drop: DropId }`, `interface DealDoor { day: number; cases: DealCase[] }`, `type Deal = DealDoor[]`
- Produces (`rules.ts`):
  - `type Rng = () => number` (returns `[0, 1)`)
  - `DOOR_COUNT = 24`, `EPIC_DAY = 24`, `BONUS_DOORS = 2`
  - `GRADE_DOORS: Record<Grade, number>` = 12 / 7 / 4 / 1
  - `ROBLOX_CHANCE: Record<Grade, number>` = 0.01 / 0.10 / 0.25 / 0.95
  - `mulberry32(seed: number): Rng`
  - `generateDeal(rng: Rng): Deal`
  - `validateDeal(value: unknown): string[]` — human-readable problems, empty when valid
  - `robloxCount(deal: Deal): number`

- [ ] **Step 1: Install test tooling**

Run: `npm install -D vitest jsdom @testing-library/react` (latest versions that accept Vite 8). Add the `test` script. Vitest globals stay off: every test file imports `describe`, `it`, `expect`, `vi` from `vitest`, and the test snippets in this plan omit their imports.

- [ ] **Step 2: Write the failing tests** in `src/deal/rules.test.ts`

```ts
const deals = Array.from({ length: 300 }, (_, i) => generateDeal(mulberry32(i + 1)))

it('has 24 doors numbered 1..24', () => {
  for (const d of deals) expect(d.map((x) => x.day)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1))
})
it('deals 12 common, 7 uncommon, 4 rare, 1 epic main cases, epic on door 24', () => {
  for (const d of deals) {
    const count = (g: Grade) => d.filter((x) => x.cases[0].grade === g).length
    expect([count('common'), count('uncommon'), count('rare'), count('epic')]).toEqual([12, 7, 4, 1])
    expect(d[23].cases[0].grade).toBe('epic')
  }
})
it('gives exactly two common doors a bonus case', () => {
  for (const d of deals) {
    const bonus = d.filter((x) => x.cases.length === 2)
    expect(bonus).toHaveLength(2)
    expect(bonus.every((x) => x.cases[0].grade === 'common')).toBe(true)
    expect(d.every((x) => x.cases.length === 1 || x.cases.length === 2)).toBe(true)
  }
})
it('never repeats a chore from the previous door or within a door', () => {
  for (const d of deals) d.forEach((door, i) => {
    const chores = door.cases.map((c) => c.drop).filter((x) => x !== 'roblox')
    expect(new Set(chores).size).toBe(chores.length)
    const prev = i > 0 ? d[i - 1].cases.map((c) => c.drop) : []
    for (const c of chores) expect(prev).not.toContain(c)
  })
})
it('applies the chance as rng() < chance', () => {
  expect(robloxCount(generateDeal(() => 0))).toBe(26)
  expect(robloxCount(generateDeal(() => 0.999))).toBe(0)
})
it('matches the spec odds over many deals', () => {
  const many = Array.from({ length: 3000 }, (_, i) => generateDeal(mulberry32(1000 + i)))
  const mean = many.reduce((s, d) => s + robloxCount(d), 0) / many.length
  expect(mean).toBeGreaterThan(2.8); expect(mean).toBeLessThan(3.2)
  const epicHit = many.filter((d) => d[23].cases[0].drop === 'roblox').length / many.length
  expect(epicHit).toBeGreaterThan(0.93); expect(epicHit).toBeLessThan(0.97)
  const bonus = many.flatMap((d) => d.filter((x) => x.cases.length === 2).map((x) => x.cases[1].grade))
  const epicBonus = bonus.filter((g) => g === 'epic').length / bonus.length
  expect(epicBonus).toBeGreaterThan(0.025); expect(epicBonus).toBeLessThan(0.06)
})
it('accepts generated deals and valid hand edits', () => {
  for (const d of deals) expect(validateDeal(d)).toEqual([])
  const edited = structuredClone(deals[0]); edited[4].cases[0].drop = 'roblox'
  expect(validateDeal(edited)).toEqual([])
})
it.each([
  ['not an array', {}],
  ['23 doors', deals[0].slice(1)],
  ['days out of order', [...deals[0].slice(1), deals[0][0]]],
  ['unknown grade', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [{ grade: 'legendary', drop: 'trash' }] } : d))],
  ['unknown drop', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [{ grade: 'common', drop: 'robux' }] } : d))],
  ['no cases', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [] } : d))],
  ['three cases', deals[0].map((d, i) => (i === 3 ? { ...d, cases: [d.cases[0], d.cases[0], d.cases[0]] } : d))],
])('reports a problem for %s', (_name, value) => {
  expect(validateDeal(value).length).toBeGreaterThan(0)
})
```

- [ ] **Step 3: Run and see them fail**

Run: `npm test` — Expected: FAIL, cannot resolve `./rules.ts`.

- [ ] **Step 4: Implement `types.ts`, `drops.ts`, `rules.ts`**

`generateDeal` algorithm (every random choice uses `rng`, no retry loops, so a constant `rng` terminates):
1. Shuffle 12 common + 7 uncommon + 4 rare (Fisher–Yates, `j = floor(rng() * (i + 1))`) onto doors 1–23; door 24 is epic.
2. Shuffle the list of common doors and take the first two as bonus doors.
3. Bonus grade: `r = rng() * 24`; `< 12` common, `< 19` uncommon, `< 23` rare, else epic.
4. Walk doors in order, main case then bonus case. Drop is `roblox` when `rng() < ROBLOX_CHANCE[grade]`; otherwise a chore chosen uniformly from `CHORE_IDS` minus the chores dropped by the previous door and minus chores already dropped in this door.

`validateDeal` checks structure only (24 doors, days 1..24 in order, 1–2 cases, known grades and drop ids), not the distribution: the parent may hand-edit drops.

- [ ] **Step 5: Run and see them pass**

Run: `npm test && npm run lint && npm run build` — Expected: all pass.

- [ ] **Step 6: Commit** — `Add deal rules`

---

### Task 2: Deal command, Russian strings, first deal

**Files:**
- Create: `src/deal/format.ts`, `scripts/deal.ts`, `src/data/deal.json`, `src/data/deal.ts`
- Test: `src/deal/format.test.ts`
- Modify: `src/i18n/locales/ru.json`, `src/App.tsx` (drop the `app.comingSoon` line), `package.json` (`"deal": "node scripts/deal.ts"`), `tsconfig.node.json` (`"include": ["vite.config.ts", "scripts"]`), `README.md` (document `npm run deal`, `npm test`)

**Interfaces:**
- Consumes: Task 1 exports.
- Produces:
  - `interface DealNames { grade: Record<Grade, string>; drop: Record<DropId, string> }`
  - `formatDeal(deal: Deal, names: DealNames): string`
  - `src/data/deal.ts`: `export const deal: Deal`, `export const dealProblems: string[]` (from `validateDeal` on the imported JSON)
  - i18n keys below; a drop's full text is `drop.<DropId>`, its short label `dropShort.<DropId>`, a grade `rarity.<Grade>`.

- [ ] **Step 1: Replace `ru.json` with the full copy**

```json
{
  "app": { "title": "Адвент-календарь" },
  "rarity": { "common": "Обычный", "uncommon": "Необычный", "rare": "Редкий", "epic": "Эпический" },
  "drop": {
    "roblox": "Донат в Roblox",
    "brushTeeth": "Почистить зубы",
    "cleanRoom": "Убраться в комнате",
    "dishes": "Убрать посуду в посудомойку сразу после еды",
    "makeBed": "Заправить кровать",
    "packBag": "Собрать рюкзак с вечера",
    "homework": "Сделать уроки без напоминаний",
    "trash": "Вынести мусор",
    "toys": "Убрать игрушки на место",
    "laundry": "Положить грязную одежду в корзину для белья",
    "setTable": "Накрыть на стол",
    "waterPlants": "Полить цветы",
    "read": "Почитать книгу 20 минут"
  },
  "dropShort": {
    "roblox": "Roblox", "brushTeeth": "Зубы", "cleanRoom": "Комната", "dishes": "Посуда",
    "makeBed": "Кровать", "packBag": "Рюкзак", "homework": "Уроки", "trash": "Мусор",
    "toys": "Игрушки", "laundry": "Одежда", "setTable": "Стол", "waterPlants": "Цветы", "read": "Книга"
  },
  "calendar": { "gifts": "Мои подарки" },
  "stage": {
    "caseTitle": "{{grade}} кейс",
    "tapToOpen": "Тапни, чтобы открыть",
    "bonus": "Бонусный кейс!",
    "collect": "Забрать"
  },
  "gifts": { "title": "Мои подарки", "empty": "Здесь появятся твои подарки", "back": "Назад", "bonus": "бонус" },
  "date": { "dec": "{{day}} декабря" }
}
```

- [ ] **Step 2: Write the failing test** in `src/deal/format.test.ts`

```ts
const names: DealNames = {
  grade: { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический' },
  drop: Object.fromEntries(DROP_IDS.map((id) => [id, id])) as Record<DropId, string>,
}
it('prints one line per door, bonus cases inline, then the Roblox total', () => {
  const deal: Deal = [
    { day: 1, cases: [{ grade: 'common', drop: 'trash' }] },
    { day: 12, cases: [{ grade: 'common', drop: 'toys' }, { grade: 'rare', drop: 'roblox' }] },
  ]
  expect(formatDeal(deal, names).split('\n')).toEqual([
    ' 1  Обычный: trash',
    '12  Обычный: toys  +  Редкий: roblox',
    '',
    'Roblox: 1',
  ])
})
```

- [ ] **Step 3: Run and see it fail** — `npm test` → FAIL, cannot resolve `./format.ts`.

- [ ] **Step 4: Implement `formatDeal`, then `scripts/deal.ts`**

The script: with no flag, `generateDeal(Math.random)`, write `src/data/deal.json` (2-space JSON, trailing newline), print `formatDeal`. With `--show`, read the file, print `validateDeal` problems and exit 1 if any, else print `formatDeal`. Names come from reading `src/i18n/locales/ru.json` with `fs` (`rarity` and `drop` objects). Resolve paths from `import.meta.dirname`.

- [ ] **Step 5: Run the command and check the output**

Run: `npm test`, then `npm run deal`, then `npm run deal -- --show`.
Expected: tests pass; both commands print the same 24 lines in Russian and a `Roblox: N` total; `src/data/deal.json` exists with 24 entries.

- [ ] **Step 6: Implement `src/data/deal.ts`, verify, commit**

Run: `npm test && npm run lint && npm run build` — Expected: all pass.
Commit: `Add deal command and first deal`

---

### Task 3: Calendar logic and opened-doors store

**Files:**
- Create: `src/calendar/logic.ts`, `src/calendar/openedStore.ts`
- Test: `src/calendar/logic.test.ts`, `src/calendar/openedStore.test.ts`

**Interfaces:**
- Consumes: `Deal`, `Grade`, `DropId`.
- Produces (`logic.ts`):
  - `type DoorState = 'locked' | 'available' | 'opened'`
  - `doorState(day: number, now: Date, opened: ReadonlySet<number>): DoorState`
  - `interface Gift { day: number; grade: Grade; drop: DropId; bonus: boolean }`
  - `giftList(deal: Deal, opened: ReadonlySet<number>): Gift[]` — door order, main case then bonus
  - `resolveNow(realNow: Date, search: string, dev: boolean): Date`
- Produces (`openedStore.ts`):
  - `STORAGE_KEY = 'advent2026.opened'`
  - `type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>`
  - `loadOpened(storage: StorageLike): Set<number>`
  - `saveOpened(storage: StorageLike, opened: ReadonlySet<number>): void` — stored as a JSON array

- [ ] **Step 1: Write the failing tests**

`logic.test.ts` (dates are local time, `new Date(y, monthIndex, d, h, m)`):

```ts
const none = new Set<number>()
it('locks everything before 1 December 2026', () => {
  expect(doorState(1, new Date(2026, 10, 30, 23, 59), none)).toBe('locked')
  expect(doorState(10, new Date(2025, 11, 20), none)).toBe('locked')
})
it('opens door N at local midnight on N December', () => {
  expect(doorState(1, new Date(2026, 11, 1, 0, 0), none)).toBe('available')
  expect(doorState(5, new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(6, new Date(2026, 11, 5, 23, 59), none)).toBe('locked')
})
it('keeps missed doors available, also after the 24th', () => {
  expect(doorState(3, new Date(2026, 11, 5, 12), none)).toBe('available')
  expect(doorState(24, new Date(2027, 0, 10), none)).toBe('available')
})
it('reports opened doors as opened', () => {
  expect(doorState(3, new Date(2026, 11, 5), new Set([3]))).toBe('opened')
})
it('lists gifts of opened doors in order, bonus flagged', () => {
  const deal: Deal = [
    { day: 1, cases: [{ grade: 'common', drop: 'trash' }] },
    { day: 2, cases: [{ grade: 'common', drop: 'toys' }, { grade: 'rare', drop: 'roblox' }] },
    { day: 3, cases: [{ grade: 'rare', drop: 'read' }] },
  ]
  expect(giftList(deal, new Set([2, 1]))).toEqual([
    { day: 1, grade: 'common', drop: 'trash', bonus: false },
    { day: 2, grade: 'common', drop: 'toys', bonus: false },
    { day: 2, grade: 'rare', drop: 'roblox', bonus: true },
  ])
})
it('overrides the date only in development', () => {
  const real = new Date(2026, 10, 23, 9)
  expect(resolveNow(real, '?date=2026-12-05', true)).toEqual(new Date(2026, 11, 5, 12))
  expect(resolveNow(real, '?date=2026-12-05', false)).toBe(real)
  expect(resolveNow(real, '?date=nonsense', true)).toBe(real)
  expect(resolveNow(real, '', true)).toBe(real)
})
```

`openedStore.test.ts`, using a `Map`-backed fake `StorageLike`:

```ts
it('round-trips the opened set', () => { /* save {1,5} then load → {1,5} */ })
it.each([
  ['nothing stored', null],
  ['invalid JSON', '{oops'],
  ['not an array', '{"a":1}'],
])('loads an empty set when %s', (_n, raw) => { /* expect size 0 */ })
it('drops entries that are not door numbers', () => {
  // stored '[1,"2",0,25,3.5,7,7]' → Set {1, 7}
})
it('survives storage that throws', () => {
  const broken: StorageLike = { getItem() { throw new Error('denied') }, setItem() { throw new Error('quota') }, removeItem() {} }
  expect(loadOpened(broken).size).toBe(0)
  expect(() => saveOpened(broken, new Set([1]))).not.toThrow()
})
```

- [ ] **Step 2: Run and see them fail** — `npm test` → FAIL, modules not found.

- [ ] **Step 3: Implement both modules**

`resolveNow` returns local noon of the `date=YYYY-MM-DD` parameter when `dev` is true and the value is a real date; otherwise `realNow` itself.

- [ ] **Step 4: Run and see them pass** — `npm test && npm run lint && npm run build`.

- [ ] **Step 5: Commit** — `Add calendar logic and opened-doors store`

---

### Task 4: Opening flow and stage with a plain reveal

**Files:**
- Create: `src/opening/flow.ts`, `src/opening/OpeningStage.tsx`, `src/opening/CaseBox.tsx`, `src/components/DropCard.tsx`, plus their CSS
- Test: `src/opening/flow.test.ts`, `src/opening/OpeningStage.test.tsx`
- Modify: `src/index.css` (grade colour variables)

**Interfaces:**
- Consumes: `DealDoor`, `DropId`, `Grade`, `DROP_ICONS`, i18n keys `stage.*`, `rarity.*`, `drop.*`, `dropShort.*`.
- Produces:
  - `type Phase = 'case' | 'spinning' | 'revealed'`
  - `interface FlowState { caseIndex: number; phase: Phase; done: boolean }`
  - `type FlowAction = 'tapCase' | 'reelStopped' | 'collect'`
  - `initialFlow: FlowState` (`{ caseIndex: 0, phase: 'case', done: false }`)
  - `flowReducer(state: FlowState, action: FlowAction, caseCount: number): FlowState` — returns the same object for an action that does not apply
  - `OpeningStage(props: { door: DealDoor; onOpened: (day: number) => void; onClose: () => void })`
  - `CaseBox(props: { grade: Grade; onTap: () => void })` — a `<button data-testid="case">`
  - `DropCard(props: { drop: DropId; variant: 'reel' | 'door' | 'reveal' })` — `reveal` shows the full text, the others the short label; Roblox is gold
  - The collect button is `<button data-testid="collect">`.

- [ ] **Step 1: Write the failing tests**

`flow.test.ts`:

```ts
it('walks a single case: tap, stop, collect, done', () => {
  let s = flowReducer(initialFlow, 'tapCase', 1); expect(s.phase).toBe('spinning')
  s = flowReducer(s, 'reelStopped', 1); expect(s.phase).toBe('revealed')
  s = flowReducer(s, 'collect', 1); expect(s.done).toBe(true)
})
it('moves to the bonus case after collecting the first', () => {
  let s = flowReducer(flowReducer(flowReducer(initialFlow, 'tapCase', 2), 'reelStopped', 2), 'collect', 2)
  expect(s).toEqual({ caseIndex: 1, phase: 'case', done: false })
  s = flowReducer(flowReducer(flowReducer(s, 'tapCase', 2), 'reelStopped', 2), 'collect', 2)
  expect(s.done).toBe(true)
})
it('ignores taps that do not apply', () => {
  const spinning = flowReducer(initialFlow, 'tapCase', 2)
  expect(flowReducer(spinning, 'tapCase', 2)).toBe(spinning)
  expect(flowReducer(spinning, 'collect', 2)).toBe(spinning)
  expect(flowReducer(initialFlow, 'collect', 2)).toBe(initialFlow)
  expect(flowReducer(initialFlow, 'reelStopped', 2)).toBe(initialFlow)
  const done = flowReducer(flowReducer(spinning, 'reelStopped', 1), 'collect', 1)
  expect(flowReducer(done, 'collect', 1)).toBe(done)
})
```

`OpeningStage.test.tsx` (first line `// @vitest-environment jsdom`, imports `../i18n`):

```tsx
const door: DealDoor = { day: 7, cases: [{ grade: 'common', drop: 'trash' }, { grade: 'rare', drop: 'roblox' }] }
it('records the door as opened on the first case tap, before the reveal', () => {
  const onOpened = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={() => {}} />)
  expect(onOpened).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('case'))
  expect(onOpened).toHaveBeenCalledExactlyOnceWith(7)
})
it('runs the bonus case without recording again, then closes', () => {
  const onOpened = vi.fn(), onClose = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={onClose} />)
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(screen.getByText('Бонусный кейс!')).toBeTruthy()
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(onOpened).toHaveBeenCalledTimes(1)
  expect(onClose).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run and see them fail** — `npm test` → FAIL, modules not found.

- [ ] **Step 3: Implement**

`OpeningStage` is a full-screen overlay driven by `flowReducer`. Phase `case`: `CaseBox` with the title `stage.caseTitle` (grade from `rarity.*`), the hint `stage.tapToOpen`, and `stage.bonus` above it when `caseIndex > 0`. On the case tap: call `onOpened(door.day)` if `caseIndex === 0`, then dispatch `tapCase`. For this task there is no reel: dispatch `reelStopped` in the same handler. Phase `revealed`: `DropCard variant="reveal"` and the collect button (`stage.collect`). When the state becomes `done`, call `onClose`.

- [ ] **Step 4: Run and see them pass** — `npm test && npm run lint && npm run build`.

- [ ] **Step 5: Commit** — `Add opening flow and stage with plain reveal`

---

### Task 5: Calendar, doors, gifts, app wiring

**Files:**
- Create: `src/calendar/useOpened.ts`, `src/calendar/useNow.ts`, `src/screens/CalendarScreen.tsx`, `src/screens/Door.tsx`, `src/screens/GiftsScreen.tsx`, plus their CSS
- Test: `src/calendar/useNow.test.tsx`
- Modify: `src/App.tsx`, `src/index.css`

**Interfaces:**
- Consumes: `deal`, `dealProblems`, `doorState`, `giftList`, `resolveNow`, `loadOpened`, `saveOpened`, `OpeningStage`, `DropCard`.
- Produces:
  - `useOpened(): { opened: ReadonlySet<number>; markOpened: (day: number) => void; resetOpened: () => void }` — over `window.localStorage`
  - `useNow(getNow: () => Date): Date` — re-reads `getNow` on `visibilitychange` and every 60 s
  - `CalendarScreen(props: { deal: Deal; now: Date; opened: ReadonlySet<number>; onOpenDoor: (day: number) => void; onShowGifts: () => void })`
  - `Door(props: { door: DealDoor; state: DoorState; onTap: () => void })`
  - `GiftsScreen(props: { gifts: Gift[]; onBack: () => void })`

- [ ] **Step 1: Write the failing test** in `src/calendar/useNow.test.tsx` (`// @vitest-environment jsdom`)

```tsx
it('re-reads the clock when the app comes back to the foreground', () => {
  let current = new Date(2026, 11, 4, 22)
  const { result } = renderHook(() => useNow(() => current))
  expect(result.current).toEqual(new Date(2026, 11, 4, 22))
  current = new Date(2026, 11, 5, 7)
  act(() => { document.dispatchEvent(new Event('visibilitychange')) })
  expect(result.current).toEqual(new Date(2026, 11, 5, 7))
})
it('re-reads the clock every minute', () => {
  vi.useFakeTimers()
  let current = new Date(2026, 11, 4, 23, 59, 30)
  const { result } = renderHook(() => useNow(() => current))
  current = new Date(2026, 11, 5, 0, 0, 30)
  act(() => { vi.advanceTimersByTime(60_000) })
  expect(result.current).toEqual(new Date(2026, 11, 5, 0, 0, 30))
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run and see it fail** — `npm test` → FAIL, `./useNow` not found.

- [ ] **Step 3: Implement the hooks, then the screens and `App`**

Behaviour the screens must have (from the spec):
- `App` holds `screen: 'calendar' | 'gifts'` and `openingDay: number | null`; no router. `now` comes from `useNow(() => resolveNow(new Date(), location.search, import.meta.env.DEV))`.
- In development, when `dealProblems` is non-empty, `App` renders the problems instead of the calendar.
- Calendar: all 24 doors in number order; 4 columns in portrait, 6 in landscape (`@media (orientation: landscape)`); sized to fit one screen without scrolling. A button with `calendar.gifts` opens the gifts screen.
- Locked door: number only; a tap gives a small shake. The grade is never shown on a closed door.
- Available door: glows; a tap calls `onOpenDoor`, and `App` shows `OpeningStage` for that door with `onOpened={markOpened}`.
- Opened door: stands open showing each case's `DropCard variant="door"`; a tap shows a quiet detail card with the full text (`drop.*`), grade (`rarity.*`) and date (`date.dec`). No reel.
- Gifts: one row per `Gift` — date, grade, icon, full text, `gifts.bonus` tag on bonus rows, Roblox rows in gold; `gifts.empty` when the list is empty; `gifts.back` returns.
- In development only (`import.meta.env.DEV`), the calendar shows a small reset control that calls `resetOpened`.

Before styling, invoke the `frontend-design:frontend-design` skill. Direction from the spec: bold and game-like, dark winter backdrop, chunky rounded shapes, glowing grade colours.

- [ ] **Step 4: Verify**

Run: `npm test && npm run lint && npm run build` — Expected: all pass.
Run: `npm run dev`, open `http://localhost:5173/?date=2026-12-05`.
Expected: doors 1–5 glow, 6–24 are locked; opening door 1 shows the case, the plain reveal, and returns to a calendar with door 1 open; reloading keeps it open; «Мои подарки» lists it; without `?date=` every door is locked.

- [ ] **Step 5: Commit** — `Add calendar, doors and gifts screens`

**Checkpoint for the human:** look at the calendar in a browser before going on.

---

### Task 6: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts`, `README.md`

**Interfaces:**
- Produces: a public URL `https://<user>.github.io/<repository>/`.

- [ ] **Step 1: Make the build path-independent**

In `vite.config.ts` set `base: './'`, and in the PWA manifest `start_url: '.'` and `scope: '.'`.

- [ ] **Step 2: Verify the build works from a sub-path**

Run: `npm run build`, copy `dist` into an `advent` sub-folder of a temporary folder outside the repository, serve that temporary folder with `npx serve`, then request `/advent/`, `/advent/manifest.webmanifest`, `/advent/sw.js` and every `src`/`href` in `/advent/index.html`.
Expected: all return 200; `dist/index.html` contains no `src="/` or `href="/`; the manifest's icon paths are relative.

- [ ] **Step 3: Write the workflow**

On push to `main` and manual dispatch: check out, set up Node 24 with npm cache, `npm ci`, `npm test`, `npm run build`, upload `dist` as the Pages artifact, deploy to Pages. Permissions `contents: read`, `pages: write`, `id-token: write`; one concurrent `pages` deployment. Use the current major version of each official action (check each action's README rather than guessing).

- [ ] **Step 4: Commit** — `Add GitHub Pages deployment`

- [ ] **Step 5: STOP and ask the human before anything leaves the machine**

Ask for: the repository name, and explicit go-ahead to create a public GitHub repository and push. Then create it, enable Pages with source "GitHub Actions", push `main`, and wait for the workflow to finish green.

- [ ] **Step 6: Verify the live site and hand over the device checklist**

Expected: the Pages URL loads the calendar. Then the human checks on both devices: install to the home screen (iPad: Share → Add to Home Screen; Android: Install app), open from the icon, switch to airplane mode, reopen, and see the calendar.

---

### Task 7: The reel

**Files:**
- Create: `src/opening/reel.ts`, `src/opening/Reel.tsx`, CSS
- Test: `src/opening/reel.test.ts`
- Modify: `src/opening/OpeningStage.tsx`, `src/opening/OpeningStage.test.tsx`

**Interfaces:**
- Consumes: `DropId`, `CHORE_IDS`, `Rng`, `DropCard`, `flowReducer`.
- Produces (`reel.ts`):
  - `CARD_W = 96`, `CARD_GAP = 8`, `WIN_INDEX = 34`, `STRIP_LEN = 48`, `GOLD_SHARE = 0.14`, `SPIN_MS = 5200`, `SPIN_EASE = [0.08, 0.72, 0.1, 1]`
  - `reelOffset(viewportWidth: number, jitter: number): number` — the final `translateX` in px (negative); `jitter` in `[-1, 1]`
  - `buildStrip(win: DropId, rng: Rng): DropId[]`
- Produces (`Reel.tsx`): `Reel(props: { win: DropId; onStop: () => void; onTick?: () => void })`

- [ ] **Step 1: Write the failing tests** in `src/opening/reel.test.ts`

```ts
const STEP = CARD_W + CARD_GAP
it.each([320, 390, 820, 1366])('stops the marker on the winning card at width %i', (vw) => {
  for (const jitter of [-1, 0, 1]) {
    const marker = vw / 2 - reelOffset(vw, jitter) // marker position in strip coordinates
    expect(marker).toBeGreaterThanOrEqual(WIN_INDEX * STEP + 8)
    expect(marker).toBeLessThanOrEqual(WIN_INDEX * STEP + CARD_W - 8)
  }
})
it.each([320, 390, 820, 1366])('leaves no empty strip visible at width %i', (vw) => {
  for (const jitter of [-1, 1]) expect(STRIP_LEN * STEP + reelOffset(vw, jitter)).toBeGreaterThanOrEqual(vw)
})
it('builds a strip with the drop on the winning index', () => {
  const strip = buildStrip('trash', mulberry32(1))
  expect(strip).toHaveLength(STRIP_LEN)
  expect(strip[WIN_INDEX]).toBe('trash')
  expect(buildStrip('roblox', () => 0.5)[WIN_INDEX]).toBe('roblox')
})
it('mixes gold cards into the filler by GOLD_SHARE', () => {
  expect(buildStrip('trash', () => 0.5).filter((d) => d === 'roblox')).toHaveLength(0)
  expect(buildStrip('trash', () => 0).filter((d) => d === 'roblox')).toHaveLength(STRIP_LEN - 1)
})
```

- [ ] **Step 2: Run and see them fail** — `npm test` → FAIL, `./reel.ts` not found.

- [ ] **Step 3: Implement `reel.ts`**

`reelOffset = -(WIN_INDEX * STEP + CARD_W / 2 - viewportWidth / 2 + jitter * (CARD_W / 2 - 8))`. Filler cards: `rng() < GOLD_SHARE` gives `roblox`, otherwise a uniformly chosen chore.

- [ ] **Step 4: Implement `Reel.tsx` and put it into the stage**

`Reel` renders a window with a centre marker and the strip of `DropCard variant="reel"`. On mount it measures its own width, builds the strip with `Math.random`, and animates the strip's `x` with Motion from 0 to `reelOffset(width, random jitter)` over `SPIN_MS` with `SPIN_EASE`. It calls `onTick` each time the card under the marker changes, then highlights the winning card for about 0.7 s and calls `onStop` once. In `OpeningStage`, phase `spinning` now shows `Reel` and `onStop` dispatches `reelStopped` (remove the immediate dispatch from Task 4).

- [ ] **Step 5: Update the stage test for the real reel**

In `OpeningStage.test.tsx`, mock the reel so the test controls when it stops, and click it between each case tap and collect:

```tsx
vi.mock('./Reel', () => ({
  Reel: ({ onStop }: { onStop: () => void }) => <button data-testid="reel-stop" onClick={onStop} />,
}))
```

Add: after the first case tap and before `reel-stop` is clicked, `screen.queryByTestId('collect')` is `null` and `onOpened` has already been called once (Review Focus 1); a second click on a still-mounted case does not call `onOpened` again.

- [ ] **Step 6: Verify**

Run: `npm test && npm run lint && npm run build` — Expected: all pass.
Run: `npm run dev`, open `/?date=2026-12-24`, open a door.
Expected: the reel runs about 5 s, slows smoothly, stops with the marker on the card that is then revealed; gold cards pass by; a bonus door spins twice; reloading mid-spin shows the door already opened.

- [ ] **Step 7: Commit** — `Add reel case opening`

**Checkpoint for the human:** feel the reel on a real phone and the iPad.

---

### Task 8: Sound

**Files:**
- Create: `src/sound/sound.ts`
- Test: `src/sound/sound.test.ts`
- Modify: `src/opening/OpeningStage.tsx`, `src/screens/Door.tsx`

**Interfaces:**
- Produces: `unlockAudio(): void`, `playTick(): void`, `playFanfare(big: boolean): void`. All three are safe no-ops when Web Audio is missing or blocked.

- [ ] **Step 1: Write the failing test** (default node environment, where `AudioContext` does not exist)

```ts
it('does nothing, without throwing, when audio is unavailable', () => {
  expect(() => { unlockAudio(); playTick(); playFanfare(false); playFanfare(true) }).not.toThrow()
})
```

- [ ] **Step 2: Run and see it fail** — `npm test` → FAIL, `./sound` not found.

- [ ] **Step 3: Implement and wire**

One lazily created `AudioContext`. `unlockAudio` creates or resumes it and must be called inside a tap handler (iOS): call it on the available-door tap and on the case tap. `playTick`: a blip of about 30 ms near 1200 Hz at low gain, with at least 40 ms between ticks. `playFanfare(false)`: three rising notes, about 0.4 s. `playFanfare(true)`: five rising notes ending on a held chord, about 1.2 s. Pass `playTick` as the reel's `onTick`; play the fanfare when the phase becomes `revealed`, `big` when the drop is `roblox`.

- [ ] **Step 4: Verify** — `npm test && npm run lint && npm run build`; in the browser, ticks follow the cards and slow with them; Roblox gets the longer fanfare.

- [ ] **Step 5: Commit** — `Add reel sounds`

---

### Task 9: Polish

**Files:**
- Modify: `src/opening/OpeningStage.tsx`, `src/screens/Door.tsx`, `src/screens/CalendarScreen.tsx`, CSS; `package.json` (`canvas-confetti`, `@types/canvas-confetti`)

**Interfaces:**
- Consumes: everything above. Produces no new interfaces.

- [ ] **Step 1: Add the remaining spec visuals**

- Roblox reveal: gold card, slowly rotating rays behind it, and a confetti burst (`canvas-confetti`).
- Door swing: an available door swings open (Motion, 3D rotate on its hinge edge) before the stage appears; an opened door rests in the open position.
- Case entrance: the case drops into the stage with a bounce; the bonus case does the same under the `stage.bonus` banner.
- Falling snow on the calendar backdrop, light enough to keep scrolling and taps smooth on the phone.
- Under `@media (prefers-reduced-motion: reduce)`: no snow, no rays rotation; the reel still runs.

- [ ] **Step 2: Verify** — `npm test && npm run lint && npm run build` pass; walk through `/?date=2026-12-24` in the browser: every door opens, both bonus doors spin twice, the gifts list matches `npm run deal -- --show`.

- [ ] **Step 3: Commit and push** — `Polish reveal, doors and backdrop`; the push redeploys the site.

**Checkpoint for the human:** final pass on both devices before 1 December.
