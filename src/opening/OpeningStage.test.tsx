// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '../i18n/index.ts'
import type { CalendarDoor } from '../calendar/logic.ts'
import { OpeningStage } from './OpeningStage.tsx'

// The real reel takes five seconds of animation; the test decides when it stops.
vi.mock('./Reel.tsx', () => ({
  Reel: ({ onStop }: { onStop: () => void }) => <button data-testid="reel-stop" onClick={onStop} />,
}))

// Confetti draws on a canvas, which jsdom does not implement.
vi.mock('./celebrate.ts', () => ({ celebrate: () => {} }))

afterEach(cleanup)

const door: CalendarDoor = {
  id: '2026-12-07',
  month: 12,
  day: 7,
  cases: [
    { grade: 'common', drop: 'trash' },
    { grade: 'rare', drop: 'roblox10' },
  ],
}

it('records the door as opened on the first case tap, before the reel stops', () => {
  const onOpened = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={() => {}} />)
  expect(onOpened).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('case'))
  expect(onOpened).toHaveBeenCalledExactlyOnceWith('2026-12-07')
  expect(screen.getByTestId('reel-stop')).toBeTruthy()
  expect(screen.queryByTestId('collect')).toBeNull()
})

it('records only once when the case is tapped twice', () => {
  const onOpened = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={() => {}} />)
  const box = screen.getByTestId('case')
  fireEvent.click(box)
  fireEvent.click(box)
  expect(onOpened).toHaveBeenCalledTimes(1)
})

it('says the chore is the child’s own to do, and the prize the child’s own to get', () => {
  render(<OpeningStage door={door} onOpened={() => {}} onClose={() => {}} />)
  fireEvent.click(screen.getByTestId('case'))
  expect(screen.queryByText('Это задание выполняешь ты')).toBeNull()
  fireEvent.click(screen.getByTestId('reel-stop'))
  expect(screen.getByText('Это задание выполняешь ты')).toBeTruthy()
  expect(screen.queryByText('Этот приз получаешь ты')).toBeNull()
  fireEvent.click(screen.getByTestId('collect'))
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('reel-stop'))
  expect(screen.getByText('Этот приз получаешь ты')).toBeTruthy()
  expect(screen.queryByText('Это задание выполняешь ты')).toBeNull()
})

it('runs the bonus case without recording again, then closes', () => {
  const onOpened = vi.fn()
  const onClose = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={onClose} />)
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('reel-stop'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(screen.getByText('Бонусный кейс!')).toBeTruthy()
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('reel-stop'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(onOpened).toHaveBeenCalledTimes(1)
  expect(onClose).toHaveBeenCalledTimes(1)
})
