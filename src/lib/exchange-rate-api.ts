import { MOCK_RATES } from './rates'

// ExchangeRate-API v6 response shape
interface ExchangeRateApiResponse {
  result: 'success' | 'error'
  base_code: string
  conversion_rates: Record<string, number>
  time_last_update_utc: string
  time_next_update_utc: string
}

export interface RatesResult {
  rates: Record<string, number>
  date: string // ISO date string "YYYY-MM-DD"
}

export async function fetchRates(): Promise<RatesResult> {
  // Never hit the real API in development — preserve free-tier limits
  if (process.env.NODE_ENV === 'development') {
    return { rates: MOCK_RATES, date: new Date().toISOString().split('T')[0] }
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY

  if (!apiKey) {
    console.warn('EXCHANGE_RATE_API_KEY not set, using mock rates')
    return { rates: MOCK_RATES, date: new Date().toISOString().split('T')[0] }
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      {
        next: { revalidate: 86400 }, // 24h Next.js ISR cache — shared across all users
      }
    )

    if (!res.ok) {
      throw new Error(`ExchangeRate-API error: ${res.status}`)
    }

    const data: ExchangeRateApiResponse = await res.json()

    if (data.result !== 'success') {
      throw new Error(`ExchangeRate-API returned error result`)
    }

    // date from "Sat, 03 May 2026 00:02:31 +0000" → "2026-05-03"
    const date = new Date(data.time_last_update_utc).toISOString().split('T')[0]

    return {
      rates: data.conversion_rates,
      date,
    }
  } catch (error) {
    console.error('Failed to fetch rates from ExchangeRate-API:', error)
    return { rates: MOCK_RATES, date: new Date().toISOString().split('T')[0] }
  }
}
