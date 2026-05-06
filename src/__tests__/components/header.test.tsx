import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/header'
import { useConverterStore } from '@/store/converter-store'
import { usePWAInstall } from '@/hooks/use-pwa-install'

vi.mock('@/hooks/use-pwa-install', () => ({
  usePWAInstall: vi.fn(() => ({ isInstallable: false, install: vi.fn() })),
}))

const baseState = {
  rows: ['USD', 'EUR'],
  online: true,
  updatedAt: 0,
  openRecents: vi.fn(),
  openSettings: vi.fn(),
}

beforeEach(() => {
  useConverterStore.setState(baseState)
})

describe('Header — Convert h1', () => {
  it('renders an h1 element with text "Convert"', () => {
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Convert' })
    expect(h1).toBeTruthy()
  })
})

describe('Header — last-updated span', () => {
  it('hides the last-updated span when updatedAt is 0', () => {
    useConverterStore.setState({ ...baseState, updatedAt: 0 })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    expect(screen.queryByTestId('last-updated')).toBeNull()
  })

  it('shows "Rates · <formatted date>" when updatedAt is a valid timestamp', () => {
    // May 3, 2026 00:00:00 UTC in ms
    const ts = new Date('2026-05-03T00:00:00Z').getTime()
    useConverterStore.setState({ ...baseState, updatedAt: ts })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const span = screen.getByTestId('last-updated')
    expect(span).toBeTruthy()
    expect(span.textContent).toMatch(/^Rates · /)
    expect(span.textContent).toContain('2026')
  })
})

describe('Header — install banner', () => {
  it('does not render install banner when isInstallable is false', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: false, install: vi.fn() })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    expect(screen.queryByTestId('install-banner')).toBeNull()
  })

  it('renders install banner with "Install app" text when isInstallable is true', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install: vi.fn() })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const banner = screen.getByTestId('install-banner')
    expect(banner).toBeTruthy()
    expect(banner.textContent).toContain('Install app')
  })

  it('calls install() when install banner is clicked', () => {
    const install = vi.fn()
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const banner = screen.getByTestId('install-banner')
    fireEvent.click(banner)
    expect(install).toHaveBeenCalledTimes(1)
  })

  it('hides banner when dismiss button is clicked', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install: vi.fn() })
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    expect(screen.getByTestId('install-banner')).toBeTruthy()
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss install banner' })
    fireEvent.click(dismissBtn)
    expect(screen.queryByTestId('install-banner')).toBeNull()
  })
})

describe('Header — refresh button', () => {
  it('renders the refresh button with correct testid and aria-label', () => {
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const btn = screen.getByTestId('refresh-rates-btn')
    expect(btn).toBeTruthy()
    expect(btn.getAttribute('aria-label')).toBe('Refresh rates')
  })

  it('calls onRefresh when the refresh button is clicked', () => {
    const onRefresh = vi.fn()
    render(<Header isRefreshing={false} onRefresh={onRefresh} />)
    const btn = screen.getByTestId('refresh-rates-btn')
    fireEvent.click(btn)
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('refresh icon has spin animation when isRefreshing is true', () => {
    render(<Header isRefreshing={true} onRefresh={vi.fn()} />)
    const btn = screen.getByTestId('refresh-rates-btn')
    // The SVG icon inside the button should have the spin animation style
    const icon = btn.querySelector('svg')
    expect(icon).toBeTruthy()
    expect(icon?.style.animation).toContain('spin')
  })

  it('refresh icon has no spin animation when isRefreshing is false', () => {
    render(<Header isRefreshing={false} onRefresh={vi.fn()} />)
    const btn = screen.getByTestId('refresh-rates-btn')
    const icon = btn.querySelector('svg')
    expect(icon).toBeTruthy()
    // style should not contain spin
    const style = icon?.getAttribute('style') ?? ''
    expect(style).not.toContain('spin')
  })
})
