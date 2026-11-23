// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '../i18n/index.ts'
import { calendarDoors } from '../calendar/logic.ts'
import { generateDeal, generateNovember, mulberry32 } from '../deal/rules.ts'
import { CalendarScreen } from './CalendarScreen.tsx'

afterEach(cleanup)

const doors = calendarDoors(generateNovember(mulberry32(2)), generateDeal(mulberry32(1)))
const dec10 = new Date(2026, 11, 10, 12)

function renderCalendar(swingingDoor: string | null, now = dec10) {
  const onSwingDoor = vi.fn()
  render(
    <CalendarScreen
      doors={doors}
      now={now}
      opened={new Set()}
      swingingDoor={swingingDoor}
      onSwingDoor={onSwingDoor}
      onOpenDoor={() => {}}
      onShowGifts={() => {}}
    />,
  )
  return onSwingDoor
}

it('shows the eight November doors before the 24 December doors', () => {
  renderCalendar(null)
  const names = screen.getAllByRole('button', { name: /ноября|декабря/ }).map((b) => b.getAttribute('aria-label'))
  expect(names).toHaveLength(32)
  expect(names.slice(0, 9)).toEqual([
    '23 ноября',
    '24 ноября',
    '25 ноября',
    '26 ноября',
    '27 ноября',
    '28 ноября',
    '29 ноября',
    '30 ноября',
    '1 декабря',
  ])
  expect(names[31]).toBe('24 декабря')
})

it('unlocks the November doors from 23 November', () => {
  const onSwingDoor = renderCalendar(null, new Date(2026, 10, 25, 9))
  fireEvent.click(screen.getByRole('button', { name: '26 ноября' }))
  fireEvent.click(screen.getByRole('button', { name: '1 декабря' }))
  expect(onSwingDoor).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '23 ноября' }))
  expect(onSwingDoor).toHaveBeenCalledExactlyOnceWith('2026-11-23')
})

it('starts the swing of an available door when nothing else is opening', () => {
  const onSwingDoor = renderCalendar(null)
  fireEvent.click(screen.getByRole('button', { name: '4 декабря' }))
  expect(onSwingDoor).toHaveBeenCalledExactlyOnceWith('2026-12-04')
})

it('ignores other doors while one door is swinging open', () => {
  const onSwingDoor = renderCalendar('2026-12-03')
  fireEvent.click(screen.getByRole('button', { name: '4 декабря' }))
  fireEvent.click(screen.getByRole('button', { name: '3 декабря' }))
  expect(onSwingDoor).not.toHaveBeenCalled()
})

it('does not swing a locked door', () => {
  const onSwingDoor = renderCalendar(null)
  fireEvent.click(screen.getByRole('button', { name: '20 декабря' }))
  expect(onSwingDoor).not.toHaveBeenCalled()
})
