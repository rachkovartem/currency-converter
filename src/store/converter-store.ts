import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MOCK_RATES } from '@/lib/rates'
import { CurrencyCode, RecentConversion } from '@/lib/types'
import { cookieStorage } from '@/lib/cookie-storage'

interface ConverterState {
  // Data
  rows: CurrencyCode[]
  activeCode: CurrencyCode
  activeValue: string
  favorites: CurrencyCode[]
  recents: RecentConversion[]
  rates: Record<CurrencyCode, number>
  updatedAt: number
  online: boolean
  // UI settings (persisted)
  layout: 'list' | 'grid'
  density: 'compact' | 'comfortable'
  showFlags: boolean
  sparklines: boolean
  // Overlay state (not persisted)
  pickerOpen: boolean
  historyPair: { from: CurrencyCode; to: CurrencyCode } | null
  showRecents: boolean
  settingsOpen: boolean
  // Actions
  addCurrency: (code: CurrencyCode) => void
  removeCurrency: (code: CurrencyCode) => void
  setActiveRow: (code: CurrencyCode) => void
  setActiveValue: (value: string) => void
  reorderRows: (rows: CurrencyCode[]) => void
  toggleFavorite: (code: CurrencyCode) => void
  updateRates: (rates: Record<CurrencyCode, number>) => void
  setLayout: (layout: 'list' | 'grid') => void
  setDensity: (density: 'compact' | 'comfortable') => void
  setShowFlags: (show: boolean) => void
  setSparklines: (show: boolean) => void
  openPicker: () => void
  closePicker: () => void
  openHistory: (pair: { from: CurrencyCode; to: CurrencyCode }) => void
  closeHistory: () => void
  openRecents: () => void
  closeRecents: () => void
  pickRecent: (recent: RecentConversion) => void
  openSettings: () => void
  closeSettings: () => void
}

type PersistedConverterState = {
  rows: CurrencyCode[]
  activeCode: CurrencyCode
  activeValue: string
  favorites: CurrencyCode[]
  recents: RecentConversion[]
  layout: 'list' | 'grid'
  density: 'compact' | 'comfortable'
  showFlags: boolean
  sparklines: boolean
}

function getInitialPersistedState(): Partial<PersistedConverterState> {
  if (typeof window === 'undefined') return {}
  const s = (window as Window & { __CC_STATE__?: Partial<PersistedConverterState> }).__CC_STATE__
  return s ?? {}
}

export const useConverterStore = create<ConverterState>()(
  persist(
    (set) => ({
      rows: ['USD', 'EUR', 'GBP', 'JPY'],
      activeCode: 'USD',
      activeValue: '100',
      favorites: ['EUR'],
      recents: [
        { from: 'USD', to: 'EUR', amount: 250, ts: Date.now() - 1000 * 60 * 22 },
        { from: 'GBP', to: 'JPY', amount: 50, ts: Date.now() - 1000 * 60 * 60 * 3 },
        { from: 'EUR', to: 'CHF', amount: 1200, ts: Date.now() - 1000 * 60 * 60 * 26 },
      ],
      rates: MOCK_RATES,
      updatedAt: Date.now(),
      online: true,
      layout: 'list',
      density: 'compact',
      showFlags: true,
      sparklines: true,
      pickerOpen: false,
      historyPair: null,
      showRecents: false,
      settingsOpen: false,
      ...getInitialPersistedState(),

      addCurrency: (code) => set((state) => {
        if (state.rows.includes(code)) return state
        return { rows: [...state.rows, code], pickerOpen: false }
      }),
      removeCurrency: (code) => set((state) => {
        if (state.rows.length <= 1) return state
        const next = state.rows.filter(c => c !== code)
        return {
          rows: next,
          activeCode: state.activeCode === code ? next[0] : state.activeCode,
        }
      }),
      setActiveRow: (code) => set({ activeCode: code }),
      setActiveValue: (value) => set({ activeValue: value }),
      reorderRows: (rows) => set({ rows }),
      toggleFavorite: (code) => set((state) => ({
        favorites: state.favorites.includes(code)
          ? state.favorites.filter(c => c !== code)
          : [...state.favorites, code],
      })),
      updateRates: (rates) => set({ rates, updatedAt: Date.now() }),
      setLayout: (layout) => set({ layout }),
      setDensity: (density) => set({ density }),
      setShowFlags: (showFlags) => set({ showFlags }),
      setSparklines: (sparklines) => set({ sparklines }),
      openPicker: () => set({ pickerOpen: true }),
      closePicker: () => set({ pickerOpen: false }),
      openHistory: (pair) => set({ historyPair: pair }),
      closeHistory: () => set({ historyPair: null }),
      openRecents: () => set({ showRecents: true }),
      closeRecents: () => set({ showRecents: false }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      pickRecent: (recent) => set((state) => {
        const rows = [...state.rows]
        if (!rows.includes(recent.from)) rows.push(recent.from)
        if (!rows.includes(recent.to)) rows.push(recent.to)
        return {
          rows,
          activeCode: recent.from,
          activeValue: String(recent.amount),
          showRecents: false,
        }
      }),
    }),
    {
      name: 'currency-converter',
      storage: createJSONStorage(() => cookieStorage),
      skipHydration: true,
      partialize: (state) => {
        const persistedKeys: (keyof ConverterState)[] = [
          'rows', 'activeCode', 'activeValue', 'favorites', 'recents',
          'layout', 'density', 'showFlags', 'sparklines',
          // settingsOpen, pickerOpen, historyPair, showRecents are NOT persisted
        ]
        return Object.fromEntries(
          persistedKeys.map(k => [k, state[k]])
        ) as Pick<ConverterState, typeof persistedKeys[number]>
      },
    }
  )
)
