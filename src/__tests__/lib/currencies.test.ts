import { describe, it, expect } from 'vitest'
import { CURRENCIES, CURRENCY_BY_CODE } from '@/lib/currencies'

describe('CURRENCIES', () => {
  it('has no duplicate codes', () => {
    const codes = CURRENCIES.map(c => c.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('every entry has required fields', () => {
    for (const c of CURRENCIES) {
      expect(c.code, `${c.code} missing code`).toBeTruthy()
      expect(c.name, `${c.code} missing name`).toBeTruthy()
      expect(c.symbol, `${c.code} missing symbol`).toBeTruthy()
      expect(c.flag, `${c.code} missing flag`).toBeTruthy()
      expect(c.country, `${c.code} missing country`).toBeTruthy()
    }
  })

  it('CURRENCY_BY_CODE matches CURRENCIES array', () => {
    for (const c of CURRENCIES) {
      expect(CURRENCY_BY_CODE[c.code]).toEqual(c)
    }
  })

  it('includes all original 57 currencies', () => {
    const original57 = [
      'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR', 'KRW',
      'MXN', 'BRL', 'SEK', 'NOK', 'DKK', 'NZD', 'SGD', 'HKD', 'THB', 'TRY',
      'ZAR', 'AED', 'PLN', 'PHP', 'CZK', 'HUF', 'IDR', 'ILS', 'MYR', 'RON',
      'ISK', 'CLP', 'COP', 'ARS', 'PEN', 'EGP', 'NGN', 'KWD', 'SAR', 'QAR',
      'UAH', 'VND', 'TWD', 'PKR', 'BDT', 'BGN', 'HRK', 'RSD', 'GEL', 'AMD',
      'KZT', 'UZS', 'AZN', 'BYN', 'MDL', 'MAD', 'TND',
    ]
    for (const code of original57) {
      expect(CURRENCY_BY_CODE[code], `Missing original currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added African currencies', () => {
    const africaCodes = ['DZD', 'ETB', 'GHS', 'KES', 'LYD', 'MUR', 'MZN', 'RWF', 'SDG', 'SOS', 'SZL', 'TZS', 'UGX', 'XAF', 'XOF', 'ZMW']
    for (const code of africaCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing Africa currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added Middle East & Asia currencies', () => {
    const meCodes = ['AFN', 'BHD', 'IQD', 'IRR', 'JOD', 'KHR', 'LAK', 'LBP', 'LKR', 'MMK', 'MNT', 'MVR', 'NPR', 'OMR', 'SYP', 'TMT', 'YER']
    for (const code of meCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing ME/Asia currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added European currencies', () => {
    const europeCodes = ['ALL', 'BAM', 'MKD']
    for (const code of europeCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing Europe currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added Americas currencies', () => {
    const americasCodes = ['BBD', 'BMD', 'BOB', 'BSD', 'BZD', 'CRC', 'CUP', 'DOP', 'GTQ', 'GYD', 'HNL', 'HTG', 'JMD', 'NIO', 'PAB', 'PYG', 'SRD', 'TTD', 'UYU', 'VES']
    for (const code of americasCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing Americas currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added Oceania currencies', () => {
    const oceaniaCodes = ['FJD', 'PGK', 'SBD', 'TOP', 'VUV', 'WST']
    for (const code of oceaniaCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing Oceania currency: ${code}`).toBeDefined()
    }
  })

  it('includes newly added miscellaneous currencies', () => {
    const miscCodes = ['XCD', 'XPF', 'GNF', 'KGS', 'MWK', 'NAD', 'SCR', 'TJS', 'AWG', 'BND', 'BTN', 'CVE', 'DJF', 'ERN', 'GMD', 'IMP', 'KYD', 'LRD', 'LSL', 'MGA', 'MOP', 'MRU', 'STN', 'AOA', 'CDF']
    for (const code of miscCodes) {
      expect(CURRENCY_BY_CODE[code], `Missing misc currency: ${code}`).toBeDefined()
    }
  })

  it('does not include KPW (not in ExchangeRate-API)', () => {
    expect(CURRENCY_BY_CODE['KPW']).toBeUndefined()
  })

  it('does not include MXV or XDR', () => {
    expect(CURRENCY_BY_CODE['MXV']).toBeUndefined()
    expect(CURRENCY_BY_CODE['XDR']).toBeUndefined()
  })

  it('has more than 57 currencies total', () => {
    expect(CURRENCIES.length).toBeGreaterThan(57)
  })
})
