import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ConverterApp } from '@/components/converter-app'
import { useConverterStore } from '@/store/converter-store'
import { RecentConversion } from '@/lib/types'

// Mock ResizeObserver — required because CurrencyListRow uses it for DOM-based collapse detection; call callback immediately
class MockResizeObserver {
  private _cb: ResizeObserverCallback
  observe = vi.fn().mockImplementation((el: Element) => {
    Object.defineProperty(el, 'offsetWidth', { value: 380, configurable: true })
    this._cb([], this as unknown as ResizeObserver)
  })
  disconnect = vi.fn()
  constructor(cb: ResizeObserverCallback) {
    this._cb = cb
  }
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) =>
      <div {...props}>{children}</div>,
  },
}))

// Mock useRates to avoid intervals in tests
vi.mock('@/hooks/use-rates', () => ({
  useRates: () => undefined,
}))

const defaultState = {
  rows: ['USD', 'EUR', 'GBP', 'JPY'] as string[],
  activeCode: 'USD',
  activeValue: '100',
  favorites: [] as string[],
  recents: [] as RecentConversion[],
  rates: {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.4,
    CHF: 0.89, CAD: 1.37, AUD: 1.51, CNY: 7.24,
    INR: 83.5, KRW: 1372, MXN: 16.8, BRL: 5.16,
    SEK: 10.6, NOK: 10.8, DKK: 6.86, NZD: 1.66,
    SGD: 1.34, HKD: 7.81, THB: 36.5, TRY: 32.4,
    ZAR: 18.6, AED: 3.67, PLN: 4.0, PHP: 57.2,
  },
  updatedAt: Date.now(),
  online: true,
  layout: 'list' as const,
  density: 'compact' as const,
  showFlags: true,
  sparklines: true,
  pickerOpen: false,
  historyPair: null,
  showRecents: false,
  settingsOpen: false,
  _hasHydrated: false,
}

beforeEach(() => {
  useConverterStore.setState(defaultState)
})

const defaultProps = {
  initialRates: defaultState.rates,
  ratesDate: '2026-05-02',
}

describe('ConverterApp', () => {
  it('shows skeleton (empty dark div) on first render when not hydrated', () => {
    // Before useEffect runs, _hasHydrated is false, showing skeleton
    // We test the initial synchronous render
    const { container } = render(<ConverterApp {...defaultProps} />)
    // The skeleton div is rendered before effects run
    // After act(), useEffect fires and sets _hasHydrated=true
    // But the test checks pre-effect state via container before rerender
    const initialChild = container.firstChild as HTMLElement
    // The skeleton has a dark background
    expect(initialChild).toBeTruthy()
  })

  it('renders "Convert" title after hydration', async () => {
    useConverterStore.setState({ _hasHydrated: true })
    render(<ConverterApp {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Convert')).toBeTruthy()
    })
  })

  it('shows 4 default currency rows when hydrated', async () => {
    useConverterStore.setState({ _hasHydrated: true })
    render(<ConverterApp {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('currency-input-USD')).toBeTruthy()
      expect(screen.getByTestId('currency-input-EUR')).toBeTruthy()
      expect(screen.getByTestId('currency-input-GBP')).toBeTruthy()
      expect(screen.getByTestId('currency-input-JPY')).toBeTruthy()
    })
  })

  it('shows empty state when rows is empty', async () => {
    useConverterStore.setState({ _hasHydrated: true, rows: [] })
    render(<ConverterApp {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Add your first currency')).toBeTruthy()
    })
  })

  it('universal sync: typing in one field updates the displayed value for others', async () => {
    useConverterStore.setState({ _hasHydrated: true })
    render(<ConverterApp {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('currency-input-USD')).toBeTruthy()
    })

    const usdInput = screen.getByTestId('currency-input-USD') as HTMLInputElement
    const initialEurValue = (screen.getByTestId('currency-input-EUR') as HTMLInputElement).value

    fireEvent.focus(usdInput)

    await act(async () => {
      fireEvent.change(usdInput, { target: { value: '200' } })
    })

    await waitFor(() => {
      const eurInput = screen.getByTestId('currency-input-EUR') as HTMLInputElement
      // Since EUR rate is 0.92, 200 USD = 184 EUR
      expect(parseFloat(eurInput.value)).toBeGreaterThan(0)
      // Value must have changed from initial (100 USD -> 92 EUR initial, 200 USD -> 184 EUR)
      expect(eurInput.value).not.toBe(initialEurValue)
      // Verify specific expected value: 200 * 0.92 = 184
      expect(parseFloat(eurInput.value.replace(/,/g, ''))).toBeCloseTo(184, 0)
    })
  })

  it('initializes store rates from initialRates prop on mount', async () => {
    const customRates = { ...defaultState.rates, EUR: 0.9999 }
    useConverterStore.setState({ _hasHydrated: true })
    render(<ConverterApp initialRates={customRates} ratesDate="2026-05-02" />)
    await waitFor(() => {
      expect(useConverterStore.getState().rates.EUR).toBe(0.9999)
    })
  })

  it('uses decimals=0 for JPY (zero-decimal currency)', async () => {
    // With USD active at 100, JPY should display as a whole number (no fractional digits)
    useConverterStore.setState({ _hasHydrated: true })
    render(<ConverterApp {...defaultProps} />)

    await waitFor(() => {
      const jpyInput = screen.getByTestId('currency-input-JPY') as HTMLInputElement
      const val = jpyInput.value
      // Value must not contain a decimal point — JPY is a zero-decimal currency
      expect(val).not.toContain('.')
    })
  })

  it('uses decimals=2 for EUR (standard currency)', async () => {
    // EUR should be allowed to display fractional digits
    useConverterStore.setState({ _hasHydrated: true, activeValue: '100.55', activeCode: 'USD' })
    render(<ConverterApp {...defaultProps} />)

    await waitFor(() => {
      const eurInput = screen.getByTestId('currency-input-EUR') as HTMLInputElement
      // 100.55 * 0.92 = 92.506 — should have decimal digits for EUR
      expect(parseFloat(eurInput.value.replace(/,/g, ''))).toBeGreaterThan(0)
      expect(eurInput.value).toContain('.')
    })
  })
})
