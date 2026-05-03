'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--cc-bg, #08080C)',
        color: 'var(--cc-text, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <WifiOff
        size={48}
        aria-hidden="true"
        style={{ opacity: 0.6 }}
      />

      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: 0,
        }}
      >
        Convert
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          You&apos;re offline
        </p>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--cc-text-muted, rgba(235,235,245,0.62))',
            margin: 0,
            maxWidth: '20rem',
          }}
        >
          Your last rates are still available &mdash; reconnect to refresh.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '0.5rem',
          padding: '0.625rem 1.5rem',
          background: 'var(--cc-accent, oklch(0.72 0.16 250))',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Retry
      </button>
    </div>
  )
}
