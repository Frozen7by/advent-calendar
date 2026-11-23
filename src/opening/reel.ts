import { CHORE_IDS, pickRoblox } from '../deal/drops.ts'
import type { DropId } from '../deal/drops.ts'
import type { Rng } from '../deal/rules.ts'

/** Card geometry in px. Must match `.drop-card--reel` and `.reel__strip` in CSS. */
export const CARD_W = 96
export const CARD_GAP = 8

/** The card the reel lands on, and the strip's length. Cards after the winner keep wide screens filled. */
export const WIN_INDEX = 30
export const STRIP_LEN = 44

/** Share of filler cards that are gold, so Roblox flies past even on a chore drop. */
export const GOLD_SHARE = 0.14

/** Ten seconds of spin over thirty cards: slow enough to see what is on them. */
export const SPIN_MS = 10_000
/** A gentle start (about 9 cards a second, so each card can be read) easing down to a stop. */
export const SPIN_EASE: [number, number, number, number] = [0.2, 0.6, 0.3, 1]

const STEP = CARD_W + CARD_GAP
/** How far from the winning card's centre the marker may land, keeping 8px clear of its edges. */
const MAX_JITTER = CARD_W / 2 - 8

/**
 * The strip's final translateX (negative px) that puts the winning card under
 * the marker in the middle of a window `viewportWidth` wide. `jitter` in
 * [-1, 1] moves the stop off-centre so every spin ends a little differently.
 */
export function reelOffset(viewportWidth: number, jitter: number): number {
  return -(WIN_INDEX * STEP + CARD_W / 2 - viewportWidth / 2 + jitter * MAX_JITTER)
}

/** The cards on the strip: `win` at WIN_INDEX, cosmetic filler everywhere else. */
export function buildStrip(win: DropId, rng: Rng): DropId[] {
  return Array.from({ length: STRIP_LEN }, (_, i) => {
    if (i === WIN_INDEX) return win
    if (rng() < GOLD_SHARE) return pickRoblox(rng())
    return CHORE_IDS[Math.floor(rng() * CHORE_IDS.length)]
  })
}
