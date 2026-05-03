import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cookieStorage } from '@/lib/cookie-storage'

// ---------------------------------------------------------------------------
// cookieStorage (client-side adapter)
// ---------------------------------------------------------------------------

describe('cookieStorage — client side', () => {
  // Reset document.cookie between tests using a simple in-memory store
  let cookieJar: string[] = []

  beforeEach(() => {
    cookieJar = []
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => cookieJar.join('; '),
      set: (value: string) => {
        // Extract name from the set-cookie string (everything before first '=')
        const name = value.split('=')[0].trim()
        // Remove existing entry with same name
        cookieJar = cookieJar.filter((c) => !c.startsWith(name + '='))
        // Only store if it's not an expire/delete directive (max-age=0)
        if (!value.includes('max-age=0')) {
          // Store only the name=value pair
          const pair = value.split(';')[0].trim()
          cookieJar.push(pair)
        }
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setItem()', () => {
    it('writes a cookie with name=value', () => {
      cookieStorage.setItem('test-key', 'hello')
      expect(document.cookie).toContain('test-key=hello')
    })

    it('overwrites an existing cookie with same name', () => {
      cookieStorage.setItem('test-key', 'first')
      cookieStorage.setItem('test-key', 'second')
      expect(document.cookie).toContain('test-key=second')
      expect(document.cookie.match(/test-key=/g)).toHaveLength(1)
    })

    it('does nothing when document is undefined (SSR guard)', () => {
      // Simulate SSR: temporarily remove document
      const origDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
      Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
      expect(() => cookieStorage.setItem('x', 'y')).not.toThrow()
      if (origDescriptor) {
        Object.defineProperty(globalThis, 'document', origDescriptor)
      }
    })
  })

  describe('getItem()', () => {
    it('returns the stored value', () => {
      cookieStorage.setItem('cc-state', 'myvalue')
      expect(cookieStorage.getItem('cc-state')).toBe('myvalue')
    })

    it('returns null when cookie does not exist', () => {
      expect(cookieStorage.getItem('nonexistent')).toBeNull()
    })

    it('returns the correct cookie when multiple cookies exist', () => {
      cookieStorage.setItem('a', 'aaa')
      cookieStorage.setItem('b', 'bbb')
      expect(cookieStorage.getItem('a')).toBe('aaa')
      expect(cookieStorage.getItem('b')).toBe('bbb')
    })

    it('decodes URI-encoded values', () => {
      // Simulate a raw cookie already in the jar (pre-encoded by setItem)
      cookieJar.push('encoded-key=' + encodeURIComponent('{"x":1}'))
      expect(cookieStorage.getItem('encoded-key')).toBe('{"x":1}')
    })

    it('returns null when document is undefined (SSR guard)', () => {
      const origDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
      Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
      const result = cookieStorage.getItem('x')
      expect(result).toBeNull()
      if (origDescriptor) {
        Object.defineProperty(globalThis, 'document', origDescriptor)
      }
    })
  })

  describe('removeItem()', () => {
    it('removes the cookie by setting max-age=0', () => {
      cookieStorage.setItem('del-key', 'value')
      expect(cookieStorage.getItem('del-key')).toBe('value')
      cookieStorage.removeItem('del-key')
      expect(cookieStorage.getItem('del-key')).toBeNull()
    })

    it('does not throw when removing a non-existent cookie', () => {
      expect(() => cookieStorage.removeItem('ghost')).not.toThrow()
    })

    it('does nothing when document is undefined (SSR guard)', () => {
      const origDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
      Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
      expect(() => cookieStorage.removeItem('x')).not.toThrow()
      if (origDescriptor) {
        Object.defineProperty(globalThis, 'document', origDescriptor)
      }
    })
  })
})

// ---------------------------------------------------------------------------
// getServerConverterCookieState() — server-side helper
// Use a dedicated file to allow top-level vi.mock at module scope.
// Tests are in cookie-storage-server.test.ts
// ---------------------------------------------------------------------------
