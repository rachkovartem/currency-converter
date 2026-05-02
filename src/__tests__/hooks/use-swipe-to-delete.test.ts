import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwipeToDelete } from '@/hooks/use-swipe-to-delete'

function makePointerEvent(type: string, clientX: number): React.PointerEvent {
  return {
    pointerType: 'touch',
    button: 0,
    clientX,
    currentTarget: {
      setPointerCapture: vi.fn(),
    },
    pointerId: 1,
    stopPropagation: vi.fn(),
  } as unknown as React.PointerEvent
}

describe('useSwipeToDelete', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('initial dx is 0', () => {
    const { result } = renderHook(() => useSwipeToDelete(undefined))
    expect(result.current.dx).toBe(0)
  })

  it('right swipe keeps dx at 0', () => {
    const { result } = renderHook(() => useSwipeToDelete(undefined))
    act(() => {
      result.current.handlers.onPointerDown(makePointerEvent('pointerdown', 100))
    })
    act(() => {
      result.current.handlers.onPointerMove(makePointerEvent('pointermove', 150))
    })
    expect(result.current.dx).toBe(0)
  })

  it('left swipe sets negative dx', () => {
    const { result } = renderHook(() => useSwipeToDelete(undefined))
    act(() => {
      result.current.handlers.onPointerDown(makePointerEvent('pointerdown', 200))
    })
    act(() => {
      result.current.handlers.onPointerMove(makePointerEvent('pointermove', 150))
    })
    expect(result.current.dx).toBe(-50)
  })

  it('dx is clamped at -140', () => {
    const { result } = renderHook(() => useSwipeToDelete(undefined))
    act(() => {
      result.current.handlers.onPointerDown(makePointerEvent('pointerdown', 300))
    })
    act(() => {
      result.current.handlers.onPointerMove(makePointerEvent('pointermove', 0))
    })
    expect(result.current.dx).toBe(-140)
  })

  it('release after threshold triggers onDelete after 160ms', () => {
    const onDelete = vi.fn()
    const { result } = renderHook(() => useSwipeToDelete(onDelete, 80))
    act(() => {
      result.current.handlers.onPointerDown(makePointerEvent('pointerdown', 200))
    })
    act(() => {
      result.current.handlers.onPointerMove(makePointerEvent('pointermove', 100))
    })
    act(() => {
      result.current.handlers.onPointerUp()
    })
    expect(onDelete).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(160)
    })
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('release before threshold snaps dx to 0', () => {
    const onDelete = vi.fn()
    const { result } = renderHook(() => useSwipeToDelete(onDelete, 80))
    act(() => {
      result.current.handlers.onPointerDown(makePointerEvent('pointerdown', 200))
    })
    act(() => {
      result.current.handlers.onPointerMove(makePointerEvent('pointermove', 160))
    })
    act(() => {
      result.current.handlers.onPointerUp()
    })
    expect(result.current.dx).toBe(0)
    expect(onDelete).not.toHaveBeenCalled()
  })
})
