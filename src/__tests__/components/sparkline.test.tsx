import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Sparkline } from '@/components/ui/sparkline'

describe('Sparkline', () => {
  it('renders SVG with correct dimensions', () => {
    const data = [1, 2, 3, 4, 5]
    const { container } = render(<Sparkline data={data} width={60} height={22} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('width')).toBe('60')
    expect(svg?.getAttribute('height')).toBe('22')
  })

  it('renders path elements for area and line', () => {
    const data = [1, 2, 3, 4, 5]
    const { container } = render(<Sparkline data={data} width={60} height={22} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty SVG for less than 2 data points', () => {
    const { container: c1 } = render(<Sparkline data={[]} width={60} height={22} />)
    expect(c1.querySelector('path')).toBeNull()

    const { container: c2 } = render(<Sparkline data={[1]} width={60} height={22} />)
    expect(c2.querySelector('path')).toBeNull()
  })
})
