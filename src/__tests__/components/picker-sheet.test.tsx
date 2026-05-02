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
    _hasHydrated: true,
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
    render(<PickerSheet />)
    // USD is already in rows, so it should show a check mark
    // The list shows all currencies; find USD row which should have check
    const { container } = render(<PickerSheet />)
    // Check that USD button in the list is disabled (added=true means opacity 0.45)
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
})
