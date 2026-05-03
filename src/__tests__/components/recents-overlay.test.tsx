import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentsOverlay } from '@/components/recents-overlay'
import { useConverterStore } from '@/store/converter-store'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) =>
      <div {...props}>{children}</div>,
  },
}))

beforeEach(() => {
  useConverterStore.setState({
    showRecents: true,
    recentCurrencies: ['EUR', 'GBP', 'JPY'],
    showFlags: true,
    settingsOpen: false,
  })
})

describe('RecentsOverlay', () => {
  it('renders "Recent" heading', () => {
    render(<RecentsOverlay />)
    expect(screen.getByText('Recent')).toBeTruthy()
  })

  it('renders recent currency items', () => {
    render(<RecentsOverlay />)
    expect(screen.getByTestId('recent-currency-EUR')).toBeTruthy()
    expect(screen.getByTestId('recent-currency-GBP')).toBeTruthy()
    expect(screen.getByTestId('recent-currency-JPY')).toBeTruthy()
  })

  it('shows empty state when no recent currencies', () => {
    useConverterStore.setState({ recentCurrencies: [] })
    render(<RecentsOverlay />)
    expect(screen.getByText('No recent currencies')).toBeTruthy()
  })

  it('clicking a recent currency calls addCurrency and closeRecents', () => {
    const addCurrency = vi.fn()
    const closeRecents = vi.fn()
    useConverterStore.setState({ addCurrency, closeRecents })
    render(<RecentsOverlay />)
    fireEvent.click(screen.getByTestId('recent-currency-EUR'))
    expect(addCurrency).toHaveBeenCalledWith('EUR')
    expect(closeRecents).toHaveBeenCalledOnce()
  })

  it('close button calls closeRecents', () => {
    const closeRecents = vi.fn()
    useConverterStore.setState({ closeRecents })
    render(<RecentsOverlay />)
    fireEvent.click(screen.getByLabelText('Close recents'))
    expect(closeRecents).toHaveBeenCalledOnce()
  })
})
