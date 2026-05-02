'use client'

import { Plus } from 'lucide-react'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px 80px',
        textAlign: 'center',
        gap: 18,
      }}
    >
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 60,
            background: 'radial-gradient(circle, var(--cc-accent-soft), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 18,
            borderRadius: 42,
            background: 'var(--cc-card-solid)',
            border: '0.5px solid var(--cc-card-border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-8deg)',
          }}
        >
          <span style={{ fontSize: 36 }}>💱</span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 4,
            width: 32,
            height: 32,
            borderRadius: 16,
            background: 'var(--cc-accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--cc-text)',
            letterSpacing: -0.4,
          }}
        >
          Add your first currency
        </div>
        <div
          style={{
            fontSize: 14,
            color: 'var(--cc-text-muted)',
            marginTop: 8,
            maxWidth: 260,
            lineHeight: 1.45,
          }}
        >
          Track exchange rates and convert between any currencies in real time.
        </div>
      </div>

      <button
        onClick={onAdd}
        style={{
          marginTop: 6,
          background: 'var(--cc-accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 28px',
          borderRadius: 16,
          fontFamily: 'inherit',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Currency
      </button>
    </div>
  )
}
