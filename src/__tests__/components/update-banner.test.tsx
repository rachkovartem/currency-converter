import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpdateBanner } from '@/components/update-banner'

describe('UpdateBanner', () => {
  it('renders "New version available" text', () => {
    render(<UpdateBanner onReload={vi.fn()} />)
    expect(screen.getByText('New version available')).toBeTruthy()
  })

  it('"Reload" button has data-testid="reload-btn"', () => {
    render(<UpdateBanner onReload={vi.fn()} />)
    const btn = screen.getByTestId('reload-btn')
    expect(btn).toBeTruthy()
    expect(btn.textContent).toBe('Reload')
  })

  it('clicking Reload calls onReload', () => {
    const onReload = vi.fn()
    render(<UpdateBanner onReload={onReload} />)
    const btn = screen.getByTestId('reload-btn')
    fireEvent.click(btn)
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it('has role="status" for screen reader announcement', () => {
    render(<UpdateBanner onReload={vi.fn()} />)
    const banner = screen.getByRole('status')
    expect(banner).toBeTruthy()
  })
})
