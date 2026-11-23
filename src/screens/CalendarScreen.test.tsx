// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '../i18n/index.ts'
import { generateDeal, mulberry32 } from '../deal/rules.ts'
import { CalendarScreen } from './CalendarScreen.tsx'

afterEach(cleanup)

const deal = generateDeal(mulberry32(1))
const dec10 = new Date(2026, 11, 10, 12)

function renderCalendar(swingingDay: number | null) {
  const onSwingDoor = vi.fn()
  render(
    <CalendarScreen
      deal={deal}
      now={dec10}
      opened={new Set()}
      swingingDay={swingingDay}
      onSwingDoor={onSwingDoor}
      onOpenDoor={() => {}}
      onShowGifts={() => {}}
    />,
  )
  return onSwingDoor
}

it('starts the swing of an available door when nothing else is opening', () => {
  const onSwingDoor = renderCalendar(null)
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  expect(onSwingDoor).toHaveBeenCalledExactlyOnceWith(4)
})

it('ignores other doors while one door is swinging open', () => {
  const onSwingDoor = renderCalendar(3)
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  fireEvent.click(screen.getByRole('button', { name: '3' }))
  expect(onSwingDoor).not.toHaveBeenCalled()
})

it('does not swing a locked door', () => {
  const onSwingDoor = renderCalendar(null)
  fireEvent.click(screen.getByRole('button', { name: '20' }))
  expect(onSwingDoor).not.toHaveBeenCalled()
})
