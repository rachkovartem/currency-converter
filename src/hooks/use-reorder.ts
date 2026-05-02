'use client'

import { useState, useRef } from 'react'

interface ReorderHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
}

interface UseReorderReturn {
  draggingIdx: number | null
  overIdx: number | null
  offsetY: number
  makeHandlers: (idx: number) => ReorderHandlers
}

export function useReorder(
  items: string[],
  onReorder: (items: string[]) => void
): UseReorderReturn {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const [offsetY, setOffsetY] = useState(0)
  const startY = useRef(0)
  const draggingIdxRef = useRef<number | null>(null)
  const overIdxRef = useRef<number | null>(null)

  const makeHandlers = (idx: number): ReorderHandlers => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      draggingIdxRef.current = idx
      overIdxRef.current = idx
      setDraggingIdx(idx)
      setOverIdx(idx)
      startY.current = e.clientY
      e.currentTarget.setPointerCapture?.(e.pointerId)
      e.stopPropagation()
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (draggingIdxRef.current == null) return
      const dy = e.clientY - startY.current
      setOffsetY(dy)
      // estimate row height ~88px; rough
      const delta = Math.round(dy / 88)
      const target = Math.max(0, Math.min(items.length - 1, draggingIdxRef.current + delta))
      overIdxRef.current = target
      setOverIdx(target)
    },
    onPointerUp: () => {
      const dIdx = draggingIdxRef.current
      const oIdx = overIdxRef.current
      if (dIdx != null && oIdx != null && oIdx !== dIdx) {
        const next = [...items]
        const [it] = next.splice(dIdx, 1)
        next.splice(oIdx, 0, it)
        onReorder(next)
      }
      draggingIdxRef.current = null
      overIdxRef.current = null
      setDraggingIdx(null)
      setOverIdx(null)
      setOffsetY(0)
    },
  })

  return { draggingIdx, overIdx, offsetY, makeHandlers }
}
