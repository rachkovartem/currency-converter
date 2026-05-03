import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
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

  it('input uses width 100% instead of a fixed clamp width', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    const styleAttr = input.getAttribute('style') ?? ''
    // Should NOT contain the old fixed clamp width
    expect(styleAttr).not.toMatch(/width:\s*clamp\(68px/)
    expect(styleAttr).not.toMatch(/width:\s*130px/)
    // Should use 100% to fill the flex container
    expect(input.style.width).toBe('100%')
  })

  it('sparkline container renders when sparkline is true', () => {
    const { container } = render(<CurrencyListRow {...defaultProps} sparkline={true} />)
    // The sparkline wrapper div is now wrapped in a collapsing div with maxWidth transition
    // It should have overflow: hidden and display: flex on the inner div
    const sparklineWrappers = container.querySelectorAll('[style*="overflow: hidden"]')
    expect(sparklineWrappers.length).toBeGreaterThan(0)
  })

  it('value input container has flex: 1 to grow into freed space', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    // The input's parent container should have flex: 1 (jsdom expands to "1 1 0%")
    const valueContainer = input.parentElement as HTMLElement
    // flexGrow is '1' when flex:1 is set
    expect(valueContainer?.style.flexGrow).toBe('1')
  })

  it('value input container has textAlign right', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    expect(input.style.textAlign).toBe('right')
  })

  // Fix 1 — padding reductions
  // jsdom drops clamp() from the entire shorthand padding property (e.g. "10px clamp(...)"),
  // so we cannot assert on padding-top via the DOM. Instead we verify the source-code values
  // are correct by confirming the component file does NOT contain the old padY values (12/18)
  // and DOES contain the new values (10/16). This is enforced via a filesystem read in a
  // separate source-check test below.

  it('compact density renders the card with display flex (sanity check)', () => {
    const { container } = render(<CurrencyListRow {...defaultProps} density="compact" />)
    const mainCard = container.querySelector('[style*="touch-action"]') as HTMLElement | null
    expect(mainCard?.style.display).toBe('flex')
  })

  it('comfortable density renders the card with display flex (sanity check)', () => {
    const { container } = render(
      <CurrencyListRow {...defaultProps} density="comfortable" />
    )
    const mainCard = container.querySelector('[style*="touch-action"]') as HTMLElement | null
    expect(mainCard?.style.display).toBe('flex')
  })

  // Source-level check for padY values — jsdom cannot parse clamp() in padding shorthand.
  it('source uses padY 10 for compact and 16 for comfortable (not old 12/18)', () => {
    const src = readFileSync(
      resolve(__dirname, '../../components/currency-list-row.tsx'),
      'utf-8'
    )
    expect(src).toContain("density === 'compact' ? 10 : 16")
    expect(src).not.toContain("density === 'compact' ? 12 : 18")
  })

  // Fix 2 — dynamic input expansion: level 0 (len ≤ 7), everything visible
  it('level 0: all elements visible when value length is ≤ 7', () => {
    const { container } = render(
      <CurrencyListRow {...defaultProps} value="100" isActive={true} sparkline={true} />
    )
    // Flag avatar wrapper should NOT be collapsed (maxWidth not 0)
    const collapsibleDivs = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    )
    const flagWrapper = collapsibleDivs.find(el => el.style.maxWidth === '0px')
    expect(flagWrapper).toBeUndefined()
  })

  it('level 1: currency name collapses when active value length is 8', () => {
    const { container } = render(
      <CurrencyListRow {...defaultProps} value="12345678" isActive={true} />
    )
    // Name div should have maxWidth: 0
    const nameDiv = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).find(el => el.style.maxWidth === '0px')
    expect(nameDiv).toBeDefined()
  })

  it('level 2: flag avatar collapses when active value length is ≥ 12', () => {
    const { container } = render(
      <CurrencyListRow
        {...defaultProps}
        value="123456789012"
        isActive={true}
        sparkline={true}
      />
    )
    // Multiple elements should be collapsed (maxWidth: 0)
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // At level 2: flag wrapper + sparkline wrapper both collapse
    expect(collapsed.length).toBeGreaterThanOrEqual(2)
  })

  it('currency code is always rendered regardless of value length', () => {
    const { getByText } = render(
      <CurrencyListRow {...defaultProps} value="123456789012345" isActive={true} />
    )
    expect(getByText('USD')).toBeTruthy()
  })

  it('input always uses width 100% regardless of value length', () => {
    // jsdom drops clamp() from font-size, so we can only verify width: 100% is present.
    // The font-size branching logic is validated by source-level review.
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="123456789012345" isActive={true} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    expect(input.style.width).toBe('100%')
  })

  it('non-active row uses formatted value to compute display length', () => {
    // A non-active row with a large computed value should also respond to len
    // value "1234567890" non-active: formatNumber(1234567890, 2) = "1,234,567,890.00" (len 16 ≥ 12)
    const { container } = render(
      <CurrencyListRow
        {...defaultProps}
        value="1234567890"
        isActive={false}
        sparkline={true}
      />
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // Flag and sparkline should be collapsed for a very long formatted value
    expect(collapsed.length).toBeGreaterThanOrEqual(2)
  })
})
