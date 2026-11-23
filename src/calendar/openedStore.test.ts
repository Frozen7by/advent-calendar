import { expect, it } from 'vitest'
import { STORAGE_KEY, loadOpened, saveOpened } from './openedStore.ts'
import type { StorageLike } from './openedStore.ts'

function fakeStorage(initial?: string | null): StorageLike {
  const items = new Map<string, string>()
  if (typeof initial === 'string') items.set(STORAGE_KEY, initial)
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
}

it('round-trips the opened set', () => {
  const storage = fakeStorage()
  saveOpened(storage, new Set(['2026-12-05', '2026-11-23']))
  expect(loadOpened(storage)).toEqual(new Set(['2026-11-23', '2026-12-05']))
})

it('reads December door numbers saved by the first version as December date ids', () => {
  expect(loadOpened(fakeStorage('[1,24]'))).toEqual(new Set(['2026-12-01', '2026-12-24']))
})

it.each([
  ['nothing stored', null],
  ['invalid JSON', '{oops'],
  ['not an array', '{"a":1}'],
])('loads an empty set when %s', (_name, raw) => {
  expect(loadOpened(fakeStorage(raw)).size).toBe(0)
})

it('drops entries that are not doors', () => {
  expect(loadOpened(fakeStorage('[1,"2",0,25,3.5,7,7,"2026-11-23","2026-11-23","23 Nov",null]'))).toEqual(
    new Set(['2026-12-01', '2026-12-07', '2026-11-23']),
  )
})

it('survives storage that throws', () => {
  const broken: StorageLike = {
    getItem() {
      throw new Error('denied')
    },
    setItem() {
      throw new Error('quota')
    },
    removeItem() {},
  }
  expect(loadOpened(broken).size).toBe(0)
  expect(() => saveOpened(broken, new Set(['2026-12-01']))).not.toThrow()
})
