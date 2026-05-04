import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { createContext, useContext } from 'react'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MOCK_RATES } from '@/lib/rates'
import { CurrencyCode, RecentConversion } from '@/lib/types'
import { cookieStorage, PersistedConverterState } from '@/lib/cookie-storage'
import { saveRecentCurrencies } from '@/lib/local-storage'

interface ConverterState {
  // Data
  rows: CurrencyCode[]
  activeCode: CurrencyCode
  activeValue: string
  recents: RecentConversion[]
  rates: Record<CurrencyCode, number>
  updatedAt: number
  online: boolean
  // UI settings (persisted)
  layout: 'list' | 'grid'
  density: 'compact' | 'comfortable'
  showFlags: boolean
  focusMode: boolean
  // Recent currencies (stored in localStorage, not cookies)
  recentCurrencies: CurrencyCode[]
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
  updateRates: (rates: Record<CurrencyCode, number>) => void
  setLayout: (layout: 'list' | 'grid') => void
  setDensity: (density: 'compact' | 'comfortable') => void
  setShowFlags: (show: boolean) => void
  openPicker: () => void
  closePicker: () => void
  openHistory: (pair: { from: CurrencyCode; to: CurrencyCode }) => void
  closeHistory: () => void
  openRecents: () => void
  closeRecents: () => void
  pickRecent: (recent: RecentConversion) => void
  openSettings: () => void
  closeSettings: () => void
  setOnline: (online: boolean) => void
  addRecentCurrency: (code: CurrencyCode) => void
  setFocusMode: (enabled: boolean) => void
}

export function createConverterStore(initialState?: Partial<PersistedConverterState>) {
  return createStore<ConverterState>()(
    persist(
      (set) => ({
        rows: ['USD', 'EUR', 'GBP', 'JPY'],
        activeCode: 'USD',
        activeValue: '100',
        recents: [
          { from: 'USD', to: 'EUR', amount: 250, ts: Date.now() - 1000 * 60 * 22 },
          { from: 'GBP', to: 'JPY', amount: 50, ts: Date.now() - 1000 * 60 * 60 * 3 },
          { from: 'EUR', to: 'CHF', amount: 1200, ts: Date.now() - 1000 * 60 * 60 * 26 },
        ],
        rates: MOCK_RATES,
        updatedAt: Date.now(),
        online: true,
        layout: 'list',
        density: 'comfortable',
        showFlags: true,
        focusMode: false,
        recentCurrencies: [],
        pickerOpen: false,
        historyPair: null,
        showRecents: false,
        settingsOpen: false,
        ...(initialState ?? {}),

        addCurrency: (code) => set((state) => {
          if (state.rows.includes(code)) return { ...state, pickerOpen: false }
          const updatedRecents = [code, ...state.recentCurrencies.filter(c => c !== code)].slice(0, 10)
          saveRecentCurrencies(updatedRecents)
          return { rows: [...state.rows, code], pickerOpen: false, recentCurrencies: updatedRecents }
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
        updateRates: (rates) => set({ rates, updatedAt: Date.now() }),
        setLayout: (layout) => set({ layout }),
        setDensity: (density) => set({ density }),
        setShowFlags: (showFlags) => set({ showFlags }),
        openPicker: () => set({ pickerOpen: true }),
        closePicker: () => set({ pickerOpen: false }),
        openHistory: (pair) => set({ historyPair: pair }),
        closeHistory: () => set({ historyPair: null }),
        openRecents: () => set({ showRecents: true }),
        closeRecents: () => set({ showRecents: false }),
        openSettings: () => set({ settingsOpen: true }),
        closeSettings: () => set({ settingsOpen: false }),
        setOnline: (online) => set({ online }),
        addRecentCurrency: (code) => set((state) => {
          const updated = [code, ...state.recentCurrencies.filter(c => c !== code)].slice(0, 10)
          saveRecentCurrencies(updated)
          return { recentCurrencies: updated }
        }),
        setFocusMode: (focusMode) => set({ focusMode }),
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
            'rows', 'activeCode', 'activeValue', 'recents',
            'layout', 'density', 'showFlags', 'focusMode',
            // settingsOpen, pickerOpen, historyPair, showRecents, recentCurrencies are NOT persisted here
          ]
          return Object.fromEntries(
            persistedKeys.map(k => [k, state[k]])
          ) as Pick<ConverterState, typeof persistedKeys[number]>
        },
      }
    )
  )
}

export type ConverterStore = ReturnType<typeof createConverterStore>

export const ConverterStoreContext = createContext<ConverterStore | null>(null)

// Module-level default store — used as fallback when no Provider is present.
// This exists solely for test compatibility (tests reset state via .setState).
// In production, ConverterApp always provides a per-request store via context.
const _defaultStore = createConverterStore()

// Intersection type that exposes the hook signature AND static store methods
// on the same export, enabling backward-compatible test patterns.
type UseConverterStore = {
  <T>(selector: (state: ConverterState) => T): T
  setState: ConverterStore['setState']
  getState: ConverterStore['getState']
  subscribe: ConverterStore['subscribe']
}

function useConverterStoreImpl<T>(selector: (state: ConverterState) => T): T {
  const store = useContext(ConverterStoreContext) ?? _defaultStore
  return useStore(store, selector)
}

// Attach static methods for test backward-compatibility:
// tests call useConverterStore.setState({...}) and useConverterStore.getState()
// These proxy through the singleton _defaultStore
;(useConverterStoreImpl as UseConverterStore).setState = _defaultStore.setState.bind(_defaultStore)
;(useConverterStoreImpl as UseConverterStore).getState = _defaultStore.getState.bind(_defaultStore)
;(useConverterStoreImpl as UseConverterStore).subscribe = _defaultStore.subscribe.bind(_defaultStore)

export const useConverterStore = useConverterStoreImpl as UseConverterStore
