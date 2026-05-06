'use client'

import { useMemo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Wifi, WifiOff, Settings, History } from 'lucide-react'
import { useConverterStore, ConverterStoreContext, createConverterStore, ConverterStore } from '@/store/converter-store'
import { PersistedConverterState } from '@/lib/cookie-storage'
import { getRecentCurrencies } from '@/lib/local-storage'
import { convert } from '@/lib/rates'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { timeAgo } from '@/lib/time'
import { useReorder } from '@/hooks/use-reorder'
import { Header } from '@/components/header'
import { CurrencyListRow } from '@/components/currency-list-row'
import { CurrencyGridTile } from '@/components/currency-grid-tile'
import { AddCurrencyButton } from '@/components/add-currency-button'
import { FloatingSwapPill } from '@/components/floating-swap-pill'
import { EmptyState } from '@/components/empty-state'
import { PickerSheet } from '@/components/picker-sheet'
import { RecentsOverlay } from '@/components/recents-overlay'
import { SettingsSheet } from '@/components/settings-sheet'

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
])

interface ConverterAppProps {
  initialRates: Record<string, number>
  ratesUpdatedAt: number
  initialState?: Partial<PersistedConverterState> | null
}

interface ConverterAppInnerProps {
  store: ConverterStore
}

// Inner component: all hooks run inside the Provider, so useConverterStore
// correctly reads from the per-request store via ConverterStoreContext.
function ConverterAppInner({ store }: ConverterAppInnerProps) {
  const rows = useConverterStore(s => s.rows)
  const activeCode = useConverterStore(s => s.activeCode)
  const activeValue = useConverterStore(s => s.activeValue)
  const rates = useConverterStore(s => s.rates)
  const layout = useConverterStore(s => s.layout)
  const density = useConverterStore(s => s.density)
  const showFlags = useConverterStore(s => s.showFlags)
  const online = useConverterStore(s => s.online)
  const updatedAt = useConverterStore(s => s.updatedAt)
  const openPicker = useConverterStore(s => s.openPicker)
  const removeCurrency = useConverterStore(s => s.removeCurrency)
  const setActiveRow = useConverterStore(s => s.setActiveRow)
  const setActiveValue = useConverterStore(s => s.setActiveValue)
  const reorderRows = useConverterStore(s => s.reorderRows)
  const setOnline = useConverterStore(s => s.setOnline)
  const focusMode = useConverterStore(s => s.focusMode)
  const openSettings = useConverterStore(s => s.openSettings)
  const openRecents = useConverterStore(s => s.openRecents)

  // Sync real network connectivity to the store
  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline  = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Register service worker for PWA / offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration is best-effort — silently ignore failures
      })
    }
  }, [])

  // Hydrate recentCurrencies from localStorage on mount
  useEffect(() => {
    const saved = getRecentCurrencies()
    if (saved.length > 0) {
      store.setState({ recentCurrencies: saved })
    }
  }, [store])

  const reorder = useReorder(rows, reorderRows)

  // Local DOM refs for the list container and each row wrapper.
  // Using standard useRef avoids the react-hooks/refs lint rule that fires
  // when a ref-writing callback function is used directly as a JSX ref prop.
  const listContainerRef = useRef<HTMLDivElement | null>(null)
  const rowDivRefs = useRef<(HTMLDivElement | null)[]>([])

  // Sync local refs to the reorder hook after every render (post-layout).
  useLayoutEffect(() => {
    reorder.setContainerRef(listContainerRef.current)
    rows.forEach((_, i) => reorder.setItemRef(i)(rowDivRefs.current[i] ?? null))
  })

  // Memoized value calculator
  const valueFor = useMemo(() => {
    return (code: string): string => {
      if (code === activeCode) return activeValue
      const amt = parseFloat(activeValue) || 0
      return convert(amt, activeCode, code, rates).toString()
    }
  }, [activeCode, activeValue, rates])

  const decimals = (code: string): number =>
    ZERO_DECIMAL_CURRENCIES.has(code) ? 0 : 2

  const handleSwap = (code: string) => {
    const v = valueFor(code)
    const num = parseFloat(v) || 0
    setActiveRow(code)
    // For zero-decimal currencies (JPY, KRW, etc.) keep as integer.
    // For others, store up to 8 significant decimal places so that
    // re-conversions from this row don't introduce rounding drift.
    // parseFloat strips trailing zeros: "3.06360000" → "3.0636".
    const dec = decimals(code)
    setActiveValue(parseFloat(num.toFixed(dec === 0 ? 0 : 8)).toString())
  }

  const isEmpty = rows.length === 0

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '0 auto',
        minHeight: '100dvh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {!focusMode && <Header />}

      {focusMode && (
        <div
          style={{
            position: 'fixed', bottom: 'calc(32px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)',
            zIndex: 31, maxWidth: 500, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 clamp(6px, 3vw, 12px)',
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={openRecents}
            aria-label="Recent conversions"
            style={{
              pointerEvents: 'auto',
              border: 'none', background: 'var(--cc-chip)',
              cursor: 'pointer', width: 36, height: 36, borderRadius: 18,
              color: 'var(--cc-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <History size={17} />
          </button>
          <button
            onClick={openSettings}
            aria-label="Display settings"
            style={{
              pointerEvents: 'auto',
              border: 'none', background: 'var(--cc-chip)',
              cursor: 'pointer', width: 36, height: 36, borderRadius: 18,
              color: 'var(--cc-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      )}

      {isEmpty ? (
        <EmptyState onAdd={openPicker} />
      ) : (
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: 'clamp(6px, 3vw, 12px) clamp(6px, 3vw, 12px) 100px' }}
        >
          {layout === 'grid' ? (
            <div
              data-testid="currency-rows-container"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
            >
              {rows.map((code, idx) => {
                const c = CURRENCY_BY_CODE[code]
                if (!c) return null
                const v = valueFor(code)
                return (
                  <CurrencyGridTile
                    key={code}
                    currency={c}
                    value={code === activeCode ? activeValue : v}
                    isActive={code === activeCode}
                    onFocus={() => handleSwap(code)}
                    onChange={(val) => {
                      setActiveRow(code)
                      setActiveValue(val)
                    }}
                    onSwap={() => handleSwap(code)}
                    showFlag={showFlags}
                    decimals={decimals(code)}
                    density={density}
                    dragHandlers={reorder.makeHandlers(idx)}
                  />
                )
              })}
            </div>
          ) : (
            <div
              ref={listContainerRef}
              data-testid="currency-rows-container"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {rows.map((code, idx) => {
                const c = CURRENCY_BY_CODE[code]
                if (!c) return null
                const v = valueFor(code)

                return (
                  <div
                    ref={(el) => { rowDivRefs.current[idx] = el }}
                    key={code}
                    style={{ position: 'relative' }}
                  >
                    <CurrencyListRow
                      currency={c}
                      value={code === activeCode ? activeValue : v}
                      isActive={code === activeCode}
                      onFocus={() => handleSwap(code)}
                      onChange={(val) => {
                        setActiveRow(code)
                        setActiveValue(val)
                      }}
                      onSwap={() => handleSwap(code)}
                      onDelete={() => removeCurrency(code)}
                      showFlag={showFlags}
                      decimals={decimals(code)}
                      density={density}
                      dragHandlers={reorder.makeHandlers(idx)}
                    />
                  </div>
                )
              })}
            </div>
          )}

          <AddCurrencyButton />

          {/* Updated timestamp */}
          {!focusMode && (
            <div
              style={{
                marginTop: 24,
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--cc-text-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {online ? (
                <Wifi size={12} />
              ) : (
                <WifiOff size={12} />
              )}
              Rates updated {timeAgo(updatedAt)}
            </div>
          )}
        </div>
      )}

      <FloatingSwapPill />

      {/* Overlays */}
      <PickerSheet />
      <RecentsOverlay />
      <SettingsSheet />
    </div>
  )
}

// Outer component: creates the per-request store and provides it via context.
// ConverterAppInner renders inside the Provider so its useConverterStore hooks
// correctly read from the per-request store rather than the module-level default.
export function ConverterApp({ initialRates, ratesUpdatedAt, initialState }: ConverterAppProps) {
  // Create a per-request store seeded with the server-provided cookie state.
  // useState lazy initialiser runs once and is safe to read during render.
  const [store] = useState<ConverterStore>(() =>
    createConverterStore({ ...(initialState ?? {}), rates: initialRates, updatedAt: ratesUpdatedAt })
  )

  return (
    <ConverterStoreContext.Provider value={store}>
      <ConverterAppInner store={store} />
    </ConverterStoreContext.Provider>
  )
}
