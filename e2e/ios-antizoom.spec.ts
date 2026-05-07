import { test, expect } from '@playwright/test'

const MOCK_RATES_RESPONSE = {
  rates: {
    USD: 1, EUR: 0.9187, GBP: 0.7891, JPY: 144.23,
    CHF: 0.8921, CAD: 1.3654, AUD: 1.5123, CNY: 7.2401,
  },
  updatedAt: 1746316800000,
}

// iPhone SE viewport — the narrowest common iOS Safari width.
// At 375px, clamp(16px, 4vw, 18px) resolves to max(16, 15) = 16px
// (4vw = 15px < 16px floor) — exactly the boundary case we need to verify.
const IPHONE_SE = { width: 375, height: 667 }

test.use({ viewport: IPHONE_SE })

test.beforeEach(async ({ page }) => {
  await page.route('**/sw.js', route => route.abort())
  await page.route('**/api/rates**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RATES_RESPONSE),
    })
  })
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

test.describe('AC-1 iOS Safari anti-zoom: inputs must not trigger auto-zoom on focus', () => {
  test('AC-1: all visible currency inputs have computed font-size ≥ 16px at 375px viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // Collect all visible <input> elements and check their computed font-size
    const tooSmallInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'))
      const visible = inputs.filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      return visible
        .map(el => ({
          testId: el.getAttribute('data-testid') ?? '(no testid)',
          fontSize: parseFloat(window.getComputedStyle(el).fontSize),
        }))
        .filter(entry => entry.fontSize < 16)
    })

    expect(
      tooSmallInputs,
      `Found inputs with font-size < 16px (iOS would auto-zoom): ${JSON.stringify(tooSmallInputs)}`
    ).toHaveLength(0)
  })

  test('AC-1: currency inputs have computed font-size ≥ 16px for very long values (len > 16) at 375px', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // Type a very long number (len > 16) to trigger the smallest valueFontSize clamp
    const usdInput = page.getByTestId('currency-input-USD')
    await usdInput.click()
    await usdInput.fill('12345678901234567')

    const tooSmallInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'))
      const visible = inputs.filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      return visible
        .map(el => ({
          testId: el.getAttribute('data-testid') ?? '(no testid)',
          fontSize: parseFloat(window.getComputedStyle(el).fontSize),
        }))
        .filter(entry => entry.fontSize < 16)
    })

    expect(
      tooSmallInputs,
      `Found inputs with font-size < 16px after long value (len > 16): ${JSON.stringify(tooSmallInputs)}`
    ).toHaveLength(0)
  })

  test('AC-1: picker search input has computed font-size ≥ 16px at 375px viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="currency-input-USD"]')

    // Open the picker sheet
    await page.getByTestId('add-currency-btn').click()
    await page.getByTestId('picker-sheet').waitFor({ state: 'visible' })

    const searchInput = page.getByTestId('picker-search')
    await searchInput.waitFor({ state: 'visible' })

    const fontSize = await searchInput.evaluate(el => {
      return parseFloat(window.getComputedStyle(el).fontSize)
    })

    expect(
      fontSize,
      `Picker search input font-size is ${fontSize}px — must be ≥ 16px to prevent iOS Safari auto-zoom`
    ).toBeGreaterThanOrEqual(16)
  })
})
