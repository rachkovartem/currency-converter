import type { RatesResult } from '@/lib/rates'

export interface RateProvider {
  fetchRates(): Promise<RatesResult>
}
