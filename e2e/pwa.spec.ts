import { test, expect } from '@playwright/test'

const MOCK_RATES_RESPONSE = {
  rates: {
    USD: 1, EUR: 0.9187, GBP: 0.7891, JPY: 144.23,
    CHF: 0.8921, CAD: 1.3654, AUD: 1.5123, CNY: 7.2401,
  },
  date: '2026-05-03',
}

test.beforeEach(async ({ page }) => {
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
})
