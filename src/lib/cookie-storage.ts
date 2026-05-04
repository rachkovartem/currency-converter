import type { StateStorage } from 'zustand/middleware'

/**
 * cookieStorage — client-side Zustand StateStorage adapter.
 * All three methods guard against SSR (typeof document === 'undefined').
 */
export const cookieStorage: StateStorage = {
  getItem(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
    if (!match) return null
    const raw = match.slice(name.length + 1)
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  },

  setItem(name: string, value: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`
  },

  removeItem(name: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`
  },
}

// ---------------------------------------------------------------------------
// PersistedConverterState — mirrors the fields Zustand serialises into the
// cookie so server-rendered `window.__CC_STATE__` is fully typed.
// ---------------------------------------------------------------------------
export type PersistedConverterState = {
  rows: string[]
  activeCode: string
  activeValue: string
  recents: {
    from: string
    to: string
    amount: number
    ts: number
  }[]
  layout: 'list' | 'grid'
  density: 'compact' | 'comfortable'
  showFlags: boolean
  focusMode: boolean
}

/**
 * getServerConverterCookieState — server-side helper for page.tsx.
 * Reads the 'currency-converter' cookie from the incoming request via
 * next/headers and returns the parsed Zustand `state` object, or null on
 * any failure.
 */
export async function getServerConverterCookieState(): Promise<Partial<PersistedConverterState> | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const raw = cookieStore.get('currency-converter')?.value
    if (!raw) return null
    const parsed: unknown = JSON.parse(decodeURIComponent(raw))
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'state' in parsed &&
      parsed.state !== null &&
      typeof parsed.state === 'object'
    ) {
      return parsed.state as Partial<PersistedConverterState>
    }
    return null
  } catch {
    return null
  }
}
