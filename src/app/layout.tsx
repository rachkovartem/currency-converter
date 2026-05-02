import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Convert — Currency Converter',
  description: 'Real-time currency converter. Convert USD, EUR, GBP, JPY and 140+ currencies instantly.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Convert — Currency Converter',
    description: 'Real-time currency converter. Convert 140+ currencies with live exchange rates.',
    url: 'https://currency.coreplex.cc',
    siteName: 'Convert',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Convert — Real-time currency converter',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert — Currency Converter',
    description: 'Real-time currency converter. Convert 140+ currencies with live exchange rates.',
    images: ['/twitter-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Convert',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ margin: 0, padding: 0, background: '#000', overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
