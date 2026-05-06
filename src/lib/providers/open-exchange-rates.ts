import type { RatesResult } from '@/lib/rates'
import type { RateProvider } from './types'

// Open Exchange Rates response shape
interface OerResponse {
  timestamp: number // unix seconds
  base: string
  rates: Record<string, number>
}

export class OpenExchangeRatesProvider implements RateProvider {
  async fetchRates(): Promise<RatesResult> {
    const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID

    if (!appId) {
      throw new Error('OPEN_EXCHANGE_RATES_APP_ID is not configured')
    }

    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
      {
        next: { revalidate: 3600 }, // 1h — matches OER update frequency
      }
    )

    if (!res.ok) {
      throw new Error(`Open Exchange Rates error: ${res.status}`)
    }

    const data: OerResponse = await res.json()

    const updatedAt = data.timestamp * 1000 // convert unix seconds to ms

    return {
      rates: data.rates,
      updatedAt,
    }
  }
}
