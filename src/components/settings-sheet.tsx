'use client'

import { LayoutList, LayoutGrid, Flag } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'
import { BottomSheet } from '@/components/ui/bottom-sheet'

export function SettingsSheet() {
  const settingsOpen = useConverterStore(s => s.settingsOpen)
  const closeSettings = useConverterStore(s => s.closeSettings)
  const layout = useConverterStore(s => s.layout)
  const density = useConverterStore(s => s.density)
  const showFlags = useConverterStore(s => s.showFlags)
  const setLayout = useConverterStore(s => s.setLayout)
  const setDensity = useConverterStore(s => s.setDensity)
  const setShowFlags = useConverterStore(s => s.setShowFlags)

  return (
    <BottomSheet open={settingsOpen} onClose={closeSettings} height="auto">
      <div data-testid="settings-sheet" style={{ padding: '0 0 40px' }}>
        {/* Header */}
        <div style={{ padding: '4px 20px 16px' }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--cc-text)',
              letterSpacing: -0.4,
            }}
          >
            Display Settings
          </div>
        </div>

        {/* Layout section */}
        <div style={{ padding: '0 20px 20px' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--cc-text-muted)',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Layout
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              data-testid="layout-list"
              onClick={() => setLayout('list')}
              aria-pressed={layout === 'list'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 12,
                border: layout === 'list'
                  ? '1.5px solid var(--cc-accent)'
                  : '1.5px solid var(--cc-card-border)',
                background: layout === 'list'
                  ? 'oklch(0.6 0.2 260 / 0.12)'
                  : 'var(--cc-card-solid)',
                color: layout === 'list' ? 'var(--cc-accent)' : 'var(--cc-text-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <LayoutList size={16} />
              List
            </button>
            <button
              data-testid="layout-grid"
              onClick={() => setLayout('grid')}
              aria-pressed={layout === 'grid'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 12,
                border: layout === 'grid'
                  ? '1.5px solid var(--cc-accent)'
                  : '1.5px solid var(--cc-card-border)',
                background: layout === 'grid'
                  ? 'oklch(0.6 0.2 260 / 0.12)'
                  : 'var(--cc-card-solid)',
                color: layout === 'grid' ? 'var(--cc-accent)' : 'var(--cc-text-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <LayoutGrid size={16} />
              Grid
            </button>
          </div>
        </div>

        {/* Appearance section */}
        <div style={{ padding: '0 20px 20px' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--cc-text-muted)',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Appearance
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              data-testid="density-compact"
              onClick={() => setDensity('compact')}
              aria-pressed={density === 'compact'}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: density === 'compact'
                  ? '1.5px solid var(--cc-accent)'
                  : '1.5px solid var(--cc-card-border)',
                background: density === 'compact'
                  ? 'oklch(0.6 0.2 260 / 0.12)'
                  : 'var(--cc-card-solid)',
                color: density === 'compact' ? 'var(--cc-accent)' : 'var(--cc-text-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Compact
            </button>
            <button
              data-testid="density-standard"
              onClick={() => setDensity('comfortable')}
              aria-pressed={density === 'comfortable'}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: density === 'comfortable'
                  ? '1.5px solid var(--cc-accent)'
                  : '1.5px solid var(--cc-card-border)',
                background: density === 'comfortable'
                  ? 'oklch(0.6 0.2 260 / 0.12)'
                  : 'var(--cc-card-solid)',
                color: density === 'comfortable' ? 'var(--cc-accent)' : 'var(--cc-text-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Standard
            </button>
          </div>
        </div>

        {/* Display section */}
        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--cc-text-muted)',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Display
          </div>

          {/* Show Flags toggle row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Flag size={18} color="var(--cc-text-muted)" />
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--cc-text)' }}>
                Show Flags
              </span>
            </div>
            <button
              data-testid="toggle-show-flags"
              onClick={() => setShowFlags(!showFlags)}
              aria-pressed={showFlags}
              aria-label="Toggle show flags"
              style={{
                position: 'relative',
                width: 51,
                height: 31,
                borderRadius: 15.5,
                border: 'none',
                background: showFlags ? 'var(--cc-accent)' : 'oklch(0.4 0 0)',
                cursor: 'pointer',
                transition: 'background 200ms ease',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: showFlags ? 22 : 2,
                  width: 27,
                  height: 27,
                  borderRadius: 13.5,
                  background: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  transition: 'left 200ms ease',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
