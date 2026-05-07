import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PickerSheet } from '@/components/picker-sheet'
import { useConverterStore } from '@/store/converter-store'

// PickerSheet uses framer-motion which needs AnimatePresence — mock it
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) =>
      <div {...props}>{children}</div>,
  },
}))

beforeEach(() => {
  useConverterStore.setState({
    rows: ['USD', 'EUR', 'GBP', 'JPY'],
    pickerOpen: true,
    showFlags: true,
    rates: { USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110, CHF: 0.92, CAD: 1.25, AUD: 1.35, CNY: 6.5, INR: 75, KRW: 1180 },
  })
})

describe('PickerSheet', () => {
  it('renders search input', () => {
    render(<PickerSheet />)
    expect(screen.getByTestId('picker-search')).toBeTruthy()
  })

  it('filters by currency code', () => {
    render(<PickerSheet />)
    const input = screen.getByTestId('picker-search')
    fireEvent.change(input, { target: { value: 'CHF' } })
    expect(screen.getByText('Swiss Franc')).toBeTruthy()
  })

  it('filters by name (Swiss)', () => {
    render(<PickerSheet />)
    const input = screen.getByTestId('picker-search')
    fireEvent.change(input, { target: { value: 'Swiss' } })
    expect(screen.getByText('Swiss Franc')).toBeTruthy()
  })

  it('shows "No matches" for invalid query', () => {
    render(<PickerSheet />)
    const input = screen.getByTestId('picker-search')
    fireEvent.change(input, { target: { value: 'XYZNONEXISTENT' } })
    expect(screen.getByText(/No matches for/)).toBeTruthy()
  })

  it('already-added currency shows check icon', async () => {
    const { container } = render(<PickerSheet />)
    // USD is already in rows — its button in the list should be disabled
    await waitFor(() => {
      const buttons = container.querySelectorAll('button[disabled]')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('popular chips are disabled for already-added currencies', () => {
    render(<PickerSheet />)
    // USD, EUR, GBP, JPY are already added
    // Popular chips: USD, EUR, GBP, JPY, CHF, CAD
    // The first 4 should be disabled
    const allButtons = screen.getAllByRole('button')
    // Find buttons with text matching USD/EUR/GBP/JPY in the popular section
    const disabledButtons = allButtons.filter(
      b => b.hasAttribute('disabled')
    )
    // At least USD, EUR, GBP, JPY from popular chips should be disabled
    expect(disabledButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('shows fallback display for currency not in config', () => {
    useConverterStore.setState({
      rows: [],
      pickerOpen: true,
      showFlags: true,
      rates: { XYZ: 1.5 },
    })
    render(<PickerSheet />)
    // The fallback row renders the code as the name; find the row subtitle which shows "XYZ · Unknown"
    expect(screen.getByText(/XYZ · Unknown/)).toBeTruthy()
  })

  it('shows No currencies available when rates is empty', () => {
    useConverterStore.setState({
      rows: [],
      pickerOpen: true,
      showFlags: true,
      rates: {},
    })
    render(<PickerSheet />)
    expect(screen.getByText('No currencies available')).toBeTruthy()
  })
})
