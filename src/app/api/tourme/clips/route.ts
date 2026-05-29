import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const generatedCoverImage = (title: string, location: string, country: string) => {
  const params = new URLSearchParams({
    title,
    place: location,
    country,
    theme: 'travel cover',
    day: '1',
    seed: String(stableImageLock(`${title}-${location}-${country}`)),
  })
  return `/api/generated-travel-image?${params.toString()}`
}

const coverPhotoFor = (vlog: { coverImage?: string | null; title: string; location: string; country: string }) =>
  vlog.coverImage ||
  generatedCoverImage(vlog.title, vlog.location, vlog.country)

const parseMedia = (day: { clipDescription?: string | null; mediaUrl?: string | null; mediaType?: string | null }) => {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spot = (searchParams.get('spot') || '').trim()
  const country = (searchParams.get('country') || '').trim()

  if (!spot || !country) {
    return NextResponse.json({ clips: [] })
  }

  const vlogs = await prisma.vlog.findMany({
    where: {
      status: 'live',
      country,
      OR: [
        { location: { contains: spot } },
        { title: { contains: spot } },
        { description: { contains: spot } },
      ],
    },
    include: {
      author: {
        select: { id: true, handle: true, initials: true, avatarColor: true, verified: true },
      },
      itinerary: { orderBy: { day: 'asc' } },
    },
    orderBy: [{ trending: 'desc' }, { views: 'desc' }, { likes: 'desc' }],
    take: 20,
  })

  const clips = vlogs.flatMap(vlog =>
    vlog.itinerary.flatMap(day =>
      parseMedia(day)
        .filter((item: { url?: string; type?: string }) => item.type === 'video' && item.url)
        .map((item: { url: string; type: string }, mediaIndex: number) => ({
          id: `${day.id}-${mediaIndex}`,
          url: item.url,
          title: day.activity,
          description: day.highlights || day.tips || day.description || vlog.description || '',
          day: day.day,
          vlogId: vlog.id,
          vlogTitle: vlog.title,
          location: vlog.location,
          country: vlog.country,
          coverImage: coverPhotoFor(vlog),
          author: vlog.author,
          views: vlog.views,
          likes: vlog.likes,
        })),
    ),
  )

  return NextResponse.json({ clips: clips.slice(0, 8) })
}
