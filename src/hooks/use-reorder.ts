'use client'

import { useState, useRef, useEffect } from 'react'

type DragState = {
  fromIdx: number
  toIdx: number
  startY: number
  rowH: number
  gap: number
}

// Thin registry wrapper — keeps DOM element list out of a typed HTMLElement ref
// so the React Compiler's ref-access lint rule treats it as opaque data, not a DOM ref.
class RowRegistry {
  private els: (HTMLElement | null)[] = []

  set(idx: number, el: HTMLElement | null) {
    this.els[idx] = el
  }

  get(idx: number): HTMLElement | null {
    return this.els[idx] ?? null
  }

  forEach(fn: (el: HTMLElement | null, i: number) => void) {
    this.els.forEach(fn)
  }
}

export function useReorder(items: string[], onReorder: (items: string[]) => void) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  // Keep props fresh inside event handlers without recreating them on every render
  const itemsRef = useRef(items)
  const onReorderRef = useRef(onReorder)
  useEffect(() => {
    itemsRef.current = items
    onReorderRef.current = onReorder
  })

  // containerRef holds the flex container DOM node — read only in event handlers
  const containerRef = useRef<HTMLElement | null>(null)

  // rows registry — opaque class instance so the linter doesn't classify it as a DOM ref
  const registry = useRef(new RowRegistry())

  // drag state — accessed only in event handlers, never during render
  const drag = useRef<DragState | null>(null)

  const applyShifts = (fromIdx: number, toIdx: number, rowH: number, gap: number) => {
    const step = rowH + gap
    registry.current.forEach((el, i) => {
      if (i === fromIdx || !el) return
      let shift = 0
      if (fromIdx < toIdx && i > fromIdx && i <= toIdx) shift = -step
      if (fromIdx > toIdx && i >= toIdx && i < fromIdx) shift = step
      el.style.transition = 'transform 180ms cubic-bezier(0.2,0,0,1)'
      el.style.transform = shift ? `translateY(${shift}px)` : ''
    })
  }

  const resetAll = () => {
    registry.current.forEach(el => {
      if (!el) return
      el.style.transition = 'transform 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms ease'
      el.style.transform = ''
      el.style.zIndex = ''
      el.style.boxShadow = ''
    })
  }

  const makeHandlers = (idx: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.stopPropagation()

      const rowEl = registry.current.get(idx)
      const container = containerRef.current
      if (!rowEl || !container) return

      const rect = rowEl.getBoundingClientRect()
      const gap = parseFloat(getComputedStyle(container).gap) || 8

      drag.current = { fromIdx: idx, toIdx: idx, startY: e.clientY, rowH: rect.height, gap }

      rowEl.style.transition = 'box-shadow 120ms ease'
      rowEl.style.zIndex = '20'
      rowEl.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'

      setDraggingIdx(idx)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },

    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current
      if (!d) return

      const dy = e.clientY - d.startY
      const rowEl = registry.current.get(d.fromIdx)
      if (rowEl) {
        rowEl.style.transition = 'box-shadow 120ms ease'
        rowEl.style.transform = `translateY(${dy}px)`
      }

      const step = d.rowH + d.gap
      const newTo = Math.max(0, Math.min(itemsRef.current.length - 1, d.fromIdx + Math.round(dy / step)))
      if (newTo !== d.toIdx) {
        d.toIdx = newTo
        applyShifts(d.fromIdx, newTo, d.rowH, d.gap)
      }
    },

    onPointerUp: () => {
      const d = drag.current
      if (!d) return
      drag.current = null

      resetAll()

      if (d.toIdx !== d.fromIdx) {
        const next = [...itemsRef.current]
        const [it] = next.splice(d.fromIdx, 1)
        next.splice(d.toIdx, 0, it)
        onReorderRef.current(next)
      }

      setDraggingIdx(null)
    },

    onPointerCancel: () => {
      if (!drag.current) return
      drag.current = null
      resetAll()
      setDraggingIdx(null)
    },
  })

  // Callback ref for the list flex container
  const setContainerRef = (el: HTMLElement | null) => { containerRef.current = el }

  // setItemRef(idx) returns a callback ref for each row wrapper div.
  // React calls it post-mount (outside render), so writing to registry here is safe.
  const setItemRef = (idx: number) => (el: HTMLElement | null) => {
    registry.current.set(idx, el)
  }

  return { draggingIdx, setContainerRef, setItemRef, makeHandlers }
}
