import Link from 'next/link'
import { ConverterApp } from '@/components/converter-app'
import { fetchRates } from '@/lib/exchange-rate-api'
import { getServerConverterCookieState } from '@/lib/cookie-storage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Convert — Currency Converter | Live Exchange Rates',
  description:
    'Free real-time currency converter with live ECB exchange rates. Convert USD to EUR, GBP, JPY and 140+ world currencies instantly. Free, no sign-up required',
  alternates: { canonical: '/' },
}

export default async function Page() {
  const { rates: initialRates, updatedAt: ratesUpdatedAt } = await fetchRates()
  const cookieState = await getServerConverterCookieState()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Convert — Currency Converter',
    description: 'Real-time currency converter with official ECB exchange rates',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: 'https://currency.coreplex.cc',
    featureList: ['Currency conversion', 'Live exchange rates', 'ECB rates', '140+ currencies', 'Conversion history', 'PWA support'],
    inLanguage: 'en',
    isAccessibleForFree: true,
    screenshot: [
      {
        '@type': 'ImageObject',
        url: 'https://currency.coreplex.cc/screenshots/desktop.png',
        width: 1280,
        height: 800,
        caption: 'Currency converter on desktop',
      },
      {
        '@type': 'ImageObject',
        url: 'https://currency.coreplex.cc/screenshots/mobile.png',
        width: 390,
        height: 844,
        caption: 'Currency converter on mobile',
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      >
        Free currency converter with live exchange rates. Convert between USD, EUR, GBP, JPY and 140+ world currencies using official ECB rates updated daily. Features conversion history and PWA support.
      </p>
      <ConverterApp initialRates={initialRates} ratesUpdatedAt={ratesUpdatedAt} initialState={cookieState} />
      <footer
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      >
        <nav>
          <Link href="/">Currency Converter</Link>
          <a href="https://coreplex.cc">Coreplex</a>
          <Link href="/?from=USD&to=EUR">USD to EUR converter</Link>
          <Link href="/?from=EUR&to=GBP">EUR to GBP converter</Link>
          <Link href="/?from=USD&to=JPY">USD to JPY converter</Link>
          <Link href="/?from=GBP&to=USD">GBP to USD converter</Link>
        </nav>
      </footer>
    </main>
  )
}
