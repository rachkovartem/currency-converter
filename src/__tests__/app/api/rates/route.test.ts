import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const MOCK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.9187,
  GBP: 0.7891,
  JPY: 144.23,
}
const MOCK_UPDATED_AT = 1778072400000

vi.mock('@/lib/exchange-rate-api', () => ({
  fetchRates: vi.fn(),
}))

// Import after mock is registered
import { GET } from '@/app/api/rates/route'
import { fetchRates } from '@/lib/exchange-rate-api'

describe('GET /api/rates', () => {
  beforeEach(() => {
    vi.mocked(fetchRates).mockResolvedValue({
      rates: MOCK_RATES,
      updatedAt: MOCK_UPDATED_AT,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns HTTP 200', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  it('returns JSON with rates and updatedAt', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body).toEqual({ rates: MOCK_RATES, updatedAt: MOCK_UPDATED_AT })
  })

  it('rates match what fetchRates() returns', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.rates['EUR']).toBe(0.9187)
    expect(body.rates['USD']).toBe(1)
    expect(body.rates['JPY']).toBe(144.23)
  })

  it('updatedAt matches what fetchRates() returns', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.updatedAt).toBe(MOCK_UPDATED_AT)
  })

  it('calls fetchRates() exactly once per request', async () => {
    await GET()
    expect(vi.mocked(fetchRates)).toHaveBeenCalledTimes(1)
  })
})
