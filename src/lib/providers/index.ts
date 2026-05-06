import { ExchangeRateProvider } from './exchangerate'
import { OpenExchangeRatesProvider } from './open-exchange-rates'
import type { RateProvider } from './types'

export function getProvider(): RateProvider {
  const providerName = process.env.RATE_PROVIDER

  switch (providerName) {
    case 'exchangerate-api':
    case undefined:
    case '':
      return new ExchangeRateProvider()

    case 'open-exchange-rates':
      return new OpenExchangeRatesProvider()

    default:
      console.warn(
        `Unknown RATE_PROVIDER value "${providerName}", falling back to exchangerate-api`
      )
      return new ExchangeRateProvider()
  }
}
