import { ConverterApp } from '@/components/converter-app'
import { fetchRates } from '@/lib/exchange-rate-api'
import { getServerConverterCookieState } from '@/lib/cookie-storage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Convert — Currency Converter | Live Exchange Rates',
  description:
    'Free real-time currency converter. Convert USD to EUR, GBP, JPY and 20+ currencies. ECB rates, sparkline charts, and conversion history.',
}

export default async function Page() {
  const { rates: initialRates, date: ratesDate } = await fetchRates()
  const cookieState = await getServerConverterCookieState()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Convert — Currency Converter',
    description: 'Real-time currency converter with official ECB exchange rates',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--cc-bg-grad)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {cookieState && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__CC_STATE__=${JSON.stringify(cookieState)
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')}`
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConverterApp initialRates={initialRates} ratesDate={ratesDate} />
    </main>
  )
}
