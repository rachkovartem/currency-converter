'use client'

import { ArrowUp } from 'lucide-react'

interface UpdateBannerProps {
  onReload: () => void
}

export function UpdateBanner({ onReload }: UpdateBannerProps) {
  return (
    <div
      data-testid="update-banner"
      role="status"
      style={{
        marginTop: 10,
        borderRadius: 12,
        background: 'oklch(0.6 0.2 260 / 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ArrowUp size={15} color="var(--cc-accent)" />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cc-accent)' }}>
          New version available
        </span>
      </div>
      <button
        type="button"
        data-testid="reload-btn"
        onClick={onReload}
        style={{
          background: 'var(--cc-accent)',
          color: '#000',
          border: 'none',
          borderRadius: 999,
          padding: '5px 12px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  )
}
