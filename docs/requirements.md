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

## Not yet decided

- How many doors there are and which dates they cover.
- Which door gets which case grade.
- The actual drop chances per grade.
- The full list of responsibilities and whether there are other good drops.
- Whether a door can be opened late, and what stops opening doors early.
- How the parent learns what dropped (the app has no backend).
