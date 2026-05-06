import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MOCK_RATES_OER } from '@/lib/rates'

describe('OpenExchangeRatesProvider', () => {
  const MOCK_OER_RESPONSE = {
    timestamp: 1746230400, // unix seconds
    base: 'USD',
    rates: {
      USD: 1,
      EUR: 0.9187,
      GBP: 0.7891,
      JPY: 144.23,
    },
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_OER_RESPONSE,
    }))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('fetches from correct endpoint with app_id', async () => {
    vi.stubEnv('OPEN_EXCHANGE_RATES_APP_ID', 'my-app-id')
    const { OpenExchangeRatesProvider } = await import('@/lib/providers/open-exchange-rates')
    const provider = new OpenExchangeRatesProvider()
    await provider.fetchRates()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://openexchangerates.org/api/latest.json?app_id=my-app-id',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  it('returns MOCK_RATES when app_id is missing', async () => {
    vi.stubEnv('OPEN_EXCHANGE_RATES_APP_ID', '')
    const { OpenExchangeRatesProvider } = await import('@/lib/providers/open-exchange-rates')
    const provider = new OpenExchangeRatesProvider()
    const result = await provider.fetchRates()
    expect(result.rates).toEqual(MOCK_RATES_OER)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('returns MOCK_RATES when fetch fails', async () => {
    vi.stubEnv('OPEN_EXCHANGE_RATES_APP_ID', 'valid-app-id')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const { OpenExchangeRatesProvider } = await import('@/lib/providers/open-exchange-rates')
    const provider = new OpenExchangeRatesProvider()
    const result = await provider.fetchRates()
    expect(result.rates).toEqual(MOCK_RATES_OER)
  })

  it('converts unix timestamp (seconds) to ms correctly', async () => {
    vi.stubEnv('OPEN_EXCHANGE_RATES_APP_ID', 'valid-app-id')
    const { OpenExchangeRatesProvider } = await import('@/lib/providers/open-exchange-rates')
    const provider = new OpenExchangeRatesProvider()
    const result = await provider.fetchRates()
    expect(result.updatedAt).toBe(MOCK_OER_RESPONSE.timestamp * 1000)
  })
})
