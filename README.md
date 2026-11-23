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

## The deal

Every door's case grade and drop is fixed in advance in `src/data/deal.json`.

```sh
npm run deal            # deal a new month, overwrite the file, print it
npm run deal -- --show  # print the current month and its Roblox total
```

The file can be edited by hand, for example to move a Roblox drop to another
day. Run `npm run deal -- --show` afterwards to check it is still valid.
