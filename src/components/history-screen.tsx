'use client'

import { useState, useMemo, memo } from 'react'
import { ChevronLeft, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConverterStore } from '@/store/converter-store'
import { CURRENCY_BY_CODE } from '@/lib/currencies'
import { SERIES, formatNumber } from '@/lib/rates'
import { Glass } from '@/components/ui/glass'
import { Segmented } from '@/components/ui/segmented'

const RANGE_OPTIONS = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
]

function HistoryScreenInner() {
  const historyPair = useConverterStore(s => s.historyPair)
  const closeHistory = useConverterStore(s => s.closeHistory)
  const showFlags = useConverterStore(s => s.showFlags)

  const [range, setRange] = useState('1M')

  const data = useMemo(() => {
    if (!historyPair) return []
    const base = SERIES[historyPair.to] ?? []
    const points =
      range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 60 : 90
    const out: number[] = []
    for (let i = 0; i < points; i++) {
      const idx = Math.floor((i / points) * base.length)
      out.push(base[idx] ?? base[base.length - 1] ?? 1)
    }
    return out
  }, [historyPair, range])

  if (!historyPair) return null

  const fromCur = CURRENCY_BY_CODE[historyPair.from]
  const toCur = CURRENCY_BY_CODE[historyPair.to]

  if (!fromCur || !toCur) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const last = data[data.length - 1] ?? 1
  const first = data[0] ?? 1
  const change = ((last - first) / first) * 100
  const trendUp = change >= 0

  const W = 320
  const H = 160
  const stepX = W / (data.length - 1)
  const pts = data.map((v, i): [number, number] => [
    i * stepX,
    H - ((v - min) / (max - min || 1)) * (H - 4) - 2,
  ])
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`

  const c = trendUp ? 'var(--cc-pos)' : 'var(--cc-neg)'
  const endPt = pts[pts.length - 1]

  const avg = data.reduce((a, b) => a + b, 0) / data.length
  const volatility = (((max - min) / first) * 100).toFixed(2)

  return (
    <motion.div
      data-testid="history-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'var(--cc-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <div
        style={{
          padding: '56px 16px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={closeHistory}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--cc-accent)',
            fontFamily: 'inherit',
            fontSize: 16,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cc-text)' }}>
          {historyPair.from} → {historyPair.to}
        </div>
        <button
          style={{
            border: 'none',
            background: 'var(--cc-chip)',
            cursor: 'pointer',
            width: 32,
            height: 32,
            borderRadius: 16,
            color: 'var(--cc-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 80px' }}
      >
        {/* Hero */}
        <div style={{ marginTop: 16, marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            {showFlags && <span style={{ fontSize: 28 }}>{toCur.flag}</span>}
            <div>
              <div style={{ fontSize: 13, color: 'var(--cc-text-muted)', fontWeight: 500 }}>
                1 {historyPair.from} =
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: 'var(--cc-text)',
                  letterSpacing: -1,
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(last, last < 10 ? 4 : 2)} {historyPair.to}
              </div>
            </div>
          </div>

          {/* Change badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 8,
              background: trendUp ? 'oklch(0.78 0.18 145 / 0.13)' : 'oklch(0.72 0.20 25 / 0.13)',
              color: c,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <TrendingUp size={14} color={c} strokeWidth={2.5} />
            {trendUp ? '+' : ''}{change.toFixed(2)}%
            <span style={{ color: 'var(--cc-text-muted)', fontWeight: 500, marginLeft: 4 }}>
              past {range.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Chart card */}
        <Glass radius={22} padding={20} style={{ marginBottom: 18 }}>
          <svg
            width={W}
            height={H}
            style={{ display: 'block', overflow: 'visible', maxWidth: '100%' }}
          >
            <defs>
              <linearGradient id="histfill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity="0.28" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#histfill)" />
            <path
              d={line}
              fill="none"
              stroke={c}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {endPt && (
              <circle
                cx={endPt[0]}
                cy={endPt[1]}
                r="4"
                fill={c}
                stroke="var(--cc-card-solid)"
                strokeWidth="2"
              />
            )}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <Segmented value={range} options={RANGE_OPTIONS} onChange={setRange} />
          </div>
        </Glass>

        {/* Stats grid */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {[
            ['High', formatNumber(max, 4)],
            ['Low', formatNumber(min, 4)],
            ['Average', formatNumber(avg, 4)],
            ['Volatility', `${volatility}%`],
          ].map(([label, val]) => (
            <Glass key={label} radius={16} padding="12px 14px">
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--cc-text-muted)',
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--cc-text)',
                  letterSpacing: -0.3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {val}
              </div>
            </Glass>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export const HistoryScreen = memo(function HistoryScreen() {
  const historyPair = useConverterStore(s => s.historyPair)

  return (
    <AnimatePresence>
      {historyPair && <HistoryScreenInner key="history" />}
    </AnimatePresence>
  )
})
