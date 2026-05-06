import { MOCK_RATES } from '@/lib/rates'
import type { RatesResult } from '@/lib/rates'
import type { RateProvider } from './types'

// ExchangeRate-API v6 response shape
interface ExchangeRateApiResponse {
  result: 'success' | 'error'
  base_code: string
  conversion_rates: Record<string, number>
  time_last_update_utc: string
  time_next_update_utc: string
}

export class ExchangeRateProvider implements RateProvider {
  async fetchRates(): Promise<RatesResult> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY

    if (!apiKey) {
      console.warn('EXCHANGE_RATE_API_KEY not set, using mock rates')
      return { rates: MOCK_RATES, updatedAt: Date.now() }
    }

    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
        {
          next: { revalidate: 10800 }, // 3h Next.js ISR cache — shared across all users
        }
      )

      if (!res.ok) {
        throw new Error(`ExchangeRate-API error: ${res.status}`)
      }

      const data: ExchangeRateApiResponse = await res.json()

      if (data.result !== 'success') {
        throw new Error(`ExchangeRate-API returned error result`)
      }

      const updatedAt = new Date(data.time_last_update_utc).getTime()

      return {
        rates: data.conversion_rates,
        updatedAt,
      }
    } catch (error) {
      console.error('Failed to fetch rates from ExchangeRate-API:', error)
      return { rates: MOCK_RATES, updatedAt: Date.now() }
    }
  }
}
