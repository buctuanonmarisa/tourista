import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await prisma.user.findFirst()
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const user = await prisma.user.findFirst()
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name || user.name,
      tagline: body.tagline ?? user.tagline,
      bio: body.bio ?? user.bio,
      country: body.country ?? user.country,
      travelStyle: body.travelStyle ?? user.travelStyle,
      youtubeUrl: body.youtubeUrl ?? user.youtubeUrl,
      instagramUrl: body.instagramUrl ?? user.instagramUrl,
      tiktokUrl: body.tiktokUrl ?? user.tiktokUrl,
    },
  })
  return NextResponse.json(updated)
}
