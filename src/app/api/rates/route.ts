import { fetchRates } from '@/lib/exchange-rate-api'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const { rates, updatedAt } = await fetchRates()
  return NextResponse.json({ rates, updatedAt })
}
