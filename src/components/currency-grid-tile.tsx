'use client'

import { GripVertical } from 'lucide-react'
import { Currency } from '@/lib/types'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { formatNumber } from '@/lib/rates'

interface CurrencyGridTileProps {
  currency: Currency
  value: string
  isActive: boolean
  onFocus: () => void
  onChange: (value: string) => void
  onSwap: () => void
  showFlag: boolean
  decimals: number
  dragHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: () => void
  }
}

export function CurrencyGridTile({
  currency,
  value,
  isActive,
  onFocus,
  onChange,
  onSwap,
  showFlag,
  decimals,
  dragHandlers,
}: CurrencyGridTileProps) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 22,
        padding: 14,
        background: 'var(--cc-card-solid)',
        border: '0.5px solid var(--cc-card-border)',
        boxShadow: isActive
          ? '0 0 0 2px var(--cc-accent), 0 8px 24px rgba(0,0,0,0.06)'
          : '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 130,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onSwap}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
          }}
        >
          <FlagAvatar currency={currency} size={28} showFlag={showFlag} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--cc-text)',
              letterSpacing: -0.2,
            }}
          >
            {currency.code}
          </div>
        </button>
        <div
          {...(dragHandlers ?? {})}
          style={{ marginLeft: 'auto', color: 'var(--cc-text-subtle)', cursor: 'grab' }}
        >
          <GripVertical size={16} />
        </div>
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
          fontSize: 26,
          fontWeight: 700,
          color: isActive ? 'var(--cc-accent)' : 'var(--cc-text)',
          padding: 0,
          width: '100%',
          letterSpacing: -0.6,
          fontVariantNumeric: 'tabular-nums',
          caretColor: 'var(--cc-accent)',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--cc-text-muted)', fontWeight: 500 }}>
          {currency.symbol} · {currency.name}
        </div>
      </div>
    </div>
  )
}
