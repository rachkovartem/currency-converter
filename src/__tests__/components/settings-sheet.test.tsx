import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsSheet } from '@/components/settings-sheet'
import { useConverterStore } from '@/store/converter-store'
import { version } from '@/lib/version'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) =>
      <div {...props}>{children}</div>,
  },
}))

beforeEach(() => {
  useConverterStore.setState({
    settingsOpen: true,
    layout: 'list',
    density: 'comfortable',
    showFlags: true,
    focusMode: false,
  })
})

describe('SettingsSheet — Version label', () => {
  it('renders the version label when the sheet is open', () => {
    render(<SettingsSheet />)
    expect(screen.getByTestId('app-version-label')).toBeTruthy()
  })

  it('displays the version from package.json prefixed with "v"', () => {
    render(<SettingsSheet />)
    const label = screen.getByTestId('app-version-label')
    expect(label.textContent).toBe(`v${version}`)
  })
})

describe('SettingsSheet — Focus Mode toggle', () => {
  it('renders the Focus Mode toggle', () => {
    render(<SettingsSheet />)
    expect(screen.getByTestId('toggle-focus-mode')).toBeTruthy()
    expect(screen.getByText('Focus Mode')).toBeTruthy()
  })

  it('toggle-focus-mode has aria-pressed=false when focusMode is false', () => {
    useConverterStore.setState({ focusMode: false })
    render(<SettingsSheet />)
    const btn = screen.getByTestId('toggle-focus-mode')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('toggle-focus-mode has aria-pressed=true when focusMode is true', () => {
    useConverterStore.setState({ focusMode: true })
    render(<SettingsSheet />)
    const btn = screen.getByTestId('toggle-focus-mode')
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('clicking toggle-focus-mode calls setFocusMode', () => {
    const setFocusMode = vi.fn()
    useConverterStore.setState({ focusMode: false, setFocusMode })
    render(<SettingsSheet />)
    fireEvent.click(screen.getByTestId('toggle-focus-mode'))
    expect(setFocusMode).toHaveBeenCalledWith(true)
  })
})
