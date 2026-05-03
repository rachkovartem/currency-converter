import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlagAvatar } from '@/components/ui/flag-avatar'
import { CURRENCY_BY_CODE } from '@/lib/currencies'

describe('FlagAvatar', () => {
  const usd = CURRENCY_BY_CODE['USD']

  it('shows emoji flag when showFlag=true', () => {
    const { getByText } = render(<FlagAvatar currency={usd} showFlag={true} size={36} />)
    expect(getByText(usd.flag)).toBeTruthy()
  })

  it('renders nothing when showFlag=false', () => {
    const { container } = render(<FlagAvatar currency={usd} showFlag={false} size={36} />)
    expect(container.firstChild).toBeNull()
  })
})
