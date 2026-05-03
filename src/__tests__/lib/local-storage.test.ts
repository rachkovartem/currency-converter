import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRecentCurrencies, saveRecentCurrencies } from '@/lib/local-storage'

describe('local-storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getRecentCurrencies()', () => {
    it('returns empty array when nothing is stored', () => {
      expect(getRecentCurrencies()).toEqual([])
    })

    it('returns stored currencies', () => {
      localStorage.setItem('cc-recent-currencies', JSON.stringify(['USD', 'EUR']))
      expect(getRecentCurrencies()).toEqual(['USD', 'EUR'])
    })

    it('returns empty array on malformed JSON', () => {
      localStorage.setItem('cc-recent-currencies', 'not-json')
      expect(getRecentCurrencies()).toEqual([])
    })
  })

  describe('saveRecentCurrencies()', () => {
    it('saves list to localStorage', () => {
      saveRecentCurrencies(['USD', 'GBP', 'JPY'])
      const stored = localStorage.getItem('cc-recent-currencies')
      expect(JSON.parse(stored ?? '[]')).toEqual(['USD', 'GBP', 'JPY'])
    })

    it('overwrites existing list', () => {
      saveRecentCurrencies(['USD'])
      saveRecentCurrencies(['EUR', 'GBP'])
      const stored = localStorage.getItem('cc-recent-currencies')
      expect(JSON.parse(stored ?? '[]')).toEqual(['EUR', 'GBP'])
    })
  })
})
