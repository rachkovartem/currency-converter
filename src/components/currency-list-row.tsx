'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import { Currency } from '@/lib/types'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { Sparkline } from '@/components/ui/sparkline'
import { SERIES } from '@/lib/rates'
import { formatNumber } from '@/lib/rates'
import { useSwipeToDelete } from '@/hooks/use-swipe-to-delete'

interface CurrencyListRowProps {
  currency: Currency
  value: string
  isActive: boolean
  onFocus: () => void
  onChange: (value: string) => void
  onSwap: () => void
  onDelete: () => void
  showFlag: boolean
  sparkline: boolean
  decimals: number
  density: 'compact' | 'comfortable'
  dragHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: ((e: React.PointerEvent) => void) | (() => void)
    onPointerCancel?: ((e: React.PointerEvent) => void) | (() => void)
  }
}

export function CurrencyListRow({
  currency,
  value,
  isActive,
  onFocus,
  onChange,
  onSwap,
  onDelete,
  showFlag,
  sparkline,
  decimals,
  density,
  dragHandlers,
}: CurrencyListRowProps) {
  const { dx, setDx, handlers } = useSwipeToDelete(onDelete)
  const padY = density === 'compact' ? 10 : 16
  const inputFs = density === 'compact' ? 'clamp(18px, 5.5vw, 24px)' : 'clamp(22px, 7vw, 30px)'

  // Compute display value length to drive dynamic expansion
  const displayValue = isActive ? value : formatNumber(parseFloat(value) || 0, decimals)
  const len = displayValue.length

  // Dynamic font size: shrink for very long numbers
  const valueFontSize =
    len > 16 ? 'clamp(13px, 3.8vw, 17px)' :
    len > 13 ? 'clamp(15px, 4.5vw, 20px)' :
    inputFs

  // collapseLevel: 0 = all visible, 1 = sparkline hidden, 2 = +name hidden, 3 = +flag hidden
  const [collapseLevel, setCollapseLevel] = useState(0)
  const rowRef = useRef<HTMLDivElement>(null)

  // Refs for key DOM elements
  const dragRef         = useRef<HTMLDivElement>(null)
  const buttonRef       = useRef<HTMLButtonElement>(null)
  const flagWrapRef     = useRef<HTMLDivElement>(null)
  const nameRef         = useRef<HTMLDivElement>(null)
  const sparklineWrapRef = useRef<HTMLDivElement>(null)
  const valueSizerRef   = useRef<HTMLSpanElement>(null)

  // Cache natural widths of optional elements (set when visible, reused when collapsed)
  const natW = useRef({ flag: 36, name: 80, sparkline: 52 })

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return

    const compute = () => {
      const rowW = row.offsetWidth
      if (!rowW) return

      // — Read actual gap from computed CSS (not resolveClamp) —
      const gap = parseFloat(getComputedStyle(row).gap) || 8

      // — Drag handle actual width from DOM —
      const dragW = dragRef.current?.offsetWidth ?? 30

      // — Update stored natural widths when those elements are currently visible —
      if (collapseLevel < 3 && flagWrapRef.current?.offsetWidth)
        natW.current.flag = flagWrapRef.current.offsetWidth
      if (collapseLevel < 2 && nameRef.current?.scrollWidth)
        natW.current.name = nameRef.current.scrollWidth
      if (collapseLevel < 1 && sparklineWrapRef.current?.offsetWidth)
        natW.current.sparkline = sparklineWrapRef.current.offsetWidth

      // — Value text width from hidden DOM span (uses real Inter font) —
      const valueTextW = valueSizerRef.current?.offsetWidth ?? 60
      const valueNeedsW = valueTextW + 6  // +6px comfort margin

      // — Compute allocation for each collapse level —
      // Layout: [drag] [gap] [button flex:1] [gap] [sparkline?] [gap?] [value flex:1 marginLeft:8]
      // Both button and value have flex:1 (base=0), so they share free space equally.
      // value content width = freeSpace/2 - 8 (because marginLeft:8 is part of value's outer size)
      // button content width = freeSpace/2

      const freeWithSparkline    = rowW - dragW - natW.current.sparkline - gap * 3 - 8
      const freeWithoutSparkline = rowW - dragW - 0                      - gap * 2 - 8

      const val0 = freeWithSparkline    / 2 - 8   // value width at level 0
      const val1 = freeWithoutSparkline / 2 - 8   // value width at level 1+
      const btn0 = freeWithSparkline    / 2        // button width at level 0
      const btn1 = freeWithoutSparkline / 2        // button width at level 1+

      // — Button content thresholds —
      const { flag: flagW } = natW.current
      const codeW = 45  // currency code is always 3 chars at ~15px bold ≈ 45px max
      const MIN_NAME_PX = 20  // minimum visible name width before full collapse (~2 chars)
      const btnNeedsAll    = flagW + codeW + MIN_NAME_PX + 8
      const btnNeedsNoName = flagW + codeW + 8            // flag+gap+code only

      // — Sequential level check (minimum level where everything fits) —
      // Level 0: sparkline + name + flag all visible
      if (val0 >= valueNeedsW && btn0 >= btnNeedsAll) {
        setCollapseLevel(0)
        return
      }
      // Level 1: sparkline hidden, name + flag visible
      if (val1 >= valueNeedsW && btn1 >= btnNeedsAll) {
        setCollapseLevel(1)
        return
      }
      // Level 2: sparkline + name hidden, flag visible
      if (val1 >= valueNeedsW && btn1 >= btnNeedsNoName) {
        setCollapseLevel(2)
        return
      }
      // Level 3: sparkline + name + flag hidden
      setCollapseLevel(3)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(row)
    return () => ro.disconnect()
  }, [displayValue, collapseLevel, density, sparkline, showFlag])

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 22,
      background: 'var(--cc-card-solid)',
      border: '0.5px solid var(--cc-card-border)',
      boxShadow: isActive
        ? '0 0 0 2px var(--cc-accent), 0 8px 24px rgba(0,0,0,0.06)'
        : '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    }}>
      {/* Delete bg layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--cc-neg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 26px',
          color: '#fff',
        }}
      >
        <Trash2 size={22} />
      </div>

      {/* Main card */}
      <div
        ref={rowRef}
        {...handlers}
        onClick={(e) => {
          if (Math.abs(dx) > 4) {
            setDx(0)
            e.stopPropagation()
          }
        }}
        style={{
          position: 'relative',
          background: 'var(--cc-card-solid)',
          transform: `translateX(${dx}px)`,
          transition:
            dx === 0 || dx === -140
              ? 'transform 220ms cubic-bezier(.2,.8,.2,1)'
              : 'none',
          padding: `${padY}px clamp(8px, 3vw, 14px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1.5vw, 10px)',
          touchAction: 'pan-y',
        }}
      >
        {/* Drag handle — always visible */}
        <div
          ref={dragRef}
          {...(dragHandlers ?? {})}
          style={{
            color: 'var(--cc-text-subtle)',
            cursor: 'grab',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 0',
            touchAction: 'none',
          }}
        >
          <GripVertical size={18} />
        </div>

        {/* Flag + code (tappable to swap) */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation()
            onSwap()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Flag avatar wrapper — collapses at level 3 */}
          <div
            ref={flagWrapRef}
            style={{
              maxWidth: collapseLevel >= 3 ? 0 : 40,
              overflow: 'hidden',
              opacity: collapseLevel >= 3 ? 0 : 1,
              flexShrink: 0,
              transition: 'max-width 180ms ease, opacity 140ms ease',
            }}>
            <FlagAvatar currency={currency} size={32} showFlag={showFlag} />
          </div>

          <div style={{ textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
            {/* Currency code — always visible */}
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--cc-text)',
                letterSpacing: -0.2,
                whiteSpace: 'nowrap',
              }}
            >
              {currency.code}
            </div>
            {/* Currency name — collapses at level 2 */}
            <div
              ref={nameRef}
              style={{
                fontSize: 11,
                color: 'var(--cc-text-muted)',
                lineHeight: 1.2,
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: collapseLevel >= 2 ? 0 : 120,
                opacity: collapseLevel >= 2 ? 0 : 1,
                transition: 'max-width 180ms ease, opacity 140ms ease',
              }}
            >
              {currency.name}
            </div>
          </div>
        </button>

        {/* Sparkline wrapper — collapses at level 1 */}
        {sparkline && (
          <div
            ref={sparklineWrapRef}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              maxWidth: collapseLevel >= 1 ? 0 : 48,
              overflow: 'hidden',
              opacity: collapseLevel >= 1 ? 0 : 1,
              transition: 'max-width 180ms ease, opacity 140ms ease',
            }}>
            <Sparkline
              data={SERIES[currency.code] ?? []}
              width={40}
              height={18}
              color="var(--cc-accent)"
            />
          </div>
        )}

        {/* Value input — flex:1 to grow into freed space */}
        <div
          style={{
            marginLeft: 8,
            flex: 1,
            textAlign: 'right',
            minWidth: 0,
            position: 'relative',
          }}
        >
          {/* Hidden sizer span — measures value text width using real browser font */}
          <span
            ref={valueSizerRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              visibility: 'hidden',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              fontSize: valueFontSize,
              fontWeight: 600,
              letterSpacing: '-0.6px',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'inherit',
            }}
          >
            {displayValue}
          </span>
          <div
            style={{
              fontSize: 11,
              color: 'var(--cc-text-subtle)',
              fontWeight: 500,
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {currency.symbol}
          </div>
          <input
            data-testid={`currency-input-${currency.code}`}
            value={isActive ? value : formatNumber(parseFloat(value) || 0, decimals)}
            onFocus={onFocus}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: valueFontSize,
              fontWeight: 600,
              color: isActive ? 'var(--cc-accent)' : 'var(--cc-text)',
              textAlign: 'right',
              width: '100%',
              padding: 0,
              letterSpacing: -0.6,
              fontVariantNumeric: 'tabular-nums',
              caretColor: 'var(--cc-accent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
