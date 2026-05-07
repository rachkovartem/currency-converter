import { describe, it, expect } from 'vitest'
import { CURRENCIES, CURRENCY_CONFIG, CURRENCY_BY_CODE, getCurrencyDisplay } from '@/lib/currencies'
import type { Currency } from '@/lib/types'

describe('CURRENCY_CONFIG', () => {
  it('has no duplicate keys', () => {
    const keys = Object.keys(CURRENCY_CONFIG)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('every entry has required display fields', () => {
    for (const [code, cfg] of Object.entries(CURRENCY_CONFIG)) {
      expect(cfg.name, `${code} missing name`).toBeTruthy()
      expect(cfg.symbol, `${code} missing symbol`).toBeTruthy()
      expect(cfg.flag, `${code} missing flag`).toBeTruthy()
      expect(cfg.country, `${code} missing country`).toBeTruthy()
      expect((cfg as unknown as Record<string, unknown>)['code'], `${code} should not have code field`).toBeUndefined()
    }
  })

  it('has at least 175 entries', () => {
    expect(Object.keys(CURRENCY_CONFIG).length).toBeGreaterThanOrEqual(175)
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
      expect(CURRENCY_CONFIG[code], `Missing original currency: ${code}`).toBeDefined()
    }
  })

  it('includes all African currencies', () => {
    const africaCodes = ['DZD', 'ETB', 'GHS', 'KES', 'LYD', 'MUR', 'MZN', 'RWF', 'SDG', 'SOS', 'SZL', 'TZS', 'UGX', 'XAF', 'XOF', 'ZMW']
    for (const code of africaCodes) {
      expect(CURRENCY_CONFIG[code], `Missing Africa currency: ${code}`).toBeDefined()
    }
  })

  it('includes all Middle East & Asia currencies', () => {
    const meCodes = ['AFN', 'BHD', 'IQD', 'IRR', 'JOD', 'KHR', 'LAK', 'LBP', 'LKR', 'MMK', 'MNT', 'MVR', 'NPR', 'OMR', 'SYP', 'TMT', 'YER']
    for (const code of meCodes) {
      expect(CURRENCY_CONFIG[code], `Missing ME/Asia currency: ${code}`).toBeDefined()
    }
  })

  it('includes all European currencies', () => {
    const europeCodes = ['ALL', 'BAM', 'MKD']
    for (const code of europeCodes) {
      expect(CURRENCY_CONFIG[code], `Missing Europe currency: ${code}`).toBeDefined()
    }
  })

  it('includes all Americas currencies', () => {
    const americasCodes = ['BBD', 'BMD', 'BOB', 'BSD', 'BZD', 'CRC', 'CUP', 'DOP', 'GTQ', 'GYD', 'HNL', 'HTG', 'JMD', 'NIO', 'PAB', 'PYG', 'SRD', 'TTD', 'UYU', 'VES']
    for (const code of americasCodes) {
      expect(CURRENCY_CONFIG[code], `Missing Americas currency: ${code}`).toBeDefined()
    }
  })

  it('includes all Oceania currencies', () => {
    const oceaniaCodes = ['FJD', 'PGK', 'SBD', 'TOP', 'VUV', 'WST']
    for (const code of oceaniaCodes) {
      expect(CURRENCY_CONFIG[code], `Missing Oceania currency: ${code}`).toBeDefined()
    }
  })

  it('includes all miscellaneous currencies', () => {
    const miscCodes = ['XCD', 'XPF', 'GNF', 'KGS', 'MWK', 'NAD', 'SCR', 'TJS', 'AWG', 'BND', 'BTN', 'CVE', 'DJF', 'ERN', 'GMD', 'IMP', 'KYD', 'LRD', 'LSL', 'MGA', 'MOP', 'MRU', 'STN', 'AOA', 'CDF']
    for (const code of miscCodes) {
      expect(CURRENCY_CONFIG[code], `Missing misc currency: ${code}`).toBeDefined()
    }
  })

  it('includes all 15 OER-only codes', () => {
    const oerCodes = ['BTC', 'CLF', 'CNH', 'CUC', 'KPW', 'SLL', 'STD', 'SVC', 'XAG', 'XAU', 'XCG', 'XDR', 'XPD', 'XPT', 'ZWG']
    for (const code of oerCodes) {
      expect(CURRENCY_CONFIG[code], `Missing OER-only currency: ${code}`).toBeDefined()
    }
  })

  it('MXV is not in config', () => {
    expect(CURRENCY_CONFIG['MXV']).toBeUndefined()
  })
})

describe('getCurrencyDisplay', () => {
  it('returns full Currency for known code', () => {
    const result: Currency = getCurrencyDisplay('USD')
    expect(result).toEqual({ code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', country: 'United States' })
  })

  it('returns fallback Currency for unknown code', () => {
    const result: Currency = getCurrencyDisplay('ZZZZZ')
    expect(result).toEqual({ code: 'ZZZZZ', name: 'ZZZZZ', symbol: 'ZZZZZ', flag: '?', country: 'Unknown' })
  })
})

describe('CURRENCY_BY_CODE', () => {
  it('is a plain enumerable object (not a Proxy)', () => {
    expect(Object.keys(CURRENCY_BY_CODE).length).toBeGreaterThanOrEqual(175)
  })

  it('returns Currency for known code', () => {
    expect(CURRENCY_BY_CODE['USD']).toEqual(getCurrencyDisplay('USD'))
  })

  it('returns undefined for unknown code', () => {
    expect(CURRENCY_BY_CODE['ZZZZZ']).toBeUndefined()
  })

  it('"in" operator works for known codes', () => {
    expect('USD' in CURRENCY_BY_CODE).toBe(true)
  })

  it('"in" operator returns false for unknown codes', () => {
    expect('ZZZZZ' in CURRENCY_BY_CODE).toBe(false)
  })
})

describe('CURRENCIES backward-compat array', () => {
  it('is an array of Currency objects', () => {
    expect(Array.isArray(CURRENCIES)).toBe(true)
  })

  it('length matches CURRENCY_CONFIG', () => {
    expect(CURRENCIES.length).toBe(Object.keys(CURRENCY_CONFIG).length)
  })

  it('every entry has code field', () => {
    const allHaveCode = CURRENCIES.every(c => typeof c.code === 'string' && c.code.length > 0)
    expect(allHaveCode).toBe(true)
  })
})
