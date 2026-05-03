'use client'

import { useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useConverterStore, useHasHydrated } from '@/store/converter-store'
import { convert, formatNumber } from '@/lib/rates'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { timeAgo } from '@/lib/time'
import { useRates } from '@/hooks/use-rates'
import { useReorder } from '@/hooks/use-reorder'
import { Header } from '@/components/header'
import { CurrencyListRow } from '@/components/currency-list-row'
import { CurrencyGridTile } from '@/components/currency-grid-tile'
import { AddCurrencyButton } from '@/components/add-currency-button'
import { FavoritesSection } from '@/components/favorites-section'
import { FloatingSwapPill } from '@/components/floating-swap-pill'
import { EmptyState } from '@/components/empty-state'
import { PickerSheet } from '@/components/picker-sheet'
import { HistoryScreen } from '@/components/history-screen'
import { RecentsOverlay } from '@/components/recents-overlay'
import { SettingsSheet } from '@/components/settings-sheet'

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
])

interface ConverterAppProps {
  initialRates: Record<string, number>
  ratesDate: string
}

export function ConverterApp({ initialRates, ratesDate }: ConverterAppProps) {
  useRates()

  const hasHydrated = useHasHydrated()

  // Capture initial SSR rates in a ref so we can use it in the effect
  // without triggering re-runs on re-renders (rates are daily, SSR-only)
  const initialRatesRef = useRef(initialRates)

  // Initialize store with SSR rates on first mount
  useEffect(() => {
    useConverterStore.setState({ rates: initialRatesRef.current, updatedAt: Date.now() })
  }, [])

  // Ensure app renders after client mount. _hasHydrated is set by onRehydrateStorage
  // in the persist middleware, but we also set it here as a fallback after mount
  // to handle the case where the callback fires before React re-renders.
  useEffect(() => {
    useConverterStore.setState({ _hasHydrated: true })
  }, [])

  const rows = useConverterStore(s => s.rows)
  const activeCode = useConverterStore(s => s.activeCode)
  const activeValue = useConverterStore(s => s.activeValue)
  const rates = useConverterStore(s => s.rates)
  const layout = useConverterStore(s => s.layout)
  const density = useConverterStore(s => s.density)
  const showFlags = useConverterStore(s => s.showFlags)
  const sparklines = useConverterStore(s => s.sparklines)
  const online = useConverterStore(s => s.online)
  const updatedAt = useConverterStore(s => s.updatedAt)
  const openPicker = useConverterStore(s => s.openPicker)
  const removeCurrency = useConverterStore(s => s.removeCurrency)
  const setActiveRow = useConverterStore(s => s.setActiveRow)
  const setActiveValue = useConverterStore(s => s.setActiveValue)
  const reorderRows = useConverterStore(s => s.reorderRows)

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
    setActiveRow(code)
    setActiveValue(formatNumber(parseFloat(v) || 0, decimals(code)).replace(/,/g, ''))
  }

  if (!hasHydrated) {
    return <div style={{ background: '#08080C', minHeight: '100dvh' }} />
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
      }}
    >
      <Header ratesDate={ratesDate} />

      {isEmpty ? (
        <EmptyState onAdd={openPicker} />
      ) : (
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '8px clamp(6px, 3vw, 12px) 100px' }}
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
                    sparklines={sparklines}
                    decimals={decimals(code)}
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
                      sparkline={sparklines}
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
          <FavoritesSection />

          {/* Updated timestamp */}
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
        </div>
      )}

      <FloatingSwapPill />

      {/* Overlays */}
      <PickerSheet />
      <HistoryScreen />
      <RecentsOverlay />
      <SettingsSheet />
    </div>
  )
}
