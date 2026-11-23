// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import '../i18n/index.ts'
import type { Gift } from '../calendar/logic.ts'
import { APP_VERSION } from '../update/version.ts'
import { GiftsScreen } from './GiftsScreen.tsx'

afterEach(cleanup)

const rule = 'Все задания выполняешь ты. Все призы тоже получаешь ты.'

it('states the rule before anything is collected', () => {
  render(<GiftsScreen gifts={[]} onBack={() => {}} />)
  expect(screen.getByText(rule)).toBeTruthy()
})

it('shows which version of the app is running', () => {
  render(<GiftsScreen gifts={[]} onBack={() => {}} />)
  expect(APP_VERSION).not.toBe('')
  expect(screen.getByText(`Версия ${APP_VERSION}`)).toBeTruthy()
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
