import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FALLBACK_BUDGETS, FALLBACK_COUNTRIES, FALLBACK_VIBES } from '@/lib/travel-options'

export const dynamic = 'force-dynamic'

const groupedFallback = {
  countries: FALLBACK_COUNTRIES,
  vibes: FALLBACK_VIBES,
  budgets: FALLBACK_BUDGETS,
}

export async function GET() {
  try {
    const options = await prisma.travelOption.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }],
    })

    const countries = options.filter(option => option.category === 'country').map(option => option.label)
    const vibes = options.filter(option => option.category === 'vibe').map(option => option.label)
    const budgets = options.filter(option => option.category === 'budget').map(option => option.label)

    return NextResponse.json({
      countries: Array.from(new Set([...countries, ...FALLBACK_COUNTRIES])),
      vibes: Array.from(new Set([...vibes, ...FALLBACK_VIBES])),
      budgets: Array.from(new Set([...budgets, ...FALLBACK_BUDGETS])),
    })
  } catch {
    return NextResponse.json(groupedFallback)
  }
}
