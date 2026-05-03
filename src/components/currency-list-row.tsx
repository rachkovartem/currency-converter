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
  const padY = density === 'compact' ? 10 : 16
  const inputFs = density === 'compact' ? 'clamp(18px, 5.5vw, 24px)' : 'clamp(22px, 7vw, 30px)'

  // Compute display value length to drive dynamic expansion
  const displayValue = isActive ? value : formatNumber(parseFloat(value) || 0, decimals)
  const len = displayValue.length

  // Dynamic font size: shrink for very long numbers
  const valueFontSize =
    len > 14 ? 'clamp(13px, 3.8vw, 17px)' :
    len > 10 ? 'clamp(15px, 4.5vw, 20px)' :
    inputFs

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
          padding: `${padY}px clamp(8px, 3vw, 14px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1.5vw, 10px)',
          touchAction: 'pan-y',
        }}
      >
        {/* Drag handle — always visible */}
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
            gap: 8,
            padding: 0,
            minWidth: 0,
            flexShrink: 1,
            overflow: 'hidden',
          }}
        >
          {/* Flag avatar wrapper — collapses at level 2 (len ≥ 12) */}
          <div style={{
            maxWidth: len >= 12 ? 0 : 40,
            overflow: 'hidden',
            opacity: len >= 12 ? 0 : 1,
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
            {/* Currency name — collapses at level 1 (len ≥ 8) */}
            <div
              style={{
                fontSize: 11,
                color: 'var(--cc-text-muted)',
                lineHeight: 1.2,
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: len >= 8 ? 0 : 120,
                opacity: len >= 8 ? 0 : 1,
                transition: 'max-width 180ms ease, opacity 140ms ease',
              }}
            >
              {currency.name}
            </div>
          </div>
        </button>

        {/* Sparkline wrapper — collapses at level 2 (len ≥ 12) */}
        {sparkline && (
          <div style={{
            marginLeft: 'auto',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            maxWidth: len >= 12 ? 0 : 48,
            overflow: 'hidden',
            opacity: len >= 12 ? 0 : 1,
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
            marginLeft: (sparkline && len < 12) ? 8 : 'auto',
            flexShrink: 0,
            textAlign: 'right',
            flex: 1,
            minWidth: 0,
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
