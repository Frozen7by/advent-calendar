// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '../i18n/index.ts'
import type { DealDoor } from '../deal/types.ts'
import { OpeningStage } from './OpeningStage.tsx'

afterEach(cleanup)

const door: DealDoor = {
  day: 7,
  cases: [
    { grade: 'common', drop: 'trash' },
    { grade: 'rare', drop: 'roblox' },
  ],
}

it('records the door as opened on the first case tap, before the reveal', () => {
  const onOpened = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={() => {}} />)
  expect(onOpened).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('case'))
  expect(onOpened).toHaveBeenCalledExactlyOnceWith(7)
})

it('runs the bonus case without recording again, then closes', () => {
  const onOpened = vi.fn()
  const onClose = vi.fn()
  render(<OpeningStage door={door} onOpened={onOpened} onClose={onClose} />)
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(screen.getByText('Бонусный кейс!')).toBeTruthy()
  fireEvent.click(screen.getByTestId('case'))
  fireEvent.click(screen.getByTestId('collect'))
  expect(onOpened).toHaveBeenCalledTimes(1)
  expect(onClose).toHaveBeenCalledTimes(1)
})
