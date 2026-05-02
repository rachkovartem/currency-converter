'use client'

interface GlassProps {
  children: React.ReactNode
  radius?: number
  padding?: number | string
  opaque?: boolean
  blur?: number
  style?: React.CSSProperties
  className?: string
}

export function Glass({
  children,
  radius = 24,
  padding = 0,
  opaque = false,
  blur = 22,
  style = {},
  className,
}: GlassProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: radius,
        background: opaque ? 'var(--cc-card-solid)' : 'var(--cc-card)',
        backdropFilter: opaque ? 'none' : `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: opaque ? 'none' : `blur(${blur}px) saturate(180%)`,
        border: '0.5px solid var(--cc-card-border)',
        boxShadow: 'var(--cc-card-shine), 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
