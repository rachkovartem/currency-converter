import { MOCK_RATES_OER, OER_FIXTURE_TIMESTAMP } from './rates'
import { getProvider } from './providers'

// Re-export RatesResult for backward compatibility — defined in rates.ts
export type { RatesResult } from './rates'

export async function fetchRates() {
  // Never hit the real API in development — preserve free-tier limits
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[fetchRates] build-time mock returned (NEXT_PHASE=phase-production-build)')
    }
    return { rates: MOCK_RATES_OER, updatedAt: OER_FIXTURE_TIMESTAMP }
  }
  return getProvider().fetchRates()
}
