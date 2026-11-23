import { expect, it, vi } from 'vitest'
import { createUpdater } from './updater.ts'

function setup() {
  const host = { check: vi.fn(), reload: vi.fn() }
  return { host, updater: createUpdater(host) }
}

it('looks for a new version every time the app is shown', () => {
  const { host, updater } = setup()
  expect(host.check).not.toHaveBeenCalled()
  updater.appShown()
  updater.appShown()
  expect(host.check).toHaveBeenCalledTimes(2)
  expect(host.reload).not.toHaveBeenCalled()
})

it('reloads at once when a new version is ready and no door is opening', () => {
  const { host, updater } = setup()
  updater.newVersionReady()
  expect(host.reload).toHaveBeenCalledTimes(1)
})

it('waits for the opening door to finish before reloading', () => {
  const { host, updater } = setup()
  updater.setBusy(true)
  updater.newVersionReady()
  expect(host.reload).not.toHaveBeenCalled()
  updater.setBusy(true)
  expect(host.reload).not.toHaveBeenCalled()
  updater.setBusy(false)
  expect(host.reload).toHaveBeenCalledTimes(1)
})

it('does not reload when nothing new is ready', () => {
  const { host, updater } = setup()
  updater.setBusy(true)
  updater.setBusy(false)
  expect(host.reload).not.toHaveBeenCalled()
})

it('reloads only once', () => {
  const { host, updater } = setup()
  updater.newVersionReady()
  updater.newVersionReady()
  updater.setBusy(false)
  expect(host.reload).toHaveBeenCalledTimes(1)
})
