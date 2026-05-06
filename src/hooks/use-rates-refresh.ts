'use client'

import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { ConverterStoreContext } from '@/store/converter-store'

const REFRESH_INTERVAL_MS = 30 * 60 * 1000   // 30 minutes
const DEBOUNCE_MS = 5 * 60 * 1000             // 5 minutes

export interface UseRatesRefreshResult {
  isRefreshing: boolean
  refresh: () => Promise<void>
}

export function useRatesRefresh(): UseRatesRefreshResult {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastRefreshRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // The store is a stable vanilla Zustand store created once per ConverterApp mount.
  // Reading it via context here is safe — it does not change across renders.
  const store = useContext(ConverterStoreContext)

  const fetchRates = useCallback(async (bypassDebounce: boolean): Promise<void> => {
    const now = Date.now()
    if (!bypassDebounce && now - lastRefreshRef.current < DEBOUNCE_MS) {
      return
    }

    setIsRefreshing(true)
    try {
      const res = await fetch('/api/rates')
      if (!res.ok) throw new Error(`/api/rates returned ${res.status}`)
      const data = (await res.json()) as { rates: Record<string, number>; updatedAt: number }
      lastRefreshRef.current = Date.now()
      if (store) {
        store.setState({ rates: data.rates, updatedAt: data.updatedAt })
      }
    } catch (err) {
      console.error('[useRatesRefresh] Failed to fetch rates:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [store])

  const refresh = useCallback((): Promise<void> => fetchRates(true), [fetchRates])

  useEffect(() => {
    // Fetch immediately on mount (page may be ISR-stale)
    void fetchRates(false)

    // Set up 30-minute interval
    timerRef.current = setInterval(() => {
      void fetchRates(false)
    }, REFRESH_INTERVAL_MS)

    // Fetch when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchRates(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchRates])

  return { isRefreshing, refresh }
}
