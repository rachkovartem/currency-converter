import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwUpdate } from '@/hooks/use-sw-update'

// Helpers to create a minimal fake ServiceWorkerContainer
function makeServiceWorkerContainer(hasController: boolean) {
  const listeners: Record<string, EventListener[]> = {}

  return {
    controller: hasController ? {} : null,
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(handler)
    }),
    removeEventListener: vi.fn((event: string, handler: EventListener) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler)
      }
    }),
    // Helper: fire a registered event
    _fire(event: string) {
      const handlers = listeners[event] ?? []
      handlers.forEach(h => h(new Event(event)))
    },
    _listeners: listeners,
  }
}

describe('useSwUpdate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('updateAvailable is false on initial mount (no controllerchange yet)', () => {
    const sw = makeServiceWorkerContainer(true)
    vi.stubGlobal('navigator', { serviceWorker: sw })

    const { result } = renderHook(() => useSwUpdate())

    expect(result.current.updateAvailable).toBe(false)
  })

  it('updateAvailable becomes true when controllerchange fires and hadController was true', () => {
    const sw = makeServiceWorkerContainer(true)
    vi.stubGlobal('navigator', { serviceWorker: sw })

    const { result } = renderHook(() => useSwUpdate())

    expect(result.current.updateAvailable).toBe(false)

    act(() => {
      sw._fire('controllerchange')
    })

    expect(result.current.updateAvailable).toBe(true)
  })

  it('updateAvailable stays false when controllerchange fires but hadController was false (first install)', () => {
    const sw = makeServiceWorkerContainer(false)
    vi.stubGlobal('navigator', { serviceWorker: sw })

    const { result } = renderHook(() => useSwUpdate())

    act(() => {
      sw._fire('controllerchange')
    })

    expect(result.current.updateAvailable).toBe(false)
  })

  it('applyUpdate() calls window.location.reload when updateAvailable is true', () => {
    const sw = makeServiceWorkerContainer(true)
    vi.stubGlobal('navigator', { serviceWorker: sw })

    const reloadSpy = vi.fn()
    vi.stubGlobal('location', { reload: reloadSpy })

    const { result } = renderHook(() => useSwUpdate())

    // First set updateAvailable=true via a controllerchange event
    act(() => {
      sw._fire('controllerchange')
    })

    expect(result.current.updateAvailable).toBe(true)

    act(() => {
      result.current.applyUpdate()
    })

    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  it('listener is removed on unmount', () => {
    const sw = makeServiceWorkerContainer(true)
    vi.stubGlobal('navigator', { serviceWorker: sw })

    const { unmount } = renderHook(() => useSwUpdate())

    expect(sw.addEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function))

    unmount()

    expect(sw.removeEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function))
  })

  it('returns updateAvailable=false and no-op applyUpdate when serviceWorker is not in navigator', () => {
    vi.stubGlobal('navigator', {})
    const reloadSpy = vi.fn()
    vi.stubGlobal('location', { reload: reloadSpy })

    const { result } = renderHook(() => useSwUpdate())

    act(() => {
      result.current.applyUpdate()
    })

    expect(result.current.updateAvailable).toBe(false)
    expect(reloadSpy).not.toHaveBeenCalled()
  })
})
