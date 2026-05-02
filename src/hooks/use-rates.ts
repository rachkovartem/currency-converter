'use client'
// Rates are fetched server-side in page.tsx with 24h revalidation.
// No client-side polling needed — ECB rates update once per day.
export function useRates() {
  // no-op: rates initialized from SSR props in ConverterApp
}
