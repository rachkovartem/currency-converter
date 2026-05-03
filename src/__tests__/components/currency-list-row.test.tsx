import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { render } from '@testing-library/react'
import { CurrencyListRow } from '@/components/currency-list-row'
import { CURRENCY_BY_CODE } from '@/lib/currencies'

// Default container width used across most tests
let _defaultOffsetWidth = 380

// Mock ResizeObserver as a proper constructor function — calls callback immediately on observe()
class MockResizeObserver {
  private _cb: ResizeObserverCallback
  observe = vi.fn().mockImplementation((el: Element) => {
    Object.defineProperty(el, 'offsetWidth', { value: _defaultOffsetWidth, configurable: true })
    this._cb([], this as unknown as ResizeObserver)
  })
  disconnect = vi.fn()
  constructor(cb: ResizeObserverCallback) {
    this._cb = cb
  }
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

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

/** Helper to render with a specific container offsetWidth */
function renderWithWidth(
  props: typeof defaultProps & { sparkline?: boolean; isActive?: boolean; value?: string },
  offsetWidth: number
) {
  _defaultOffsetWidth = offsetWidth
  const result = render(<CurrencyListRow {...props} />)
  _defaultOffsetWidth = 380
  return result
}

// DOM-based collapse logic thresholds (jsdom environment):
//
// In jsdom, child element offsetWidths are all 0 unless explicitly set.
// natW defaults: { flag: 36, name: 80, sparkline: 52 }
// dragW = 0 (jsdom; ?? 30 only catches null/undefined, not 0)
// gap = 8 (getComputedStyle().gap → NaN → fallback 8)
// valueSizerRef.offsetWidth = 0 → valueNeedsW = 6 (trivially satisfied)
//
// freeWithSparkline    = rowW - 0 - 52 - 24 - 8 = rowW - 84
// freeWithoutSparkline = rowW - 0 -  0 - 16 - 8 = rowW - 24
// btn0 = (rowW - 84) / 2,  btn1 = (rowW - 24) / 2
// MIN_NAME_PX = 20
// btnNeedsAll    = 36 + 45 + 20 + 8 = 109
// btnNeedsNoName = 36 + 45 + 8      =  89
//
// Level 0:  btn0 >= 109  →  rowW >= 302
// Level 1:  btn1 >= 109  →  242 <= rowW < 302
// Level 2:  btn1 >= 89   →  202 <= rowW < 242
// Level 3:  btn1 <  89   →  rowW < 202

describe('CurrencyListRow', () => {
  beforeEach(() => {
    _defaultOffsetWidth = 380
  })

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

  it('value input container uses flex: 1 to fill remaining space', () => {
    const { getByTestId } = render(<CurrencyListRow {...defaultProps} />)
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    const valueContainer = input.parentElement as HTMLElement
    // Container must grow to fill remaining row space (flex: 1)
    expect(valueContainer?.style.flexGrow).toBe('1')
    // Must NOT have a fixed clamp width
    const styleAttr = valueContainer?.getAttribute('style') ?? ''
    expect(styleAttr).not.toMatch(/width:\s*clamp\(68px/)
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

  // Dynamic collapse tests using DOM-based ResizeObserver logic
  //
  // See threshold derivation at the top of this file.
  //
  // Level 0 (all visible):    rowW >= 302  → use 320
  // Level 1 (sparkline only): 242 <= rowW < 302  → use 270
  // Level 2 (sparkline+name): 202 <= rowW < 242  → use 220
  // Level 3 (all collapsed):  rowW < 202   → use 150

  // collapseLevel = 0: all elements visible when container >= 302
  it('level 0: all elements visible at 320px container width', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true, sparkline: true },
      320
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    expect(collapsed.length).toBe(0)
  })

  // collapseLevel = 1: sparkline collapses at 270px (242 <= 270 < 302)
  it('level 1: sparkline collapses when container is 270px', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true, sparkline: true },
      270
    )
    const allMaxWidth = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    )
    // Sparkline wrapper should be collapsed (maxWidth: 0)
    const collapsed = allMaxWidth.filter(el => el.style.maxWidth === '0px')
    expect(collapsed.length).toBe(1)
    // Name div should still be visible (maxWidth != 0)
    const nameDiv = allMaxWidth.find(
      el => el.style.maxWidth !== '0px' && el.textContent === 'US Dollar'
    )
    expect(nameDiv).toBeDefined()
  })

  // collapseLevel = 2: sparkline + name collapse at 220px (202 <= 220 < 242)
  it('level 2: sparkline and currency name collapse at 220px container width', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true, sparkline: true },
      220
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // Sparkline + name should both be collapsed
    expect(collapsed.length).toBe(2)
  })

  // collapseLevel = 3: sparkline + name + flag collapse at 150px (< 202)
  it('level 3: flag, name, and sparkline all collapse at 150px container width', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true, sparkline: true },
      150
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // Flag + name + sparkline all collapsed → 3 elements
    expect(collapsed.length).toBe(3)
  })

  it('currency code is always rendered regardless of value length', () => {
    const { getByText } = render(
      <CurrencyListRow {...defaultProps} value="12345678901234567" isActive={true} />
    )
    expect(getByText('USD')).toBeTruthy()
  })

  it('input always uses width 100% regardless of value length', () => {
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="12345678901234567" isActive={true} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    expect(input.style.width).toBe('100%')
  })

  // At rowW=220: level 2 (sparkline+name collapsed, flag visible)
  // This applies to both short and long value strings since valueNeedsW=6 in jsdom
  it('non-active row: name and sparkline collapse when container is 220px', () => {
    const { container } = renderWithWidth(
      {
        ...defaultProps,
        value: '1234567890',
        isActive: false,
        sparkline: true,
      },
      220
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // At collapseLevel=2: name + sparkline collapsed
    expect(collapsed.length).toBeGreaterThanOrEqual(2)
  })
})
