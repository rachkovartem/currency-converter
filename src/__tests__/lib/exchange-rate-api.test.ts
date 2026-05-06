import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchRates } from '@/lib/exchange-rate-api'
import { MOCK_RATES_OER, OER_FIXTURE_TIMESTAMP } from '@/lib/rates'

// ⚠️ CRITICAL: ALL fetch calls are mocked — no real network requests
describe('fetchRates', () => {
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
    // Mock process.env
    vi.stubEnv('EXCHANGE_RATE_API_KEY', 'test-key-123')
    // Mock fetch globally — no real network calls ever
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_API_RESPONSE,
    }))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns rates from API when key is set', async () => {
    const result = await fetchRates()
    expect(result.rates['EUR']).toBe(0.9187)
    expect(result.rates['USD']).toBe(1)
  })

  it('calls the correct ExchangeRate-API endpoint', async () => {
    await fetchRates()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://v6.exchangerate-api.com/v6/test-key-123/latest/USD',
      expect.objectContaining({ next: { revalidate: 10800 } })
    )
  })

  it('parses the timestamp from time_last_update_utc', async () => {
    const result = await fetchRates()
    expect(typeof result.updatedAt).toBe('number')
    expect(result.updatedAt).toBe(new Date('Sat, 03 May 2026 00:02:31 +0000').getTime())
  })

  it('throws when API key is not set', async () => {
    vi.stubEnv('EXCHANGE_RATE_API_KEY', '')
    await expect(fetchRates()).rejects.toThrow()
  })

  it('throws when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    await expect(fetchRates()).rejects.toThrow()
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchRates()).rejects.toThrow()
  })

  it('throws when API returns error result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'error', 'error-type': 'invalid-key' }),
    }))
    await expect(fetchRates()).rejects.toThrow()
  })

  it('returns mock rates when NODE_ENV is development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const result = await fetchRates()
    expect(result.rates).toBe(MOCK_RATES_OER)
    expect(result.updatedAt).toBe(OER_FIXTURE_TIMESTAMP)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns mock rates when NEXT_PHASE is phase-production-build', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    const result = await fetchRates()
    expect(result.rates).toBe(MOCK_RATES_OER)
    expect(result.updatedAt).toBe(OER_FIXTURE_TIMESTAMP)
    expect(fetch).not.toHaveBeenCalled()
  })
})
