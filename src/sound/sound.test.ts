import { expect, it } from 'vitest'
import { playFanfare, playTick, unlockAudio } from './sound.ts'

// Runs in Node, where AudioContext does not exist — the same as a browser that blocks audio.
it('does nothing, without throwing, when audio is unavailable', () => {
  expect(() => {
    unlockAudio()
    playTick()
    playFanfare(false)
    playFanfare(true)
  }).not.toThrow()
})
