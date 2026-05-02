import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAgo } from '@/lib/time'

describe('timeAgo()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "0s ago" for Date.now()', () => {
    expect(timeAgo(Date.now())).toBe('0s ago')
  })

  it('returns "30s ago" for 30 seconds ago', () => {
    expect(timeAgo(Date.now() - 30000)).toBe('30s ago')
  })

  it('returns "5m ago" for 5 minutes ago', () => {
    expect(timeAgo(Date.now() - 5 * 60 * 1000)).toBe('5m ago')
  })

  it('returns "3h ago" for 3 hours ago', () => {
    expect(timeAgo(Date.now() - 3 * 60 * 60 * 1000)).toBe('3h ago')
  })

  it('returns "2d ago" for 2 days ago', () => {
    expect(timeAgo(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe('2d ago')
  })

  it('accepts a Date object', () => {
    const d = new Date(Date.now() - 30000)
    expect(timeAgo(d)).toBe('30s ago')
  })
})
