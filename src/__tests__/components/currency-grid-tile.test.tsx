import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { CurrencyGridTile } from '@/components/currency-grid-tile'
import { CURRENCY_BY_CODE } from '@/lib/currencies'

const usd = CURRENCY_BY_CODE['USD']

const defaultProps = {
  currency: usd,
  value: '100',
  isActive: false,
  onFocus: vi.fn(),
  onChange: vi.fn(),
  onSwap: vi.fn(),
  showFlag: true,
  decimals: 2,
  density: 'comfortable' as const,
}

describe('CurrencyGridTile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the currency code', () => {
    const { getByText } = render(<CurrencyGridTile {...defaultProps} />)
    expect(getByText('USD')).toBeTruthy()
  })

  it('inactive input shows formatted value', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={false} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    expect(input.value).toBe('3.06')
  })

  it('active input shows formatted value on focus (before typing)', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    // Before any typing, active input must show formatted value
    expect(input.value).toBe('3.06')
  })

  it('active input shows raw value only after typing begins', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })
    expect(defaultProps.onChange).toHaveBeenCalledWith('5')
  })

  it('active input resets to formatted value after blur', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.blur(input)
    // After blur, value is no longer in typing mode — shows formatted
    expect(input.value).toBe('3.06')
  })

  it('isTyping resets when isActive becomes false', () => {
    const { getByTestId, rerender } = render(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })

    // Deactivate: isActive=false → isTyping resets via useEffect
    rerender(
      <CurrencyGridTile {...defaultProps} value="3.0636" isActive={false} decimals={2} />
    )
    expect(input.value).toBe('3.06')
  })

  it('onChange strips non-numeric characters', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} value="1" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1a2b' } })
    expect(defaultProps.onChange).toHaveBeenCalledWith('12')
  })

  it('compact density renders with minHeight 90', () => {
    const { container } = render(
      <CurrencyGridTile {...defaultProps} density="compact" />
    )
    const tile = container.firstChild as HTMLElement
    expect(tile?.style.minHeight).toBe('90px')
  })

  it('comfortable density renders with minHeight 130', () => {
    const { container } = render(
      <CurrencyGridTile {...defaultProps} density="comfortable" />
    )
    const tile = container.firstChild as HTMLElement
    expect(tile?.style.minHeight).toBe('130px')
  })
})

describe('AC-1 iOS Safari anti-zoom: grid tile input font-size is ≥ 16px (DOM check)', () => {
  it('compact density: input font-size is ≥ 16px', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} density="compact" />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    const fs = parseInt(input.style.fontSize, 10)
    expect(fs).toBeGreaterThanOrEqual(16)
  })

  it('comfortable density: input font-size is ≥ 16px', () => {
    const { getByTestId } = render(
      <CurrencyGridTile {...defaultProps} density="comfortable" />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    const fs = parseInt(input.style.fontSize, 10)
    expect(fs).toBeGreaterThanOrEqual(16)
  })
})
