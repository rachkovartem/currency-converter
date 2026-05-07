import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { render, fireEvent } from '@testing-library/react'

const SRC_PATH = resolve(__dirname, '../../components/currency-list-row.tsx')
const src = readFileSync(SRC_PATH, 'utf-8')
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
  decimals: 2,
  density: 'compact' as const,
}

/** Helper to render with a specific container offsetWidth */
function renderWithWidth(
  props: typeof defaultProps & { isActive?: boolean; value?: string },
  offsetWidth: number
) {
  _defaultOffsetWidth = offsetWidth
  const result = render(<CurrencyListRow {...props} />)
  _defaultOffsetWidth = 380
  return result
}

// DOM-based collapse logic thresholds (jsdom environment, no sparkline):
//
// In jsdom, child element offsetWidths are all 0 unless explicitly set.
// natW defaults: { flag: 36, name: 80 }
// dragW = 0 (jsdom; ?? 30 only catches null/undefined, not 0)
// gap = 8 (getComputedStyle().gap → NaN → fallback 8)
// valueSizerRef.offsetWidth = 0 → valueNeedsW = 6 (trivially satisfied)
//
// free = rowW - 0 - 8*2 - 8 = rowW - 24
// val1 = free/2 - 8 = rowW/2 - 20
// btn1 = free/2   = rowW/2 - 12
//
// MIN_NAME_PX = 20
// btnNeedsAll    = 36 + 45 + 20 + 8 = 109
// btnNeedsNoName = 36 + 45 + 8      =  89
//
// Level 0 (all visible):  btn1 >= 109  →  rowW >= 242
// Level 1 (name hidden):  btn1 >= 89   →  202 <= rowW < 242
// Level 2 (all collapsed): rowW < 202

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

  it('source does not import sparkline component', () => {
    const src = readFileSync(
      resolve(__dirname, '../../components/currency-list-row.tsx'),
      'utf-8'
    )
    expect(src).not.toContain('sparkline')
    expect(src).not.toContain('Sparkline')
    expect(src).not.toContain('SERIES')
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
  it('source uses padY 5 for compact and 10 for comfortable', () => {
    const src = readFileSync(
      resolve(__dirname, '../../components/currency-list-row.tsx'),
      'utf-8'
    )
    expect(src).toContain("density === 'compact' ? 5 : 10")
    expect(src).not.toContain("density === 'compact' ? 12 : 18")
    expect(src).not.toContain("density === 'compact' ? 10 : 16")
  })

  // Dynamic collapse tests using DOM-based ResizeObserver logic
  //
  // See threshold derivation at the top of this file.
  //
  // Level 0 (all visible):   rowW >= 242  → use 260
  // Level 1 (name hidden):   202 <= rowW < 242  → use 220
  // Level 2 (all collapsed): rowW < 202   → use 150

  // collapseLevel = 0: all elements visible when container >= 242
  it('level 0: all elements visible at 260px container width', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true },
      260
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    expect(collapsed.length).toBe(0)
  })

  // collapseLevel = 1: name collapses at 220px (202 <= 220 < 242)
  it('level 1: currency name collapses when container is 220px', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true },
      220
    )
    const allMaxWidth = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    )
    // Name div should be collapsed (maxWidth: 0)
    const collapsed = allMaxWidth.filter(el => el.style.maxWidth === '0px')
    expect(collapsed.length).toBe(1)
    // Flag div should still be visible (maxWidth != 0)
    const flagDiv = allMaxWidth.find(
      el => el.style.maxWidth !== '0px'
    )
    expect(flagDiv).toBeDefined()
  })

  // collapseLevel = 2: name + flag collapse at 150px (< 202)
  it('level 2: flag and currency name both collapse at 150px container width', () => {
    const { container } = renderWithWidth(
      { ...defaultProps, value: '100', isActive: true },
      150
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // Flag + name should both be collapsed
    expect(collapsed.length).toBe(2)
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

  // At rowW=150: level 2 (name + flag collapsed)
  it('non-active row: name and flag collapse when container is 150px', () => {
    const { container } = renderWithWidth(
      {
        ...defaultProps,
        value: '1234567890',
        isActive: false,
      },
      150
    )
    const collapsed = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="max-width"]')
    ).filter(el => el.style.maxWidth === '0px')
    // At collapseLevel=2: name + flag collapsed
    expect(collapsed.length).toBeGreaterThanOrEqual(2)
  })

  // isTyping behaviour tests
  it('active input shows formatted value on focus (before typing)', () => {
    // value "3.0636" with decimals=2 → should display "3.06", not "3.0636"
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    // Before typing, active input must show formatted value
    expect(input.value).toBe('3.06')
  })

  it('active input shows raw value only after typing begins', () => {
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })
    // After typing, raw value should pass through to onChange (isTyping=true)
    expect(defaultProps.onChange).toHaveBeenCalledWith('5')
  })

  it('active input resets to formatted value after blur', () => {
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.blur(input)
    // After blur, back to formatted
    expect(input.value).toBe('3.06')
  })

  it('inactive input always shows formatted value', () => {
    const { getByTestId } = render(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={false} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    expect(input.value).toBe('3.06')
  })

  it('isTyping resets when isActive becomes false', () => {
    const { getByTestId, rerender } = render(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={true} decimals={2} />
    )
    const input = getByTestId('currency-input-USD') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })

    // Now deactivate: isActive=false → isTyping resets
    rerender(
      <CurrencyListRow {...defaultProps} value="3.0636" isActive={false} decimals={2} />
    )
    expect(input.value).toBe('3.06')
  })

  // AC-1 iOS Safari anti-zoom: all font-size floors must be ≥ 16px
  // jsdom cannot compute clamp() values, so we verify the source text directly.
  describe('AC-1 iOS Safari anti-zoom: input font-size floors ≥ 16px', () => {
    it('inputFs for compact density has floor ≥ 16px', () => {
      // Must be clamp(16px, ...) not clamp(14px, ...)
      expect(src).not.toContain("clamp(14px, 4vw, 18px)")
      expect(src).toMatch(/clamp\(16px,\s*4vw,\s*18px\)/)
    })

    it('valueFontSize for len > 16 has floor ≥ 16px', () => {
      // Must be clamp(16px, ...) not clamp(13px, ...)
      expect(src).not.toContain("clamp(13px, 3.8vw, 17px)")
      expect(src).toMatch(/clamp\(16px,\s*3\.8vw,\s*17px\)/)
    })

    it('valueFontSize for len > 13 has floor ≥ 16px', () => {
      // Must be clamp(16px, ...) not clamp(15px, ...)
      expect(src).not.toContain("clamp(15px, 4.5vw, 20px)")
      expect(src).toMatch(/clamp\(16px,\s*4\.5vw,\s*20px\)/)
    })
  })
})
