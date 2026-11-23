# Advent Calendar

A frontend-only advent calendar PWA for a child: doors hide cases of four grades,
cases drop chores and the occasional reward. See [docs/requirements.md](docs/requirements.md).

## Stack

- Vite + React + TypeScript
- Motion for animation
- i18next / react-i18next — strings live in `src/i18n/locales/ru.json` (Russian is the source language)
- vite-plugin-pwa — installable, offline, icons generated from `public/favicon.svg`

## Commands

```sh
npm run dev      # dev server
npm run build    # type-check and build to dist/
npm run preview  # serve the production build (use this to test the PWA)
npm run lint     # oxlint
npm test         # unit tests (Vitest)
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: tests, build, publish
to GitHub Pages. The build uses relative paths, so it works from the
`/<repository>/` sub-path Pages serves it from.

## The deal

Every door's case grade and drop is fixed in advance: December's 24 doors in
`src/data/deal.json`, the eight extra doors for 23–30 November in
`src/data/november.json`. The November doors come first on the calendar and
open on their own November dates.

```sh
npm run deal                 # deal a new December, overwrite deal.json, print it
npm run deal -- --november   # deal new November doors, overwrite november.json, print them
npm run deal -- --show       # print both months and their Roblox totals
```

The November doors follow the December odds, with one difference: each door's
grade is drawn at random (12 : 7 : 4 : 1), so there are no bonus cases and no
guaranteed epic.

The files can be edited by hand, for example to move a Roblox drop to another
day, to give a door a second (bonus) case, or to place a prize that is never
dealt at random (`TREAT_IDS` in `src/deal/drops.ts`, e.g. `plainSandwich`). Run `npm run deal -- --show` afterwards to check they are still valid.

Once a month's first door is open (23 November for `november.json`,
1 December for `deal.json`):

- Never run `npm run deal` again, and only edit doors that are not opened yet.
  Opened doors and «Мои подарки» read this file, so their drops would change.
- After deploying a changed deal, open the app on each device while online,
  wait a few seconds, then close it fully and open it again. The first launch
  after a deploy still runs the previous version while the new one downloads.
