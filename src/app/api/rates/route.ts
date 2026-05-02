import { fetchRates } from '@/lib/exchange-rate-api'
import { NextResponse } from 'next/server'

export const revalidate = 86400 // 24h cache

export async function GET() {
  const data = await fetchRates()
  return NextResponse.json(data)
}
