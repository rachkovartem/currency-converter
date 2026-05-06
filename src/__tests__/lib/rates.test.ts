import { describe, it, expect } from 'vitest'
import { convert, formatNumber, MOCK_RATES, MOCK_RATES_OER, OER_FIXTURE_TIMESTAMP } from '@/lib/rates'

describe('convert()', () => {
  it('USD to EUR converts correctly', () => {
    const result = convert(100, 'USD', 'EUR')
    expect(result).toBeCloseTo(92, 0)
  })

  it('cross-pair GBP to JPY via USD pivot', () => {
    const result = convert(1, 'GBP', 'JPY')
    const expected = MOCK_RATES.JPY / MOCK_RATES.GBP
    expect(result).toBeCloseTo(expected, 4)
  })

  it('returns 0 for NaN input', () => {
    expect(convert(NaN, 'USD', 'EUR')).toBe(0)
  })

  it('returns 0 for unknown currency', () => {
    expect(convert(100, 'USD', 'XYZ')).toBe(0)
    expect(convert(100, 'XYZ', 'USD')).toBe(0)
  })

  it('identity: same from/to returns same amount', () => {
    expect(convert(42, 'EUR', 'EUR')).toBe(42)
  })

  it('uses custom rates when provided', () => {
    const customRates = { USD: 1, EUR: 0.5 }
    expect(convert(100, 'USD', 'EUR', customRates)).toBeCloseTo(50, 4)
  })
})

describe('MOCK_RATES_OER', () => {
  it('has 172 currencies', () => {
    expect(Object.keys(MOCK_RATES_OER).length).toBe(172)
  })

  it('has USD: 1 as base', () => {
    expect(MOCK_RATES_OER['USD']).toBe(1)
  })

  it('contains known currencies EUR, GBP, JPY', () => {
    expect(typeof MOCK_RATES_OER['EUR']).toBe('number')
    expect(typeof MOCK_RATES_OER['GBP']).toBe('number')
    expect(typeof MOCK_RATES_OER['JPY']).toBe('number')
    expect(MOCK_RATES_OER['EUR']).toBeGreaterThan(0)
    expect(MOCK_RATES_OER['GBP']).toBeGreaterThan(0)
    expect(MOCK_RATES_OER['JPY']).toBeGreaterThan(0)
  })
})

describe('OER_FIXTURE_TIMESTAMP', () => {
  it('equals 1778072400 * 1000', () => {
    expect(OER_FIXTURE_TIMESTAMP).toBe(1778072400 * 1000)
  })
})

describe('MOCK_RATES (legacy)', () => {
  it('still exports and has at least USD', () => {
    expect(MOCK_RATES).toBeDefined()
    expect(typeof MOCK_RATES['USD']).toBe('number')
    expect(MOCK_RATES['USD']).toBe(1)
  })

  it('has expected shape with multiple currencies', () => {
    expect(Object.keys(MOCK_RATES).length).toBeGreaterThan(0)
    expect(typeof MOCK_RATES['EUR']).toBe('number')
    expect(typeof MOCK_RATES['GBP']).toBe('number')
  })
})

describe('formatNumber()', () => {
  it('formats with locale separators', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89')
  })

  it('returns empty string for NaN', () => {
    expect(formatNumber(NaN)).toBe('')
  })

  it('respects decimals parameter', () => {
    expect(formatNumber(1.23456, 4)).toBe('1.2346')
    expect(formatNumber(1.23, 0)).toBe('1')
  })

  it('strips trailing fractional zeros (100.00 renders as 100)', () => {
    expect(formatNumber(100, 2)).toBe('100')
    expect(formatNumber(1000, 2)).toBe('1,000')
    expect(formatNumber(0, 2)).toBe('0')
  })

  it('keeps real decimals when present (100.50 renders as 100.5)', () => {
    expect(formatNumber(100.5, 2)).toBe('100.5')
    expect(formatNumber(1.23, 2)).toBe('1.23')
  })
})

