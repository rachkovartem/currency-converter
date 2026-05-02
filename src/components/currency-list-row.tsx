'use client'

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
    onPointerUp: () => void
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
  const padY = density === 'compact' ? 12 : 18
  const inputFs = density === 'compact' ? 24 : 30

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
          padding: `${padY}px 16px`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          touchAction: 'pan-y',
        }}
      >
        {/* Drag handle */}
        <div
          {...(dragHandlers ?? {})}
          style={{
            color: 'var(--cc-text-subtle)',
            cursor: 'grab',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <GripVertical size={18} />
        </div>

        {/* Flag + code (tappable to swap) */}
        <button
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
            gap: 10,
            padding: 0,
          }}
        >
          <FlagAvatar currency={currency} size={36} showFlag={showFlag} />
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--cc-text)',
                letterSpacing: -0.2,
              }}
            >
              {currency.code}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--cc-text-muted)',
                lineHeight: 1.2,
                marginTop: 1,
              }}
            >
              {currency.name}
            </div>
          </div>
        </button>

        {/* Sparkline */}
        {sparkline && (
          <div style={{ marginLeft: 'auto', minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <Sparkline
              data={SERIES[currency.code] ?? []}
              width={48}
              height={20}
              color="var(--cc-accent)"
            />
          </div>
        )}

        {/* Value input */}
        <div
          style={{
            marginLeft: sparkline ? 8 : 'auto',
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
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
              fontSize: inputFs,
              fontWeight: 600,
              color: isActive ? 'var(--cc-accent)' : 'var(--cc-text)',
              textAlign: 'right',
              width: 'clamp(80px, 30vw, 130px)',
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
