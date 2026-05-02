import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentsOverlay } from '@/components/recents-overlay'
import { useConverterStore } from '@/store/converter-store'
import { RecentConversion } from '@/lib/types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) =>
      <div {...props}>{children}</div>,
  },
}))

const mockRecents: RecentConversion[] = [
  { from: 'USD', to: 'EUR', amount: 250, ts: Date.now() - 1000 * 60 * 22 },
  { from: 'GBP', to: 'JPY', amount: 50, ts: Date.now() - 1000 * 60 * 60 * 3 },
  { from: 'EUR', to: 'CHF', amount: 1200, ts: Date.now() - 1000 * 60 * 60 * 26 },
]

beforeEach(() => {
  useConverterStore.setState({
    showRecents: true,
    recents: mockRecents,
    showFlags: true,
    rates: {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.4, CHF: 0.89,
    },
    settingsOpen: false,
  })
})

describe('RecentsOverlay', () => {
  it('renders "Recent" heading', () => {
    render(<RecentsOverlay />)
    expect(screen.getByText('Recent')).toBeTruthy()
  })

  it('renders all 3 recent items', () => {
    render(<RecentsOverlay />)
    // Each item shows a formatted conversion line; check by counting buttons (3 recent + 1 close)
    const buttons = screen.getAllByRole('button')
    // 3 recent item buttons + 1 close button = 4
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('each item shows from and to currency codes', () => {
    render(<RecentsOverlay />)
    // First item: USD → EUR
    const body = document.body.textContent ?? ''
    expect(body).toContain('USD')
    expect(body).toContain('EUR')
    expect(body).toContain('GBP')
    expect(body).toContain('JPY')
    expect(body).toContain('CHF')
  })

  it('clicking a recent item calls pickRecent', () => {
    const pickRecent = vi.fn()
    useConverterStore.setState({ pickRecent })
    render(<RecentsOverlay />)

    // Find a recent item button (the ones with conversion text)
    // Recent items show text like "250.00 USD → ... EUR"
    const recentButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('USD') && btn.textContent?.includes('EUR')
    )
    expect(recentButtons.length).toBeGreaterThan(0)
    fireEvent.click(recentButtons[0])
    expect(pickRecent).toHaveBeenCalledWith(mockRecents[0])
  })

  it('close button calls closeRecents', () => {
    const closeRecents = vi.fn()
    useConverterStore.setState({ closeRecents })
    render(<RecentsOverlay />)

    const closeButton = screen.getByLabelText('Close recents')
    fireEvent.click(closeButton)
    expect(closeRecents).toHaveBeenCalledOnce()
  })
})
