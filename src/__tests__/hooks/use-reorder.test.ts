import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReorder } from '@/hooks/use-reorder'

function makePointerEvent(clientY: number): React.PointerEvent {
  return {
    pointerType: 'touch',
    button: 0,
    clientY,
    currentTarget: {
      setPointerCapture: () => undefined,
    },
    pointerId: 1,
    stopPropagation: () => undefined,
  } as unknown as React.PointerEvent
}

describe('useReorder', () => {
  it('initial draggingIdx is null', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    expect(result.current.draggingIdx).toBeNull()
  })

  it('makeHandlers returns event handler functions', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    const handlers = result.current.makeHandlers(0)
    expect(typeof handlers.onPointerDown).toBe('function')
    expect(typeof handlers.onPointerMove).toBe('function')
    expect(typeof handlers.onPointerUp).toBe('function')
  })

  it('starting a drag sets draggingIdx', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    act(() => {
      result.current.makeHandlers(1).onPointerDown(makePointerEvent(100))
    })
    expect(result.current.draggingIdx).toBe(1)
  })

  it('releasing pointer resets draggingIdx to null', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    act(() => {
      result.current.makeHandlers(0).onPointerDown(makePointerEvent(100))
    })
    expect(result.current.draggingIdx).toBe(0)
    act(() => {
      result.current.makeHandlers(0).onPointerUp()
    })
    expect(result.current.draggingIdx).toBeNull()
  })
})
