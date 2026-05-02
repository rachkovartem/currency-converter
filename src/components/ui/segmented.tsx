'use client'

interface SegmentedOption {
  value: string
  label: string
}

interface SegmentedProps {
  value: string
  options: SegmentedOption[]
  onChange: (value: string) => void
}

export function Segmented({ value, options, onChange }: SegmentedProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 3,
        borderRadius: 12,
        background: 'var(--cc-chip)',
        gap: 2,
      }}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              border: 'none',
              cursor: 'pointer',
              padding: '7px 14px',
              borderRadius: 10,
              background: active ? 'var(--cc-card-solid)' : 'transparent',
              color: active ? 'var(--cc-text)' : 'var(--cc-text-muted)',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'background 200ms ease, color 200ms ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
