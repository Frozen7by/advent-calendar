// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import '../i18n/index.ts'
import type { Gift } from '../calendar/logic.ts'
import { GiftsScreen } from './GiftsScreen.tsx'

afterEach(cleanup)

const rule = 'Все задания выполняешь ты. Все призы тоже получаешь ты.'

it('states the rule before anything is collected', () => {
  render(<GiftsScreen gifts={[]} onBack={() => {}} />)
  expect(screen.getByText(rule)).toBeTruthy()
})

it('states the rule above the collected gifts', () => {
  const gifts: Gift[] = [
    { doorId: '2026-11-23', month: 11, day: 23, grade: 'common', drop: 'trash', bonus: false },
    { doorId: '2026-12-24', month: 12, day: 24, grade: 'epic', drop: 'roblox10', bonus: false },
  ]
  render(<GiftsScreen gifts={gifts} onBack={() => {}} />)
  expect(screen.getByText(rule)).toBeTruthy()
  expect(screen.getByText('23 ноября')).toBeTruthy()
  expect(screen.getByText('Донат в Roblox на $10')).toBeTruthy()
})
