# Advent Calendar — customer high-level requirements

Captured 2026-11-23 from the customer (the parent building the app for their child).

## Purpose

A mobile advent calendar for one child, with impressive ("sick") animations.

## Platform

- Web app built with React, frontend only — no backend.
- Runs on an iPad and an Android smartphone.
- Probably a PWA (installable, opened from the home screen).

## Core mechanic: cases behind doors

- Each calendar door hides a case that the child opens, in the style of case
  openings in CS:GO / Brawl Stars.
- Cases come in four grades: **common**, **uncommon**, **rare**, **epic**.
- Each grade has different chances of a good drop.

## Drops

- **Regular drops** are generic children's responsibilities, for example:
  - brush your teeth
  - clean your room
  - put the dishes in the dishwasher right after a meal
- **Good drop:** "donate to Roblox" (the parent tops up the child's Roblox account).

## Language

- All UI strings go through i18next.
- Russian is the primary language: strings are authored in Russian first.

## Decided later

The door count, grades, drop chances, the reel-style case opening and the
«Мои подарки» page were settled on 2026-11-23. See the design:
[superpowers/specs/2026-11-23-advent-calendar-design.md](superpowers/specs/2026-11-23-advent-calendar-design.md).

## Hosting

- GitHub Pages, from a public repository.

## Changes after the first build (2026-11-23)

These override the design document where they differ.

- The Roblox drop has four amounts: $2, $5, $10 and $20. When a case drops
  Roblox the amount depends on the case grade: common $2 only, uncommon up to
  $5, rare up to $10, epic $10 or $20. Within a grade, smaller amounts are more
  likely (weights 50 : 30 : 15 : 5, a designer call).
- «Убрать игрушки на место» is removed.
- The reading chore is removed (homework was already in the list), and
  «Накрыть на стол» became «Приготовить покушать».
- The reel spins for 10 seconds.
