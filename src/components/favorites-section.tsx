'use client'

import { Star } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { convert, formatNumber } from '@/lib/rates'
import { Glass } from '@/components/ui/glass'
import { FlagAvatar } from '@/components/ui/flag-avatar'

export function FavoritesSection() {
  const favorites = useConverterStore(s => s.favorites)
  const activeCode = useConverterStore(s => s.activeCode)
  const rates = useConverterStore(s => s.rates)
  const showFlags = useConverterStore(s => s.showFlags)
  const openHistory = useConverterStore(s => s.openHistory)
  const toggleFavorite = useConverterStore(s => s.toggleFavorite)

  if (favorites.length === 0) return null

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: 'var(--cc-text-subtle)',
          }}
        >
          Favorites
        </div>
      </div>

      <Glass radius={20} padding="6px 12px">
        {favorites.map((code, i) => {
          const c = CURRENCY_BY_CODE[code]
          if (!c) return null

          return (
            <div
              key={code}
              onClick={() => openHistory({ from: activeCode, to: code })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openHistory({ from: activeCode, to: code })}
              style={{
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 4px',
                borderBottom:
                  i < favorites.length - 1 ? '0.5px solid var(--cc-sep)' : 'none',
              }}
            >
              <FlagAvatar currency={c} size={32} showFlag={showFlags} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cc-text)' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--cc-text-muted)', marginTop: 1 }}>
                  1 {activeCode} = {formatNumber(convert(1, activeCode, code, rates), 4)} {code}
                </div>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(code)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    toggleFavorite(code)
                  }
                }}
                style={{
                  cursor: 'pointer',
                  color: 'var(--cc-accent)',
                  padding: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <Star size={16} fill="var(--cc-accent)" color="var(--cc-accent)" />
              </span>
            </div>
          )
        })}
      </Glass>
    </div>
  )
}
