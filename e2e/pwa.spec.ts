import { test, expect } from '@playwright/test'

const MOCK_RATES_RESPONSE = {
  rates: {
    USD: 1, EUR: 0.9187, GBP: 0.7891, JPY: 144.23,
    CHF: 0.8921, CAD: 1.3654, AUD: 1.5123, CNY: 7.2401,
  },
  updatedAt: 1746316800000,
}

test.beforeEach(async ({ page }) => {
  await page.route('**/sw.js', route => route.abort())

  // ⚠️ Mock the rates API — never hit real ExchangeRate-API in tests
  await page.route('**/api/rates**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RATES_RESPONSE),
    })
  })
  // Also mock the external API directly in case it's called from the page
  await page.route('**/exchangerate-api.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        result: 'success',
        base_code: 'USD',
        time_last_update_utc: 'Sat, 03 May 2026 00:02:31 +0000',
        conversion_rates: MOCK_RATES_RESPONSE.rates,
      }),
    })
  })
})

test.describe('SW Update Banner', () => {
  test('AC-SW-3/4: update banner appears and reload works when SW update is detected', async ({ page }) => {
    // Inject a fake serviceWorker BEFORE the page loads so the hook captures it
    await page.addInitScript(() => {
      const listeners: Record<string, EventListener[]> = {}
      const fakeSW = {
        controller: { postMessage: () => {} } as unknown as ServiceWorker, // truthy — simulates "had controller"
        addEventListener(event: string, handler: EventListener) {
          if (!listeners[event]) listeners[event] = []
          listeners[event].push(handler)
        },
        removeEventListener(event: string, handler: EventListener) {
          if (listeners[event]) {
            listeners[event] = listeners[event].filter(h => h !== handler)
          }
        },
        register: () => Promise.resolve(undefined as unknown as ServiceWorkerRegistration),
        _listeners: listeners,
      }
      ;(window as unknown as Record<string, unknown>)['__testSW'] = fakeSW
      Object.defineProperty(navigator, 'serviceWorker', {
        get: () => fakeSW,
        configurable: true,
      })
    })

    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // Wait until the hook has registered its controllerchange listener
    await expect(async () => {
      const hasListeners = await page.evaluate(() => {
        const sw = (window as unknown as Record<string, unknown>)['__testSW'] as {
          _listeners?: Record<string, unknown[]>
        }
        return (sw?._listeners?.['controllerchange']?.length ?? 0) > 0
      })
      expect(hasListeners).toBe(true)
    }).toPass({ timeout: 3000 })

    // Fire controllerchange to simulate a SW update being detected
    await page.evaluate(() => {
      const sw = (window as unknown as Record<string, unknown>)['__testSW'] as {
        _listeners: Record<string, EventListener[]>
      }
      const handlers = (sw._listeners ?? {})['controllerchange'] ?? []
      handlers.forEach((h: EventListener) => h(new Event('controllerchange')))
    })

    // AC-SW-3: banner must appear with correct text
    const banner = page.getByTestId('update-banner')
    await expect(banner).toBeVisible({ timeout: 3000 })
    await expect(banner).toContainText('New version available')

    // AC-SW-4: clicking Reload triggers window.location.reload
    // Spy on reload before clicking — prevents actual page reload during tests
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__reloadCalled = false
      Object.defineProperty(window.location, 'reload', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: () => { (window as any).__reloadCalled = true },
        configurable: true,
        writable: true,
      })
    })
    await page.getByTestId('reload-btn').click()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reloadCalled = await page.evaluate(() => !!(window as any).__reloadCalled)
    expect(reloadCalled).toBe(true)
  })
})

test.describe('PWA & SEO', () => {
  test('AC-12: manifest.json has display: standalone', async ({ page }) => {
    const response = await page.request.get('/manifest.json')
    expect(response.status()).toBe(200)

    const manifest = await response.json() as Record<string, unknown>
    expect(manifest.display).toBe('standalone')
    expect(manifest.name).toContain('Convert')
    expect(Array.isArray(manifest.icons)).toBe(true)

    // Additional manifest field checks
    expect(manifest.scope).toBeDefined()
    expect(manifest.lang).toBe('en')

    const icons = manifest.icons as Array<Record<string, unknown>>
    expect(icons.some(icon => 'purpose' in icon)).toBe(true)

    expect(manifest.prefer_related_applications).toBe(false)
  })

  test('AC-13: page has JSON-LD script with @type: WebApplication', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const jsonLdContent = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      return scripts.map(s => s.textContent ?? '').join('\n')
    })

    expect(jsonLdContent).toContain('WebApplication')
    expect(jsonLdContent).toContain('Convert')
  })

  test('AC-13: page title contains "Convert"', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('Convert')
  })

  test('offline page is accessible', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('networkidle')
    // Should render without crashing
    expect(await page.title()).toBeTruthy()
  })

  test('AC-7: install button hidden when beforeinstallprompt not fired', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const installBtn = page.getByTestId('install-banner')
    await expect(installBtn).not.toBeAttached()
  })
})
