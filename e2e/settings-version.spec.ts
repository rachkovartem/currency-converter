import { test, expect } from '@playwright/test'
import { version } from '../src/lib/version'

const MOCK_RATES_RESPONSE = {
  rates: {
    USD: 1, EUR: 0.9187, GBP: 0.7891, JPY: 144.23,
    CHF: 0.8921, CAD: 1.3654, AUD: 1.5123, CNY: 7.2401,
  },
  updatedAt: 1746316800000,
}

test.beforeEach(async ({ page }) => {
  await page.route('**/sw.js', route => route.abort())
  await page.route('**/api/rates**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RATES_RESPONSE),
    })
  })
})

test.describe('Settings — Version label', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')
    // Open settings
    await page.getByTestId('open-settings').click()
    await page.waitForSelector('[data-testid="settings-sheet"]')
  })

  test('AC-1: version label is visible at the bottom of the Settings sheet', async ({ page }) => {
    const sheet = page.getByTestId('settings-sheet')
    const label = sheet.getByTestId('app-version-label')
    await expect(label).toBeVisible()
  })

  test('AC-2: version label shows the value from package.json', async ({ page }) => {
    const sheet = page.getByTestId('settings-sheet')
    const label = sheet.getByTestId('app-version-label')
    await expect(label).toHaveText(`v${version}`)
  })
})
