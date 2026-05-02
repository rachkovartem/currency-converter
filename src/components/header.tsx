'use client'

import { History, Settings } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { timeAgo } from '@/lib/time'

interface HeaderProps {
  ratesDate?: string
}

export function Header({ ratesDate }: HeaderProps) {
  const rows = useConverterStore(s => s.rows)
  const online = useConverterStore(s => s.online)
  const updatedAt = useConverterStore(s => s.updatedAt)
  const openRecents = useConverterStore(s => s.openRecents)
  const openSettings = useConverterStore(s => s.openSettings)

  const formattedRatesDate = ratesDate
    ? new Date(ratesDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div style={{ padding: '56px 20px 8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        {/* Live / Offline pill */}
        <div
          data-testid="live-status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 9px',
            borderRadius: 999,
            background: online ? 'oklch(0.78 0.18 145 / 0.13)' : 'oklch(0.72 0.20 25 / 0.13)',
            color: online ? 'var(--cc-pos)' : 'var(--cc-neg)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: online ? 'var(--cc-pos)' : 'var(--cc-neg)',
              animation: online ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          {online ? 'Live' : 'Offline'}
          <span
            data-testid="last-updated"
            style={{ color: 'var(--cc-text-muted)', fontWeight: 500, marginLeft: 2 }}
          >
            {formattedRatesDate ? `ECB · ${formattedRatesDate}` : `· ${timeAgo(updatedAt)}`}
          </span>
        </div>

        {/* Header action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={openRecents}
            aria-label="Recent conversions"
            style={{
              border: 'none',
              background: 'var(--cc-chip)',
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 18,
              color: 'var(--cc-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={17} />
          </button>
          <button
            data-testid="open-settings"
            onClick={openSettings}
            aria-label="Display settings"
            style={{
              border: 'none',
              background: 'var(--cc-chip)',
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 18,
              color: 'var(--cc-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: 'var(--cc-text)',
          letterSpacing: -0.8,
          lineHeight: 1.05,
        }}
      >
        Convert
      </div>
      <div style={{ fontSize: 14, color: 'var(--cc-text-muted)', marginTop: 4 }}>
        {rows.length} {rows.length === 1 ? 'currency' : 'currencies'} · tap any to edit
      </div>
    </div>
  )
}
