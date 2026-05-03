'use client'

import { X } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { BottomSheet } from '@/components/ui/bottom-sheet'

export function RecentsOverlay() {
  const showRecents = useConverterStore(s => s.showRecents)
  const closeRecents = useConverterStore(s => s.closeRecents)
  const recentCurrencies = useConverterStore(s => s.recentCurrencies)
  const addCurrency = useConverterStore(s => s.addCurrency)
  const showFlags = useConverterStore(s => s.showFlags)

  return (
    <BottomSheet open={showRecents} onClose={closeRecents} height="auto">
      <div data-testid="recents-overlay" style={{ padding: '0 0 32px' }}>
        {/* Header */}
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cc-text)', letterSpacing: -0.4 }}>
            Recent
          </div>
          <button
            onClick={closeRecents}
            aria-label="Close recents"
            style={{
              border: 'none', background: 'var(--cc-chip)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 16, color: 'var(--cc-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Currency list */}
        <div style={{ padding: '4px 20px' }}>
          {recentCurrencies.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: 'var(--cc-text-muted)' }}>
              No recent currencies
            </div>
          ) : (
            recentCurrencies.map((code) => {
              const c = CURRENCY_BY_CODE[code]
              if (!c) return null
              return (
                <button
                  key={code}
                  data-testid={`recent-currency-${code}`}
                  onClick={() => { addCurrency(code); closeRecents() }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    padding: '12px 4px',
                    borderBottom: '0.5px solid var(--cc-sep)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <FlagAvatar currency={c} size={32} showFlag={showFlags} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cc-text)' }}>{c.code}</div>
                    <div style={{ fontSize: 12, color: 'var(--cc-text-muted)', marginTop: 1 }}>{c.name}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
