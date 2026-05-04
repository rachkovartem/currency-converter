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

  it('container div has role="img"', () => {
    const { container } = render(<FlagAvatar currency={usd} showFlag={true} size={36} />)
    const div = container.firstChild as HTMLElement
    expect(div.getAttribute('role')).toBe('img')
  })

  it('container div has aria-label containing currency name and code', () => {
    const { container } = render(<FlagAvatar currency={usd} showFlag={true} size={36} />)
    const div = container.firstChild as HTMLElement
    const label = div.getAttribute('aria-label')
    expect(label).toContain(usd.name)
    expect(label).toContain(usd.code)
  })

  it('inner emoji span has aria-hidden="true"', () => {
    const { container } = render(<FlagAvatar currency={usd} showFlag={true} size={36} />)
    const span = container.querySelector('span')
    expect(span?.getAttribute('aria-hidden')).toBe('true')
  })
})
