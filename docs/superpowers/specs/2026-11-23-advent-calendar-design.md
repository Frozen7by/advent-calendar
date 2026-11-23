# Advent calendar with case openings — design

Date: 2026-11-23. Customer requirements: [docs/requirements.md](../../requirements.md).

Items marked **(call)** were decided by the designer, not the customer, and can
be overruled. Everything else was decided by the customer in conversation.

## Intent

A parent is building an advent calendar for their child, who likes Roblox and
Brawl Stars. Each day in December the child opens a door and gets a game-style
case opening. Most drops are everyday chores; the rare good drop is a Roblox
donation from the parent. The child later shows the parent what they got. The
case opening is the centrepiece and should feel exciting.

The first door opens on 1 December 2026, eight days after this design. A plain
but complete version must be on the devices before then; polish comes after.

## Goals

- 24 doors, one per day, 1–24 December 2026.
- Each door hides a case of one of four grades; opening it plays a reel
  animation that lands on the drop.
- Every drop is kept on a «Мои подарки» page the child can show the parent.
- Runs as an installed PWA on an iPad and an Android phone, offline, with no
  backend.
- All UI text in Russian through i18next.

## Non-goals

- Marking chores as done, a parent mode, or notifying the parent.
- Syncing state between devices.
- More than one child, more than one language, or reuse for another year.
- Roblox amounts. The drop is just «Донат в Roblox»; the amount is between
  parent and child.
- Real security. The deal file and the device clock can be tampered with by
  someone technical. That is acceptable against a child.

## Anti-goals

- The child can re-roll a drop by reloading, clearing data, reinstalling, or
  using the other device.
- The opening animation replays for a door already opened on that device.
- The app copies the look, artwork, names or sounds of CS:GO or Brawl Stars.
  Only the general mechanic (a decelerating reel of cards) is shared; all
  visuals and sounds are original.

## Constraints

- Frontend only: Vite, React, TypeScript, Motion, i18next, vite-plugin-pwa
  (already scaffolded and committed).
- iPad Safari and Android Chrome, portrait and landscape, touch only.
- iOS plays no sound before the first touch.
- No designer and no purchased assets: visuals are CSS/SVG/emoji, sounds are
  synthesised in code.

## Approaches considered

1. **Page elements animated with Motion — chosen.** The reel is a row of card
   elements slid sideways with an easing curve; a small confetti library adds
   the Roblox celebration. A throwaway browser sketch built this way was shown
   to the customer and its feel was approved. Uses the installed stack, keeps
   Russian text as real text, runs smoothly on both devices.
2. **Game-style canvas (PixiJS).** Allows motion blur, glow and thousands of
   particles, but adds a second rendering model beside React and roughly
   doubles the work on the centrepiece. Rejected for the timeline.
3. **Designer-made animation files (Rive).** Most polished, but needs someone
   to draw and animate the case. No designer, eight days. Rejected.

Two other case-opening mechanics were sketched and rejected by the customer in
favour of the reel: tapping the case until it bursts, and picking one of three
face-down cards.

## The deal

All outcomes are fixed in advance and stored in a deal file committed to the
project. The app reads it and never rolls anything that affects a drop.

### Rules

| Grade | Russian | Doors | Chance of Roblox |
|---|---|---|---|
| common | Обычный | 12 | 1% |
| uncommon | Необычный | 7 | 10% |
| rare | Редкий | 4 | 25% |
| epic | Эпический | 1 | 95% |

- Door 24 is the epic door. The other 23 grades are shuffled across doors 1–23.
- Two of the twelve common doors, chosen at random, carry a **bonus case**: a
  second case opened right after the first. Its grade is random.
  **(call)** The bonus grade is weighted like the doors: 12:7:4:1.
- Each case independently drops Roblox with its grade's chance; otherwise it
  drops a chore picked at random from the chore list.
- **(call)** A chore never repeats the chore from the previous door, and the
  two cases of a bonus door never drop the same chore.
- Expected Roblox drops per month: about 3. A given deal can have more or
  fewer; nothing is guaranteed, including door 24.

### Deal file

**(call)** `src/data/deal.json`: an array of 24 entries, one per door, each
with the door number and a list of one or two cases; each case has a grade and
a drop id (`roblox` or a chore id). The parent may edit it by hand.

### Deal command

`npm run deal` generates a new random deal, writes the file, and prints the
month: one line per door with grade(s) and drop(s) in Russian, then the Roblox
total. **(call)** `npm run deal -- --show` prints the current file without
re-dealing. **(call)** The script is TypeScript run directly by Node 24, and
shares the rules code with the tests.

**(call)** The app validates the deal file at startup in development (24
doors, known grades and drop ids) so a hand-edit mistake is caught before
deploying.

### Drops

- `roblox` — «Донат в Roblox», the only good drop.
- Chores **(call: this list is a draft for the parent to edit)**:
  почистить зубы; убраться в комнате; убрать посуду в посудомойку сразу после
  еды; заправить кровать; собрать рюкзак с вечера; сделать уроки без
  напоминаний; вынести мусор; убрать игрушки на место; положить грязную одежду
  в корзину для белья; накрыть на стол; полить цветы; почитать книгу 20 минут.
- **(call)** Each drop has an emoji icon, held in code next to the drop ids,
  not in the translation file.

## Behaviour

### Door states

- **Locked** — its date is in the future. Shows the number; tapping does
  nothing beyond a small shake.
- **Available** — its date is today or earlier and it has not been opened on
  this device. It glows and invites a tap. Missed days stay available and get
  the full animation when opened.
- **Opened** — the door stands open and shows its drop (icon and short text,
  gold for Roblox). Tapping shows the full drop text, grade and date quietly,
  with no reel.

**(call)** Door N becomes available at local midnight on N December 2026,
by the device clock. Before 1 December all doors are locked; after 24 December
everything stays available or opened forever.

**(call)** Doors are laid out in number order, 4 columns in portrait and 6 in
landscape, all 24 visible without scrolling where the screen allows.

### Opening a door

1. The child taps an available door. The door swings open and a full-screen
   stage appears with the case, coloured and labelled by its grade. **(call)**
   The grade is not visible on the closed door.
2. The child taps the case. At that moment the door is recorded as opened on
   this device, before any animation runs.
3. The reel spins for about 5 seconds and decelerates onto the drop's card.
   The strip is filled with chore cards and occasional gold Roblox cards, so
   gold cards pass by even when the drop is a chore. The filler is cosmetic and
   may be random.
4. The winning card is highlighted, then shown large. Roblox gets a gold card,
   rotating rays and confetti.
5. The child taps to collect. On a bonus door a second case drops in, announced
   as a bonus, and steps 2–4 repeat for it.
6. The stage closes and the calendar shows the door opened.

If the app is closed after step 2, the door is already opened: its drops,
including an unplayed bonus, are in «Мои подарки» and the animation is not
offered again. **(call)**

### «Мои подарки»

A list of every drop from opened doors, in door order: date, grade, icon and
text, Roblox drops standing out in gold. A bonus door contributes two rows.
Reached from a button on the calendar. Empty state before the first door.

### Saved state

**(call)** The only thing saved is the set of door numbers opened on this
device, in `localStorage`. Drops always come from the deal file, so both
devices show the same drop for the same door, and clearing data only makes the
animations available again with the same results.

### Sound

**(call)** A tick as each card passes the marker, and a short fanfare on the
reveal, bigger for Roblox. Synthesised with Web Audio; no audio files. No mute
control: the device volume buttons are enough.

### Look

**(call)** Bold and game-like rather than cosy: dark winter backdrop, falling
snow, chunky rounded shapes, glowing grade colours — grey-blue common, green
uncommon, blue rare, purple epic, gold for Roblox.

### Testing aid

**(call)** In development only, a `?date=2026-12-05` query parameter overrides
today's date, and a way to clear saved state is available, so the month can be
walked through before December. Neither exists in the production build.

## Structure **(call)**

- **Deal rules** — pure functions: generate a deal from a random source,
  validate a deal. Used by the deal command and by tests. No React.
- **Calendar logic** — pure functions: door state from date, opened set and
  deal; the gift list from opened set and deal.
- **Opened-doors store** — reads and writes the opened set in `localStorage`,
  tolerating missing or corrupt data.
- **Screens** — calendar, opening stage (reel), gifts. Two screens and an
  overlay need no router; a state switch is enough.
- **Sound** — a small module the stage calls for tick and fanfare.

Pure logic gets unit tests (Vitest): deal rules — counts per grade, door 24,
exactly two bonus doors on common doors, no repeated chore on consecutive
doors — plus door states around midnight and month edges, and the store's
handling of bad data.

## Order of work

So that something usable is on the devices before 1 December:

1. Deal rules, deal command, first deal file.
2. Calendar, door states, saved state, «Мои подарки», with a plain instant
   reveal in place of the reel.
3. Deploy and install on both devices.
4. The reel stage, replacing the plain reveal.
5. Polish: sound, snow, confetti, door swing.

## Hosting

GitHub Pages, from a public repository. The customer accepts that the code,
the deal file and the commit email are public with it.

- **(call)** A GitHub Actions workflow builds and publishes on every push to
  `main`.
- A project site is served from a sub-path (`/<repository>/`). **(call)** The
  build uses relative paths (Vite `base`, manifest `scope` and `start_url`,
  service worker scope) so the same build works from a sub-path or a domain
  root.
- Creating the GitHub repository and the first push need the customer's
  go-ahead at the time; they are outward-facing.
- Install and offline use must be checked on both real devices after the
  first deploy, since path mistakes only show up there.

## Left to the builder

- Exact timings, easing curves and visual details of the stage and doors.
- How the reel's stopping position is computed for different screen widths.
- Component and file names within the structure above.
- Whether to use the device vibration on Android as an extra.
