import { test, expect } from '@playwright/test'

const MOCK_RATES_RESPONSE = {
  rates: {
    USD: 1, EUR: 0.9187, GBP: 0.7891, JPY: 144.23,
    CHF: 0.8921, CAD: 1.3654, AUD: 1.5123, CNY: 7.2401,
  },
  date: '2026-05-03',
}

test.beforeEach(async ({ page }) => {
  // ⚠️ Block service worker registration — the SW uses NetworkFirst with a
  // 5-second timeout; on slow CI machines the dev server may not respond in
  // time, causing the SW to return a stale cached page instead of the fresh
  // SSR response.  Blocking /sw.js prevents the SW from ever installing.
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

test.describe('Converter — Main Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for hydration
    await page.waitForSelector('[data-testid="currency-input-USD"]')
  })

  test('AC-1: compact density is default (rows have compact padding)', async ({ page }) => {
    const usdInput = page.getByTestId('currency-input-USD')
    await expect(usdInput).toBeVisible()
    // Compact: font-size 24px
    const fontSize = await usdInput.evaluate(el => {
      return window.getComputedStyle(el).fontSize
    })
    expect(fontSize).toBe('24px')
  })

  test('AC-2: grid layout setting is persisted via cookie', async ({ page }) => {
    // Use Playwright's native addCookies API to set the cookie atomically at the
    // browser-context level, bypassing document.cookie. This avoids a race condition
    // where a concurrent useEffect (Zustand persist setItem) could overwrite the
    // document.cookie write before the page reload sends the request to the server.
    const cookiePayload = encodeURIComponent(JSON.stringify({ state: { layout: 'grid' }, version: 0 }))
    await page.context().addCookies([{
      name: 'currency-converter',
      value: cookiePayload,
      url: 'http://localhost:3000',
    }])
    await page.reload()
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // In grid layout the currencies container uses CSS grid display
    const container = page.locator('[data-testid="currency-rows-container"]')
    await expect(container).toBeVisible()
    const style = await container.evaluate(el => window.getComputedStyle(el).display)
    expect(style).toBe('grid')
  })

  test('AC-3: emoji flags visible by default', async ({ page }) => {
    // Flags are shown by default; look for flag emoji in FlagAvatar elements
    // The USD flag is 🇺🇸 — check it appears on screen
    const body = await page.textContent('body')
    expect(body).toContain('🇺🇸')
  })

  test('AC-8: typing in one field updates all other fields', async ({ page }) => {
    const usdInput = page.getByTestId('currency-input-USD')
    await usdInput.click()
    await usdInput.fill('')
    await usdInput.type('200')

    // EUR should now show a non-zero value
    const eurInput = page.getByTestId('currency-input-EUR')
    await expect(eurInput).toBeVisible()
    const eurValue = await eurInput.inputValue()
    // 200 USD * 0.92 = 184 EUR, formatted as 184.00
    expect(eurValue).not.toBe('0.00')
    expect(eurValue).not.toBe('')
    expect(parseFloat(eurValue.replace(/,/g, ''))).toBeGreaterThan(100)
  })

  test('AC-11: dark glassmorphism background is present', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
    // The main element has the dark background gradient
    const bg = await main.evaluate(el => window.getComputedStyle(el).backgroundImage)
    expect(bg).toContain('gradient')
  })

  test('AC-14: "Live" text is present and ECB rate date is shown', async ({ page }) => {
    const liveStatus = page.getByTestId('live-status')
    await expect(liveStatus).toContainText('Live')

    const updatedEl = page.getByTestId('last-updated')
    await expect(updatedEl).toBeVisible()

    // Rates now come from ECB via Frankfurter API — the date label shows "ECB · <date>"
    const text = await updatedEl.textContent()
    expect(text).toMatch(/ECB/)
  })
})
