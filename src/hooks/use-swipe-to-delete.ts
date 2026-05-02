'use client'

import { useState, useRef } from 'react'

interface SwipeHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

interface UseSwipeToDeleteReturn {
  dx: number
  setDx: (dx: number) => void
  handlers: SwipeHandlers
  moved: React.MutableRefObject<boolean>
}

export function useSwipeToDelete(
  onDelete: (() => void) | undefined,
  threshold = 80
): UseSwipeToDeleteReturn {
  const [dx, setDx] = useState(0)
  const startX = useRef<number | null>(null)
  const moved = useRef(false)
  const dxRef = useRef(0)

  // Keep dxRef in sync with dx for use in onPointerUp closure
  const updateDx = (val: number) => {
    dxRef.current = val
    setDx(val)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startX.current = e.clientX
    moved.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return
    const d = e.clientX - startX.current
    if (Math.abs(d) > 4) moved.current = true
    if (d < 0) updateDx(Math.max(d, -140))
    else updateDx(0)
  }

  const onPointerUp = () => {
    if (startX.current == null) return
    if (dxRef.current <= -threshold) {
      updateDx(-140)
      setTimeout(() => onDelete?.(), 160)
    } else {
      updateDx(0)
    }
    startX.current = null
  }

  return {
    dx,
    setDx: updateDx,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    moved,
  }
}
