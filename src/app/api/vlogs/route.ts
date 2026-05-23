import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoFor = (vlog: { coverImage?: string | null; title: string; location: string; country: string }) =>
  vlog.coverImage ||
  `https://loremflickr.com/1200/800/${encodeURIComponent(vlog.location)},${encodeURIComponent(vlog.country)},travel/all?lock=${stableImageLock(vlog.title)}`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const vibe = searchParams.get('vibe') || ''
  const region = searchParams.get('region') || ''
  const budget = searchParams.get('budget') || ''
  const mine = searchParams.get('mine') === 'true'

  const where: Prisma.VlogWhereInput = { status: 'live' }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { location: { contains: search } },
      { country: { contains: search } },
    ]
  }

  if (vibe && vibe !== 'All vlogs') where.vibe = { contains: vibe }
  if (region && region !== 'All regions') where.region = region

  if (budget && budget !== 'Any budget') {
    if (budget === 'Under ₱10k') where.cost = { lt: 10000 }
    else if (budget === '₱10k – ₱30k') where.cost = { gte: 10000, lte: 30000 }
    else if (budget === 'Above ₱30k') where.cost = { gt: 30000 }
    else if (budget === 'Free vlogs only') where.credits = 0
  }

  const vlogs = await prisma.vlog.findMany({
    where,
    include: {
      author: {
        select: { id: true, handle: true, initials: true, avatarColor: true, verified: true },
      },
    },
    orderBy: mine ? [{ createdAt: 'desc' }] : [{ trending: 'desc' }, { views: 'desc' }],
  })

  return NextResponse.json(vlogs.map(vlog => ({ ...vlog, coverImage: coverPhotoFor(vlog) })))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let author = await prisma.user.findFirst()
    if (!author) {
      author = await prisma.user.create({
        data: {
          handle: 'traveler',
          name: 'Traveler',
          initials: 'T',
          avatarColor: 'ag',
        },
      })
    }

    const stripNonDigit = (s: string) => parseInt(String(s).replace(/[^\d]/g, '') || '0')
    const country = body.country || 'Philippines'
    const locationBase = body.city || body.cities || body.location || 'Unknown'
    const vibe = body.vibe || 'All vlogs'
    const title = body.title || 'Untitled Vlog'
    const fallbackCoverImage =
      `https://loremflickr.com/1200/800/${encodeURIComponent(locationBase)},${encodeURIComponent(country)},travel/all?lock=${stableImageLock(title)}`

    const vlog = await prisma.vlog.create({
      data: {
        title,
        location: `${locationBase}, ${country}`,
        country,
        region: body.region || 'Philippines',
        vibe,
        cost: body.cost ? stripNonDigit(body.cost) : null,
        currency: 'PHP',
        duration: body.duration ? stripNonDigit(body.duration) : null,
        credits: typeof body.credits === 'number' ? body.credits : stripNonDigit(body.credits || '0'),
        description: body.description || null,
        youtubeUrl: body.youtubeUrl || null,
        facebookUrl: body.facebookUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        instagramUrl: body.instagramUrl || null,
        thumbnailColor: ['t1', 't2', 't3', 't4', 't5'][Math.floor(Math.random() * 5)],
        status: body.status || 'live',
        authorId: author.id,
        coverImage: body.coverImage || fallbackCoverImage,
        itinerary:
          body.itinerary?.length > 0
            ? {
                create: body.itinerary.map((d: {
                  day: number; activity: string; cost: string; locked: boolean
                  highlights?: string; foodTips?: string; gettingThere?: string; tips?: string
                  mediaUrl?: string; mediaType?: string
                  media?: Array<{ url: string; type: 'image' | 'video' }>
                }) => ({
                  day: d.day,
                  activity: d.activity || d.highlights?.slice(0, 120) || `Day ${d.day}`,
                  cost: d.cost ? stripNonDigit(d.cost) : null,
                  locked: d.locked || false,
                  highlights: d.highlights || null,
                  foodTips: d.foodTips || null,
                  gettingThere: d.gettingThere || null,
                  tips: d.tips || null,
                  // Use first media item if available, otherwise use legacy mediaUrl
                  mediaUrl: d.media?.[0]?.url || d.mediaUrl || null,
                  mediaType: d.media?.[0]?.type || d.mediaType || null,
                })),
              }
            : undefined,
      },
      include: { author: true, itinerary: { orderBy: { day: 'asc' } } },
    })

    return NextResponse.json(vlog, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create vlog' }, { status: 500 })
  }
}
