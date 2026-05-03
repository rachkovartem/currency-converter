import { describe, it, expect } from 'vitest'
import { convert, formatNumber, makeSeries, MOCK_RATES } from '@/lib/rates'

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

describe('makeSeries()', () => {
  it('returns correct length array', () => {
    expect(makeSeries('USD', 30)).toHaveLength(30)
    expect(makeSeries('EUR', 7)).toHaveLength(7)
  })

  it('is deterministic', () => {
    const a = makeSeries('EUR', 30)
    const b = makeSeries('EUR', 30)
    expect(a).toEqual(b)
  })

  it('values are within reasonable range of base rate', () => {
    const series = makeSeries('EUR', 30)
    const base = MOCK_RATES.EUR
    for (const v of series) {
      expect(v).toBeGreaterThan(base * 0.9)
      expect(v).toBeLessThan(base * 1.1)
    }
  })
})
