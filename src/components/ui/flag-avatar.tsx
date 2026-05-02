'use client'

import { Currency } from '@/lib/types'

interface FlagAvatarProps {
  currency: Currency
  size?: number
  showFlag?: boolean
}

export function FlagAvatar({ currency, size = 36, showFlag = true }: FlagAvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: 'var(--cc-chip)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: showFlag ? size * 0.72 : size * 0.36,
        fontWeight: 700,
        letterSpacing: -0.4,
        color: 'var(--cc-text-muted)',
        flexShrink: 0,
        overflow: 'hidden',
        lineHeight: 1,
      }}
    >
      {showFlag ? (
        <span style={{ filter: 'saturate(1.05)' }}>{currency.flag}</span>
      ) : (
        currency.code
      )}
    </div>
  )
}
