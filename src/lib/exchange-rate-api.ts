import { MOCK_RATES } from './rates'
import { getProvider } from './providers'

// Re-export RatesResult for backward compatibility — defined in rates.ts
export type { RatesResult } from './rates'

export async function fetchRates() {
  // Never hit the real API in development — preserve free-tier limits
  if (process.env.NODE_ENV === 'development') {
    return { rates: MOCK_RATES, updatedAt: Date.now() }
  }
  return getProvider().fetchRates()
}
