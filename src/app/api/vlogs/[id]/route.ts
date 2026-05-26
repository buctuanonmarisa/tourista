import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoFor = (vlog: { coverImage?: string | null; title: string; location: string; country: string }) =>
  vlog.coverImage ||
  `https://loremflickr.com/1200/800/${encodeURIComponent(vlog.location)},${encodeURIComponent(vlog.country)},travel/all?lock=${stableImageLock(vlog.title)}`

const stripNonDigit = (value: unknown) => parseInt(String(value || '').replace(/[^\d]/g, '') || '0')

const buildItineraryMedia = (day: {
  clipUrl?: string
  clipUrls?: string[]
  mediaUrl?: string
  mediaType?: string
  media?: Array<{ url: string; type: 'image' | 'video' }>
}) => {
  const clipUrls = Array.isArray(day.clipUrls)
    ? day.clipUrls.map(url => String(url || '').trim()).filter(Boolean)
    : (day.clipUrl ? [String(day.clipUrl).trim()].filter(Boolean) : [])
  const uploadedMedia = Array.isArray(day.media) ? day.media.filter(item => item.url) : []
  const media = [
    ...clipUrls.map(url => ({ url, type: 'video' as const })),
    ...uploadedMedia,
  ]
  const fallback = day.mediaUrl ? [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' as const : 'image' as const }] : []
  return media.length ? media : fallback
}

const parseItineraryMedia = (day: { clipDescription?: string | null; mediaUrl?: string | null; mediaType?: string | null }) => {
  try {
    const parsed = day.clipDescription ? JSON.parse(day.clipDescription) : null
    if (Array.isArray(parsed?.media)) {
      return parsed.media.filter((item: { url?: string; type?: string }) => item.url)
    }
  } catch {
    /* fall back to legacy media fields */
  }
  return day.mediaUrl ? [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' : 'image' }] : []
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const vlog = await prisma.vlog.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          handle: true,
          initials: true,
          avatarColor: true,
          verified: true,
          followers: true,
          vlogCount: true,
        },
      },
      itinerary: { orderBy: { day: 'asc' } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  })

  if (!vlog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.vlog.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

  return NextResponse.json({
    ...vlog,
    coverImage: coverPhotoFor(vlog),
    itinerary: vlog.itinerary.map(day => ({ ...day, media: parseItineraryMedia(day) })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const country = body.country || 'Philippines'
    const locationBase = body.city || body.cities || body.location || 'Unknown'
    const title = body.title || 'Untitled Vlog'
    const fallbackCoverImage =
      `https://loremflickr.com/1200/800/${encodeURIComponent(locationBase)},${encodeURIComponent(country)},travel/all?lock=${stableImageLock(title)}`

    const vlog = await prisma.vlog.update({
      where: { id: params.id },
      data: {
        title,
        location: `${locationBase}, ${country}`,
        country,
        region: body.region || country,
        vibe: body.vibe || 'All vlogs',
        cost: body.cost ? stripNonDigit(body.cost) : null,
        duration: body.duration ? stripNonDigit(body.duration) : null,
        credits: typeof body.credits === 'number' ? body.credits : stripNonDigit(body.credits),
        description: body.description || null,
        youtubeUrl: body.youtubeUrl || null,
        facebookUrl: body.facebookUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        instagramUrl: body.instagramUrl || null,
        coverImage: body.coverImage || fallbackCoverImage,
        itinerary: {
          deleteMany: {},
          create: (body.itinerary || []).map((day: {
            day: number; activity?: string; cost?: string; locked?: boolean
            highlights?: string; foodTips?: string; gettingThere?: string; tips?: string
            mediaUrl?: string; mediaType?: string; clipUrl?: string
            clipUrls?: string[]
            media?: Array<{ url: string; type: 'image' | 'video' }>
          }) => {
            const media = buildItineraryMedia(day)
            return {
              day: day.day,
              activity: day.activity || day.highlights?.slice(0, 120) || `Day ${day.day}`,
              cost: day.cost ? stripNonDigit(day.cost) : null,
              locked: day.locked || false,
              highlights: day.highlights || null,
              foodTips: day.foodTips || null,
              gettingThere: day.gettingThere || null,
              tips: day.tips || null,
              clipDescription: media.length ? JSON.stringify({ media }) : null,
              mediaUrl: media[0]?.url || null,
              mediaType: media[0]?.type || null,
            }
          }),
        },
      },
      include: { author: true, itinerary: { orderBy: { day: 'asc' } }, reviews: { orderBy: { createdAt: 'desc' }, take: 30 } },
    })

    return NextResponse.json({ ...vlog, coverImage: coverPhotoFor(vlog) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update vlog' }, { status: 500 })
  }
}
