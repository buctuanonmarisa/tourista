import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const body = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name || user.name,
      tagline: body.tagline ?? user.tagline,
      bio: body.bio ?? user.bio,
      avatarImage: body.avatarImage ?? user.avatarImage,
      coverImage: body.coverImage ?? user.coverImage,
      isAdmin: Boolean(body.isAdmin),
      country: body.country ?? user.country,
      travelStyle: body.travelStyle ?? user.travelStyle,
      youtubeUrl: body.youtubeUrl ?? user.youtubeUrl,
      instagramUrl: body.instagramUrl ?? user.instagramUrl,
      tiktokUrl: body.tiktokUrl ?? user.tiktokUrl,
    },
  })
  return NextResponse.json(updated)
}
