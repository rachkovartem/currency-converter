import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/header'
import { useConverterStore } from '@/store/converter-store'
import { usePWAInstall } from '@/hooks/use-pwa-install'

vi.mock('@/hooks/use-rates', () => ({
  useRates: () => undefined,
}))

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
    render(<Header />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Convert' })
    expect(h1).toBeTruthy()
  })
})

describe('Header — last-updated span', () => {
  it('hides the last-updated span when updatedAt is 0', () => {
    useConverterStore.setState({ ...baseState, updatedAt: 0 })
    render(<Header />)
    expect(screen.queryByTestId('last-updated')).toBeNull()
  })

  it('shows "ECB · <formatted date>" when updatedAt is a valid timestamp', () => {
    // May 3, 2026 00:00:00 UTC in ms
    const ts = new Date('2026-05-03T00:00:00Z').getTime()
    useConverterStore.setState({ ...baseState, updatedAt: ts })
    render(<Header />)
    const span = screen.getByTestId('last-updated')
    expect(span).toBeTruthy()
    expect(span.textContent).toMatch(/^ECB · /)
    expect(span.textContent).toContain('2026')
  })
})

describe('Header — install banner', () => {
  it('does not render install banner when isInstallable is false', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: false, install: vi.fn() })
    render(<Header />)
    expect(screen.queryByTestId('install-banner')).toBeNull()
  })

  it('renders install banner with "Install app" text when isInstallable is true', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install: vi.fn() })
    render(<Header />)
    const banner = screen.getByTestId('install-banner')
    expect(banner).toBeTruthy()
    expect(banner.textContent).toContain('Install app')
  })

  it('calls install() when install banner is clicked', () => {
    const install = vi.fn()
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install })
    render(<Header />)
    const banner = screen.getByTestId('install-banner')
    fireEvent.click(banner)
    expect(install).toHaveBeenCalledTimes(1)
  })

  it('hides banner when dismiss button is clicked', () => {
    vi.mocked(usePWAInstall).mockReturnValue({ isInstallable: true, install: vi.fn() })
    render(<Header />)
    expect(screen.getByTestId('install-banner')).toBeTruthy()
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss install banner' })
    fireEvent.click(dismissBtn)
    expect(screen.queryByTestId('install-banner')).toBeNull()
  })
})
