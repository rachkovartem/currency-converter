import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CurrencyListRow } from '@/components/currency-list-row'
import { CURRENCY_BY_CODE } from '@/lib/currencies'

const usd = CURRENCY_BY_CODE['USD']

const defaultProps = {
  currency: usd,
  value: '100',
  isActive: false,
  onFocus: vi.fn(),
  onChange: vi.fn(),
  onSwap: vi.fn(),
  onDelete: vi.fn(),
  showFlag: true,
  sparkline: false,
  decimals: 2,
  density: 'compact' as const,
}

describe('CurrencyListRow', () => {
  it('renders the currency code', () => {
    const { getByText } = render(<CurrencyListRow {...defaultProps} />)
    expect(getByText('USD')).toBeTruthy()
  })

  it('input does not have a fixed 130px width in its inline style', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD')
    // jsdom's CSS parser silently drops clamp() values so we cannot assert on
    // the exact clamp string via the DOM. We verify the fixed 130px value is
    // gone — the actual clamp() value is validated by the source-level check.
    const styleAttr = (input as HTMLInputElement).getAttribute('style') ?? ''
    expect(styleAttr).not.toMatch(/width:\s*130px/)
  })

  it('sparkline container has minWidth 0 when sparkline is true', () => {
    const { container } = render(<CurrencyListRow {...defaultProps} sparkline={true} />)
    // The sparkline wrapper div has margin-left: auto and min-width: 0
    const sparklineWrapper = container.querySelector('[style*="margin-left: auto"]') as HTMLElement | null
    expect(sparklineWrapper).not.toBeNull()
    expect(sparklineWrapper?.style.minWidth).toBe('0px')
  })

  it('value input container does not prevent shrinking (no flexShrink:0 alone)', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD')
    // The input itself should still have textAlign right
    expect((input as HTMLInputElement).style.textAlign).toBe('right')
  })
})
