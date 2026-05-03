const KEY = 'cc-recent-currencies'

export function getRecentCurrencies(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveRecentCurrencies(list: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
}
