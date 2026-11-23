import { expect, it } from 'vitest'
import { mulberry32 } from '../deal/rules.ts'
import { isRoblox } from '../deal/drops.ts'
import { CARD_GAP, CARD_W, SPIN_MS, STRIP_LEN, WIN_INDEX, buildStrip, reelOffset } from './reel.ts'

const STEP = CARD_W + CARD_GAP

it.each([320, 390, 820, 1366])('stops the marker on the winning card at width %i', (vw) => {
  for (const jitter of [-1, 0, 1]) {
    const marker = vw / 2 - reelOffset(vw, jitter) // marker position in strip coordinates
    expect(marker).toBeGreaterThanOrEqual(WIN_INDEX * STEP + 8)
    expect(marker).toBeLessThanOrEqual(WIN_INDEX * STEP + CARD_W - 8)
  }
})

it.each([320, 390, 820, 1366])('leaves no empty strip visible at width %i', (vw) => {
  for (const jitter of [-1, 1]) {
    expect(STRIP_LEN * STEP + reelOffset(vw, jitter)).toBeGreaterThanOrEqual(vw)
  }
})

it('builds a strip with the drop on the winning index', () => {
  const strip = buildStrip('trash', mulberry32(1))
  expect(strip).toHaveLength(STRIP_LEN)
  expect(strip[WIN_INDEX]).toBe('trash')
  expect(buildStrip('roblox20', () => 0.5)[WIN_INDEX]).toBe('roblox20')
})

it('mixes gold cards into the filler by GOLD_SHARE', () => {
  expect(buildStrip('trash', () => 0.5).filter(isRoblox)).toHaveLength(0)
  expect(buildStrip('trash', () => 0).filter(isRoblox)).toHaveLength(STRIP_LEN - 1)
})

it('spins for ten seconds', () => {
  expect(SPIN_MS).toBe(10_000)
})
