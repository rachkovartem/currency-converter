/**
 * Tests for getServerConverterCookieState().
 *
 * vi.mock() is hoisted to the top of the module — the mock factory runs
 * before any test code. We use vi.mocked() + mockResolvedValue() inside
 * beforeEach to configure per-test behaviour.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getServerConverterCookieState } from '@/lib/cookie-storage'

vi.mock('next/headers')

describe('getServerConverterCookieState()', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
  })

  it('returns null when no cookie is present', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never)

    const result = await getServerConverterCookieState()
    expect(result).toBeNull()
  })

  it('returns null when cookie value is present but not valid JSON', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'not-valid-json' }),
    } as never)

    const result = await getServerConverterCookieState()
    expect(result).toBeNull()
  })

  it('returns null when cookie JSON has no state field', async () => {
    const { cookies } = await import('next/headers')
    const payload = encodeURIComponent(JSON.stringify({ version: 0 }))
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: payload }),
    } as never)

    const result = await getServerConverterCookieState()
    expect(result).toBeNull()
  })

  it('returns the state object when cookie is valid', async () => {
    const { cookies } = await import('next/headers')
    const state = { rows: ['USD', 'EUR'], activeCode: 'USD', activeValue: '50' }
    const payload = encodeURIComponent(JSON.stringify({ state }))
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: payload }),
    } as never)

    const result = await getServerConverterCookieState()
    expect(result).toEqual(state)
  })

  it('returns null when next/headers throws', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockRejectedValue(new Error('headers not available'))

    const result = await getServerConverterCookieState()
    expect(result).toBeNull()
  })
})
