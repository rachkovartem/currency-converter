// Rates per 1 USD (mock; close to real-ish values, not used for advice)
export const MOCK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.4, CHF: 0.89,
  CAD: 1.37, AUD: 1.51, CNY: 7.24, INR: 83.5, KRW: 1372,
  MXN: 16.8, BRL: 5.16, SEK: 10.6, NOK: 10.8, DKK: 6.86,
  NZD: 1.66, SGD: 1.34, HKD: 7.81, THB: 36.5, TRY: 32.4,
  ZAR: 18.6, AED: 3.67, PLN: 4.0, PHP: 57.2,
  CZK: 23.1, HUF: 360.0, IDR: 15800, ILS: 3.74, MYR: 4.72,
  RON: 4.58, ISK: 138.0, CLP: 920.0, COP: 3950.0, ARS: 870.0,
  PEN: 3.77, EGP: 30.9, NGN: 1310.0, KWD: 0.307, SAR: 3.75,
  QAR: 3.64, UAH: 37.2, VND: 24500, TWD: 31.9, PKR: 278.0,
  BDT: 110.0, BGN: 1.80, HRK: 7.12, RSD: 107.0, GEL: 2.68,
  AMD: 388.0, KZT: 446.0, UZS: 12600, AZN: 1.70, BYN: 3.27,
  MDL: 17.8, MAD: 10.1, TND: 3.12,
}

// Generate a deterministic 30-point sparkline series for each pair (vs USD)
export function makeSeries(code: string, points = 30): number[] {
  let seed = 0
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0
  const base = MOCK_RATES[code] ?? 1
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const noise = ((seed % 1000) / 1000 - 0.5) * 0.04 // ±2%
    const drift = Math.sin(i / 4 + code.charCodeAt(0)) * 0.015
    out.push(base * (1 + noise + drift))
  }
  return out
}

export const SERIES: Record<string, number[]> = Object.fromEntries(
  Object.keys(MOCK_RATES).map(c => [c, makeSeries(c)])
)

// Convert via USD pivot: amount * (rate[to] / rate[from])
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = MOCK_RATES
): number {
  if (!isFinite(amount)) return 0
  const f = rates[from], t = rates[to]
  if (!f || !t) return 0
  return amount * (t / f)
}

// Format with locale separators + sensible decimals
export function formatNumber(n: number, decimals = 2): string {
  if (!isFinite(n)) return ''
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
