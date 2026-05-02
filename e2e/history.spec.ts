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

test.describe('History Chart Screen — AC-6', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // Ensure EUR is in favorites via localStorage
    await page.evaluate(() => {
      const stored = localStorage.getItem('currency-converter')
      const data = stored ? JSON.parse(stored) as { state?: Record<string, unknown>; version?: number } : {}
      data.state = {
        ...(data.state ?? {}),
        rows: ['USD', 'EUR', 'GBP', 'JPY'],
        favorites: ['EUR'],
        activeCode: 'USD',
        activeValue: '100',
      }
      localStorage.setItem('currency-converter', JSON.stringify(data))
    })
    await page.reload()
    await page.waitForSelector('[data-testid="currency-input-USD"]')
    // Scroll to bottom to make favorites visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  })

  test('AC-6: clicking a favorites item opens history overlay', async ({ page }) => {
    // The favorites section label says "FAVORITES" and is followed by a Glass container
    // Find the "Favorites" heading to scope the click
    // The favorites section contains "Euro" name and a rate display
    // We need to find the favorites section specifically - it's after the "FAVORITES" label

    // Look for the favorites glass container that comes after the "FAVORITES" label
    // Strategy: find all elements containing "Euro" and pick the one in the favorites section
    // The favorites section row has "1 USD = X EUR" text which is not in the main row
    const favoritesRow = page.locator('text=1 USD =').locator('..')
    await expect(favoritesRow).toBeVisible({ timeout: 5000 })
    await favoritesRow.click()

    await expect(page.getByTestId('history-screen')).toBeVisible({ timeout: 5000 })
  })

  test('AC-6: history screen shows chart SVG', async ({ page }) => {
    const favoritesRow = page.locator('text=1 USD =').locator('..')
    await expect(favoritesRow).toBeVisible({ timeout: 5000 })
    await favoritesRow.click()

    await page.getByTestId('history-screen').waitFor({ state: 'visible' })

    // Find SVG within the history screen
    const historySvg = page.getByTestId('history-screen').locator('svg').first()
    await expect(historySvg).toBeVisible()
  })

  test('AC-6: clicking "1W" range updates content', async ({ page }) => {
    const favoritesRow = page.locator('text=1 USD =').locator('..')
    await expect(favoritesRow).toBeVisible({ timeout: 5000 })
    await favoritesRow.click()

    await page.getByTestId('history-screen').waitFor({ state: 'visible' })

    const historyScreen = page.getByTestId('history-screen')

    // Click "1W" range button
    await historyScreen.getByText('1W').click()

    // After clicking, the chart SVG should still be visible
    const chartSvg = historyScreen.locator('svg').first()
    await expect(chartSvg).toBeVisible()
  })
})
