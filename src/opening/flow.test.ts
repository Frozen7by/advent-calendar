import { expect, it } from 'vitest'
import { flowReducer, initialFlow } from './flow.ts'

it('walks a single case: tap, stop, collect, done', () => {
  let s = flowReducer(initialFlow, 'tapCase', 1)
  expect(s.phase).toBe('spinning')
  s = flowReducer(s, 'reelStopped', 1)
  expect(s.phase).toBe('revealed')
  s = flowReducer(s, 'collect', 1)
  expect(s.done).toBe(true)
})

it('moves to the bonus case after collecting the first', () => {
  let s = flowReducer(flowReducer(flowReducer(initialFlow, 'tapCase', 2), 'reelStopped', 2), 'collect', 2)
  expect(s).toEqual({ caseIndex: 1, phase: 'case', done: false })
  s = flowReducer(flowReducer(flowReducer(s, 'tapCase', 2), 'reelStopped', 2), 'collect', 2)
  expect(s.done).toBe(true)
})

it('ignores taps that do not apply', () => {
  const spinning = flowReducer(initialFlow, 'tapCase', 2)
  expect(flowReducer(spinning, 'tapCase', 2)).toBe(spinning)
  expect(flowReducer(spinning, 'collect', 2)).toBe(spinning)
  expect(flowReducer(initialFlow, 'collect', 2)).toBe(initialFlow)
  expect(flowReducer(initialFlow, 'reelStopped', 2)).toBe(initialFlow)
  const done = flowReducer(flowReducer(spinning, 'reelStopped', 1), 'collect', 1)
  expect(flowReducer(done, 'collect', 1)).toBe(done)
})
