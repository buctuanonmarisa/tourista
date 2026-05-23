import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoFor = (vlog: { coverImage?: string | null; title: string; location: string; country: string }) =>
  vlog.coverImage ||
  `https://loremflickr.com/1200/800/${encodeURIComponent(vlog.location)},${encodeURIComponent(vlog.country)},travel/all?lock=${stableImageLock(vlog.title)}`

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

  return NextResponse.json({ ...vlog, coverImage: coverPhotoFor(vlog) })
}
