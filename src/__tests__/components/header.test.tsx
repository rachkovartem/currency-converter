import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/header'
import { useConverterStore } from '@/store/converter-store'

vi.mock('@/hooks/use-rates', () => ({
  useRates: () => undefined,
}))

const baseState = {
  rows: ['USD', 'EUR'],
  online: true,
  updatedAt: 0,
  openRecents: vi.fn(),
  openSettings: vi.fn(),
}

beforeEach(() => {
  useConverterStore.setState(baseState)
})

describe('Header — last-updated span', () => {
  it('hides the last-updated span when updatedAt is 0', () => {
    useConverterStore.setState({ ...baseState, updatedAt: 0 })
    render(<Header />)
    expect(screen.queryByTestId('last-updated')).toBeNull()
  })

  it('shows "ECB · <formatted date>" when updatedAt is a valid timestamp', () => {
    // May 3, 2026 00:00:00 UTC in ms
    const ts = new Date('2026-05-03T00:00:00Z').getTime()
    useConverterStore.setState({ ...baseState, updatedAt: ts })
    render(<Header />)
    const span = screen.getByTestId('last-updated')
    expect(span).toBeTruthy()
    expect(span.textContent).toMatch(/^ECB · /)
    expect(span.textContent).toContain('2026')
  })
})
