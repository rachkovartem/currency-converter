import { describe, it, expect, vi, afterEach } from 'vitest'

describe('getProvider factory', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns ExchangeRateProvider when RATE_PROVIDER=exchangerate-api', async () => {
    vi.stubEnv('RATE_PROVIDER', 'exchangerate-api')
    const { getProvider } = await import('@/lib/providers/index')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = getProvider()
    expect(provider).toBeInstanceOf(ExchangeRateProvider)
  })

  it('returns OpenExchangeRatesProvider when RATE_PROVIDER=open-exchange-rates', async () => {
    vi.stubEnv('RATE_PROVIDER', 'open-exchange-rates')
    const { getProvider } = await import('@/lib/providers/index')
    const { OpenExchangeRatesProvider } = await import('@/lib/providers/open-exchange-rates')
    const provider = getProvider()
    expect(provider).toBeInstanceOf(OpenExchangeRatesProvider)
  })

  it('defaults to ExchangeRateProvider when RATE_PROVIDER is not set', async () => {
    vi.stubEnv('RATE_PROVIDER', '')
    const { getProvider } = await import('@/lib/providers/index')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = getProvider()
    expect(provider).toBeInstanceOf(ExchangeRateProvider)
  })

  it('warns and defaults to ExchangeRateProvider when RATE_PROVIDER has unknown value', async () => {
    vi.stubEnv('RATE_PROVIDER', 'unknown-provider')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { getProvider } = await import('@/lib/providers/index')
    const { ExchangeRateProvider } = await import('@/lib/providers/exchangerate')
    const provider = getProvider()
    expect(provider).toBeInstanceOf(ExchangeRateProvider)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
