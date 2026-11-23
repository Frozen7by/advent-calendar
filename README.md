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
```
