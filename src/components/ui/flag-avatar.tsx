'use client'

import { Currency } from '@/lib/types'

interface FlagAvatarProps {
  currency: Currency
  size?: number
  showFlag?: boolean
}

export function FlagAvatar({ currency, size = 36, showFlag = true }: FlagAvatarProps) {
  if (!showFlag) return null

  return (
    <div
      role="img"
      aria-label={`${currency.name} (${currency.code})`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: 'var(--cc-chip)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.72,
        flexShrink: 0,
        overflow: 'hidden',
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true" style={{ filter: 'saturate(1.05)' }}>{currency.flag}</span>
    </div>
  )
}
