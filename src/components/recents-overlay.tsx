'use client'

import { X, ChevronRight } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { convert, formatNumber } from '@/lib/rates'
import { timeAgo } from '@/lib/time'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { RecentConversion } from '@/lib/types'

export function RecentsOverlay() {
  const showRecents = useConverterStore(s => s.showRecents)
  const closeRecents = useConverterStore(s => s.closeRecents)
  const pickRecent = useConverterStore(s => s.pickRecent)
  const recents = useConverterStore(s => s.recents)
  const showFlags = useConverterStore(s => s.showFlags)
  const rates = useConverterStore(s => s.rates)

  return (
    <BottomSheet open={showRecents} onClose={closeRecents} height="auto">
      <div data-testid="recents-overlay" style={{ padding: '0 0 32px' }}>
        {/* Header */}
        <div
          style={{
            padding: '4px 20px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--cc-text)',
              letterSpacing: -0.4,
            }}
          >
            Recent
          </div>
          <button
            onClick={closeRecents}
            aria-label="Close recents"
            style={{
              border: 'none',
              background: 'var(--cc-chip)',
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius: 16,
              color: 'var(--cc-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Recents list */}
        <div style={{ padding: '4px 20px' }}>
          {recents.map((r: RecentConversion, i: number) => {
            const f = CURRENCY_BY_CODE[r.from]
            const t = CURRENCY_BY_CODE[r.to]
            if (!f || !t) return null
            const result = convert(r.amount, r.from, r.to, rates)

            return (
              <button
                key={i}
                onClick={() => pickRecent(r)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '14px 4px',
                  borderBottom:
                    i < recents.length - 1 ? '0.5px solid var(--cc-sep)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Overlapping flags */}
                <div style={{ display: 'flex' }}>
                  <FlagAvatar currency={f} size={32} showFlag={showFlags} />
                  <div
                    style={{
                      marginLeft: -10,
                      zIndex: 1,
                      border: '2px solid #1c1c1e',
                      borderRadius: 18,
                    }}
                  >
                    <FlagAvatar currency={t} size={32} showFlag={showFlags} />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--cc-text)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatNumber(r.amount, 2)} {r.from} → {formatNumber(result, 2)} {r.to}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cc-text-muted)', marginTop: 2 }}>
                    {timeAgo(r.ts)}
                  </div>
                </div>

                <ChevronRight size={16} color="var(--cc-text-subtle)" />
              </button>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
