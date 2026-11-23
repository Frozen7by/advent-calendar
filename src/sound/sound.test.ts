import { afterEach, expect, it, vi } from 'vitest'
import { playFanfare, playTick, unlockAudio } from './sound.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

// Runs in Node, where AudioContext does not exist — the same as a browser that blocks audio.
it('does nothing, without throwing, when audio is unavailable', () => {
  expect(() => {
    unlockAudio()
    playTick()
    playFanfare(false)
    playFanfare(true)
  }).not.toThrow()
})

// iOS Safari parks the context in a non-standard "interrupted" state after the
// app is backgrounded or the screen is locked.
it('resumes a context that iOS left interrupted', () => {
  const resume = vi.fn(() => Promise.resolve())
  class FakeAudioContext {
    state = 'interrupted'
    resume = resume
  }
  vi.stubGlobal('AudioContext', FakeAudioContext)
  unlockAudio()
  expect(resume).toHaveBeenCalledTimes(1)
})
