import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MOCK_RATES } from '@/lib/rates'

describe('ExchangeRateProvider', () => {
  const MOCK_API_RESPONSE = {
    result: 'success',
    base_code: 'USD',
    time_last_update_utc: 'Sat, 03 May 2026 00:02:31 +0000',
    time_next_update_utc: 'Sun, 04 May 2026 00:02:31 +0000',
    conversion_rates: {
      USD: 1,
      EUR: 0.9187,
      GBP: 0.7891,
      JPY: 144.23,
    },
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_API_RESPONSE,
    }))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('fetches from correct endpoint with API key', async () => {
    vi.stubEnv('EXCHANGE_RATE_API_KEY', 'my-api-key')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = new ExchangeRateProvider()
    await provider.fetchRates()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://v6.exchangerate-api.com/v6/my-api-key/latest/USD',
      expect.objectContaining({ next: { revalidate: 10800 } })
    )
  })

  it('returns MOCK_RATES when key is missing', async () => {
    vi.stubEnv('EXCHANGE_RATE_API_KEY', '')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = new ExchangeRateProvider()
    const result = await provider.fetchRates()
    expect(result.rates).toEqual(MOCK_RATES)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('returns MOCK_RATES when fetch fails', async () => {
    vi.stubEnv('EXCHANGE_RATE_API_KEY', 'valid-key')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = new ExchangeRateProvider()
    const result = await provider.fetchRates()
    expect(result.rates).toEqual(MOCK_RATES)
  })

  it('parses timestamp from time_last_update_utc', async () => {
    vi.stubEnv('EXCHANGE_RATE_API_KEY', 'valid-key')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = new ExchangeRateProvider()
    const result = await provider.fetchRates()
    expect(result.updatedAt).toBe(new Date('Sat, 03 May 2026 00:02:31 +0000').getTime())
  })
})
