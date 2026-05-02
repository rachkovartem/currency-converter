'use client'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
  strokeWidth?: number
}

export function Sparkline({
  data,
  width = 60,
  height = 22,
  color = '#5684FF',
  fillOpacity = 0.18,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) return <svg width={width} height={height} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pts = data.map((v, i): [number, number] => [
    i * stepX,
    height - ((v - min) / range) * (height - 2) - 1,
  ])
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  const gradId = `sparkfill-${width}-${color.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
