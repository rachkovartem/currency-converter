export type CurrencyCode = string

export interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  flag: string
  country: string
}

export interface RecentConversion {
  from: CurrencyCode
  to: CurrencyCode
  amount: number
  ts: number // Unix ms timestamp
}
