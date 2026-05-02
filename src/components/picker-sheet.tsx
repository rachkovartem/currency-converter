'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Check, Plus } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { CURRENCIES, CURRENCY_BY_CODE } from '@/lib/currencies'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { BottomSheet } from '@/components/ui/bottom-sheet'

export function PickerSheet() {
  const pickerOpen = useConverterStore(s => s.pickerOpen)
  const closePicker = useConverterStore(s => s.closePicker)
  const addCurrency = useConverterStore(s => s.addCurrency)
  const rows = useConverterStore(s => s.rows)
  const showFlags = useConverterStore(s => s.showFlags)

  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    // When picker opens (false → true), focus the input after animation
    if (pickerOpen && !prevOpenRef.current) {
      const timer = setTimeout(() => {
        setQuery('')
        inputRef.current?.focus()
      }, 320)
      prevOpenRef.current = true
      return () => clearTimeout(timer)
    }
    if (!pickerOpen) {
      prevOpenRef.current = false
    }
  }, [pickerOpen])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CURRENCIES
    return CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    )
  }, [query])

  const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD']

  return (
    <BottomSheet open={pickerOpen} onClose={closePicker} height="78%">
      <div data-testid="picker-sheet" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--cc-text)',
                letterSpacing: -0.4,
              }}
            >
              Add Currency
            </div>
            <button
              onClick={closePicker}
              aria-label="Close picker"
              style={{
                border: 'none',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: 16,
                background: 'var(--cc-chip)',
                color: 'var(--cc-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--cc-input-bg)',
              borderRadius: 14,
              padding: '11px 14px',
              border: '0.5px solid var(--cc-card-border)',
            }}
          >
            <Search size={18} color="var(--cc-text-muted)" />
            <input
              ref={inputRef}
              data-testid="picker-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, code, or country"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: 15,
                color: 'var(--cc-text)',
                flex: 1,
                padding: 0,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--cc-text-muted)',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Popular chips */}
        {!query && (
          <div style={{ padding: '0 20px 8px' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: 'var(--cc-text-subtle)',
                marginBottom: 8,
              }}
            >
              Popular
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {popular.map(code => {
                const c = CURRENCY_BY_CODE[code]
                if (!c) return null
                const added = rows.includes(code)
                return (
                  <button
                    key={code}
                    disabled={added}
                    onClick={() => addCurrency(code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 999,
                      border: '0.5px solid var(--cc-card-border)',
                      background: added ? 'transparent' : 'var(--cc-card-solid)',
                      color: added ? 'var(--cc-text-subtle)' : 'var(--cc-text)',
                      cursor: added ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: added ? 0.5 : 1,
                    }}
                  >
                    {showFlags && (
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{c.flag}</span>
                    )}
                    {c.code}
                    {added && <Check size={13} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Currency list */}
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 32px' }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--cc-text-muted)',
                padding: '40px 0',
                fontSize: 14,
              }}
            >
              No matches for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((c, i) => {
              const added = rows.includes(c.code)
              return (
                <button
                  key={c.code}
                  disabled={added}
                  onClick={() => addCurrency(c.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 4px',
                    border: 'none',
                    borderBottom:
                      i < filtered.length - 1
                        ? '0.5px solid var(--cc-sep)'
                        : 'none',
                    background: 'transparent',
                    cursor: added ? 'default' : 'pointer',
                    opacity: added ? 0.45 : 1,
                  }}
                >
                  <FlagAvatar currency={c} size={36} showFlag={showFlags} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cc-text)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cc-text-muted)', marginTop: 1 }}>
                      {c.code} · {c.country}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--cc-text-muted)',
                      marginRight: 4,
                    }}
                  >
                    {c.symbol}
                  </div>
                  {added ? (
                    <Check size={18} color="var(--cc-accent)" />
                  ) : (
                    <Plus size={18} color="var(--cc-text-muted)" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
