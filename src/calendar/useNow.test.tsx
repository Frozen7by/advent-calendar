// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useNow } from './useNow.ts'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('re-reads the clock when the app comes back to the foreground', () => {
  let current = new Date(2026, 11, 4, 22)
  const { result } = renderHook(() => useNow(() => current))
  expect(result.current).toEqual(new Date(2026, 11, 4, 22))
  current = new Date(2026, 11, 5, 7)
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current).toEqual(new Date(2026, 11, 5, 7))
})

it('re-reads the clock every minute', () => {
  vi.useFakeTimers()
  let current = new Date(2026, 11, 4, 23, 59, 30)
  const { result } = renderHook(() => useNow(() => current))
  current = new Date(2026, 11, 5, 0, 0, 30)
  act(() => {
    vi.advanceTimersByTime(60_000)
  })
  expect(result.current).toEqual(new Date(2026, 11, 5, 0, 0, 30))
})
