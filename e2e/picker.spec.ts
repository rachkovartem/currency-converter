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

test.describe('Picker Sheet — AC-5', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')
  })

  test('AC-5: clicking "Add Currency" opens bottom sheet', async ({ page }) => {
    await page.getByTestId('add-currency-btn').click()
    await expect(page.getByTestId('picker-sheet')).toBeVisible()
  })

  test('AC-5: search for "Swiss" shows CHF', async ({ page }) => {
    await page.getByTestId('add-currency-btn').click()
    await page.getByTestId('picker-sheet').waitFor({ state: 'visible' })

    const search = page.getByTestId('picker-search')
    await search.waitFor({ state: 'visible' })
    await search.fill('Swiss')

    const pickerSheet = page.getByTestId('picker-sheet')
    await expect(pickerSheet.getByText('Swiss Franc')).toBeVisible()
  })

  test('AC-5: search for "franc" shows CHF', async ({ page }) => {
    await page.getByTestId('add-currency-btn').click()
    await page.getByTestId('picker-sheet').waitFor({ state: 'visible' })

    const search = page.getByTestId('picker-search')
    await search.waitFor({ state: 'visible' })
    await search.fill('franc')

    const pickerSheet = page.getByTestId('picker-sheet')
    await expect(pickerSheet.getByText('Swiss Franc')).toBeVisible()
  })

  test('AC-5: clicking CHF adds it to the main list', async ({ page }) => {
    // First ensure CHF is not in the list
    await expect(page.getByTestId('currency-input-CHF')).not.toBeVisible()

    await page.getByTestId('add-currency-btn').click()
    await page.getByTestId('picker-sheet').waitFor({ state: 'visible' })

    const search = page.getByTestId('picker-search')
    await search.waitFor({ state: 'visible' })
    await search.fill('CHF')

    const pickerSheet = page.getByTestId('picker-sheet')
    // Click the CHF row button
    await pickerSheet.locator('button:has-text("Swiss Franc")').click()

    // Picker should close and CHF should now be in the list
    await expect(page.getByTestId('currency-input-CHF')).toBeVisible({ timeout: 3000 })
  })
})
