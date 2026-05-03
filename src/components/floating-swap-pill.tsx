'use client'

import { ArrowUpDown } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { convert, formatNumber } from '@/lib/rates'
import { Glass } from '@/components/ui/glass'

export function FloatingSwapPill() {
  const rows = useConverterStore(s => s.rows)
  const activeCode = useConverterStore(s => s.activeCode)
  const rates = useConverterStore(s => s.rates)

  if (rows.length === 0) return null

  const others = rows.filter(c => c !== activeCode)
  const target = others[0] ?? activeCode

  return (
    <div
      data-testid="swap-pill"
      style={{
        position: 'fixed',
        bottom: 'calc(32px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        pointerEvents: 'none',
        maxWidth: 500,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Glass
        radius={999}
        padding="8px 14px"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'auto',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cc-text)' }}>
          1 {activeCode}
        </span>
        <ArrowUpDown size={12} color="var(--cc-text-muted)" />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--cc-accent)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatNumber(convert(1, activeCode, target, rates), 4)} {target}
        </span>
      </Glass>
    </div>
  )
}
