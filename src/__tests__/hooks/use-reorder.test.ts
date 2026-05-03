import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReorder } from '@/hooks/use-reorder'

// Helper to create a mock HTMLElement for item refs
function makeMockEl(): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => ({ height: 80, top: 0, bottom: 80, left: 0, right: 300, width: 300, x: 0, y: 0, toJSON: () => ({}) }),
    configurable: true,
  })
  return el
}

function makePointerEvent(
  clientY: number,
  opts: { pointerType?: string; button?: number; pointerId?: number } = {}
): React.PointerEvent {
  const el = document.createElement('div')
  // jsdom doesn't have setPointerCapture — define it before spying
  Object.defineProperty(el, 'setPointerCapture', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  })
  return {
    pointerType: opts.pointerType ?? 'touch',
    button: opts.button ?? 0,
    clientY,
    currentTarget: el,
    pointerId: opts.pointerId ?? 1,
    stopPropagation: vi.fn(),
  } as unknown as React.PointerEvent
}

describe('useReorder', () => {
  it('initial draggingIdx is null', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    expect(result.current.draggingIdx).toBeNull()
  })

  it('makeHandlers returns event handler functions including onPointerCancel', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )
    const handlers = result.current.makeHandlers(0)
    expect(typeof handlers.onPointerDown).toBe('function')
    expect(typeof handlers.onPointerMove).toBe('function')
    expect(typeof handlers.onPointerUp).toBe('function')
    expect(typeof handlers.onPointerCancel).toBe('function')
  })

  it('starting a drag sets draggingIdx', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )

    // Wire up a container ref and item ref so the handler can access them
    const containerEl = document.createElement('div')
    Object.defineProperty(containerEl, 'style', { value: { gap: '8' }, configurable: true })
    result.current.setContainerRef(containerEl)

    const itemEl = makeMockEl()
    result.current.setItemRef(1)(itemEl)

    act(() => {
      result.current.makeHandlers(1).onPointerDown(makePointerEvent(100))
    })
    expect(result.current.draggingIdx).toBe(1)
  })

  it('releasing pointer resets draggingIdx to null', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )

    const containerEl = document.createElement('div')
    result.current.setContainerRef(containerEl)
    const itemEl = makeMockEl()
    result.current.setItemRef(0)(itemEl)

    act(() => {
      result.current.makeHandlers(0).onPointerDown(makePointerEvent(100))
    })
    expect(result.current.draggingIdx).toBe(0)

    act(() => {
      result.current.makeHandlers(0).onPointerUp()
    })
    expect(result.current.draggingIdx).toBeNull()
  })

  it('onPointerCancel resets draggingIdx to null', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )

    const containerEl = document.createElement('div')
    result.current.setContainerRef(containerEl)
    const itemEl = makeMockEl()
    result.current.setItemRef(0)(itemEl)

    act(() => {
      result.current.makeHandlers(0).onPointerDown(makePointerEvent(100))
    })
    expect(result.current.draggingIdx).toBe(0)

    act(() => {
      result.current.makeHandlers(0).onPointerCancel?.()
    })
    expect(result.current.draggingIdx).toBeNull()
  })

  it('calls onReorder with reordered items when dragged to new position', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], onReorder)
    )

    // Create 3 item elements
    const items = ['USD', 'EUR', 'GBP']
    const containerEl = document.createElement('div')
    result.current.setContainerRef(containerEl)

    items.forEach((_, idx) => {
      const el = makeMockEl()
      result.current.setItemRef(idx)(el)
    })

    // Start drag on index 0, move 90px (more than one row height of 80), release
    act(() => {
      result.current.makeHandlers(0).onPointerDown(makePointerEvent(0))
    })

    act(() => {
      result.current.makeHandlers(0).onPointerMove(makePointerEvent(90))
    })

    act(() => {
      result.current.makeHandlers(0).onPointerUp()
    })

    // onReorder should be called with the moved item
    expect(onReorder).toHaveBeenCalledTimes(1)
    // USD moved from index 0 to index 1 (90px / 88px step = ~1)
    expect(onReorder).toHaveBeenCalledWith(['EUR', 'USD', 'GBP'])
  })

  it('does not call onReorder if no movement occurred', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], onReorder)
    )

    const containerEl = document.createElement('div')
    result.current.setContainerRef(containerEl)
    const itemEl = makeMockEl()
    result.current.setItemRef(0)(itemEl)

    act(() => {
      result.current.makeHandlers(0).onPointerDown(makePointerEvent(100))
    })

    act(() => {
      result.current.makeHandlers(0).onPointerUp()
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('exposes setContainerRef and setItemRef', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR'], () => undefined)
    )
    expect(typeof result.current.setContainerRef).toBe('function')
    expect(typeof result.current.setItemRef).toBe('function')
    // setItemRef(idx) returns a callback
    expect(typeof result.current.setItemRef(0)).toBe('function')
  })

  it('hook does not return offsetY or overIdx', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR'], () => undefined)
    )
    const ret = result.current as Record<string, unknown>
    expect(ret['offsetY']).toBeUndefined()
    expect(ret['overIdx']).toBeUndefined()
  })

  it('ignores non-primary mouse button on pointerdown', () => {
    const { result } = renderHook(() =>
      useReorder(['USD', 'EUR', 'GBP'], () => undefined)
    )

    const containerEl = document.createElement('div')
    result.current.setContainerRef(containerEl)
    const itemEl = makeMockEl()
    result.current.setItemRef(0)(itemEl)

    act(() => {
      result.current.makeHandlers(0).onPointerDown(
        makePointerEvent(100, { pointerType: 'mouse', button: 2 })
      )
    })
    // Right-click should not start a drag
    expect(result.current.draggingIdx).toBeNull()
  })
})
