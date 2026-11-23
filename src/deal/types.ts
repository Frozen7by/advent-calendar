import type { DropId } from './drops.ts'

export const GRADES = ['common', 'uncommon', 'rare', 'epic'] as const

export type Grade = (typeof GRADES)[number]

export interface DealCase {
  grade: Grade
  drop: DropId
}

/** One calendar door: its main case, plus a bonus case on two doors. */
export interface DealDoor {
  day: number
  cases: DealCase[]
}

export type Deal = DealDoor[]
