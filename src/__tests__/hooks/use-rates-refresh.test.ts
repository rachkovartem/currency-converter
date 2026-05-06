import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { useRatesRefresh } from '@/hooks/use-rates-refresh'
import { ConverterStoreContext, createConverterStore } from '@/store/converter-store'

// ---- helpers ----

function makeWrapper(store = createConverterStore()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(ConverterStoreContext.Provider, { value: store }, children)
  }
}

function makeFetchResponse(rates: Record<string, number> = { USD: 1, EUR: 0.9 }, updatedAt = 1000) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({ rates, updatedAt }),
  } as unknown as Response
}

// ---- setup ----

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  // shouldAdvanceTime: true allows waitFor's real-timer polling to still work
  vi.useFakeTimers({ shouldAdvanceTime: true })
  fetchMock = vi.fn().mockResolvedValue(makeFetchResponse())
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ---- tests ----

describe('useRatesRefresh', () => {
  it('calls /api/rates once on mount', async () => {
    const { unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/rates')
    unmount()
  })

  it('isRefreshing is true during fetch, false after', async () => {
    let resolveFetch!: (value: Response) => void
    const pendingFetch = new Promise<Response>((resolve) => { resolveFetch = resolve })
    fetchMock.mockReturnValueOnce(pendingFetch)

    const { result, unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper() })

    // isRefreshing should be true while fetch is pending
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true)
    })

    // Resolve the fetch
    await act(async () => {
      resolveFetch(makeFetchResponse())
    })

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })
    unmount()
  })

  it('updates the store with rates and updatedAt after successful fetch', async () => {
    const store = createConverterStore()
    const rates = { USD: 1, EUR: 0.85, GBP: 0.73 }
    const updatedAt = 99999
    fetchMock.mockResolvedValue(makeFetchResponse(rates, updatedAt))

    const { unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper(store) })

    await waitFor(() => {
      expect(store.getState().rates).toEqual(rates)
    })
    expect(store.getState().updatedAt).toBe(updatedAt)
    unmount()
  })

  it('triggers fetch again on visibilitychange to visible (after debounce window)', async () => {
    const store = createConverterStore()
    const { unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper(store) })

    // Wait for mount fetch to complete
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    // Advance time past 5-minute debounce
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000 + 1)
    })

    // Simulate user returning to tab
    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    unmount()
  })

  it('debounces second call within 5 minutes (skips silently)', async () => {
    const store = createConverterStore()
    const { unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper(store) })

    // Wait for mount fetch to complete
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    // Simulate visibilitychange quickly (within 5-min debounce window, no timer advance)
    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Small wait to flush microtasks — should still be 1 call
    await act(async () => {
      await Promise.resolve()
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('refresh() bypasses the 5-minute debounce', async () => {
    const store = createConverterStore()
    const { result, unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper(store) })

    // Wait for initial mount fetch
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    // Call refresh() manually — should not be debounced
    await act(async () => {
      await result.current.refresh()
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    unmount()
  })

  it('fetch error does not throw, sets isRefreshing to false', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('network error'))

    const { result, unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })
    expect(consoleError).toHaveBeenCalled()
    unmount()
    consoleError.mockRestore()
  })

  it('does not update store when response is not ok', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const jsonMock = vi.fn()
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: jsonMock } as unknown as Response)

    const store = createConverterStore()
    const initialRates = store.getState().rates

    const { result, unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper(store) })

    // Wait for initial mount fetch to complete and isRefreshing to settle
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })

    // Store rates must be unchanged
    expect(store.getState().rates).toEqual(initialRates)
    // json() must not have been called
    expect(jsonMock).not.toHaveBeenCalled()

    unmount()
    consoleError.mockRestore()
  })

  it('cleans up timer and visibilitychange listener on unmount', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useRatesRefresh(), { wrapper: makeWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
