import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePWAInstall } from '@/hooks/use-pwa-install'

// Minimal fake BeforeInstallPromptEvent
function makeInstallPromptEvent(outcomeValue = 'accepted') {
  return {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: outcomeValue }),
  }
}

describe('usePWAInstall', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isInstallable is false by default (no beforeinstallprompt fired)', () => {
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.isInstallable).toBe(false)
  })

  it('isInstallable becomes true when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => usePWAInstall())

    const event = makeInstallPromptEvent()

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), event))
    })

    expect(result.current.isInstallable).toBe(true)
  })

  it('install() calls prompt() on the captured event and sets isInstallable to false after resolving', async () => {
    const { result } = renderHook(() => usePWAInstall())

    const event = makeInstallPromptEvent()

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), event))
    })

    expect(result.current.isInstallable).toBe(true)

    await act(async () => {
      await result.current.install()
    })

    expect(event.prompt).toHaveBeenCalledTimes(1)
    expect(result.current.isInstallable).toBe(false)
  })

  it('isInstallable becomes false when appinstalled event fires', () => {
    const { result } = renderHook(() => usePWAInstall())

    const event = makeInstallPromptEvent()

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), event))
    })

    expect(result.current.isInstallable).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.isInstallable).toBe(false)
  })

  it('install() does nothing when deferredPrompt is null', async () => {
    const { result } = renderHook(() => usePWAInstall())

    // Do NOT fire beforeinstallprompt — deferredPrompt stays null
    expect(result.current.isInstallable).toBe(false)

    // Should not throw
    await act(async () => {
      await result.current.install()
    })

    expect(result.current.isInstallable).toBe(false)
  })

  it('install() with dismissed outcome still clears isInstallable', async () => {
    const { result } = renderHook(() => usePWAInstall())

    const event = makeInstallPromptEvent('dismissed')

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), event))
    })

    expect(result.current.isInstallable).toBe(true)

    await act(async () => {
      await result.current.install()
    })

    expect(result.current.isInstallable).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => usePWAInstall())

    expect(addSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function))
  })
})
