import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { setSessionCookie } from '@/lib/auth-session'

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U'

const handleFor = (value: string) =>
  value
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 28)

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  const handle = handleFor(String(body.handle || name))

  if (!name || !handle) {
    return NextResponse.json({ error: 'Add your name and a simple username to register.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { handle } })
  if (existing) {
    return NextResponse.json({ error: 'That username is already taken. Try another one or log in with it.' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: {
      handle,
      name,
      initials: initialsFor(name),
      avatarColor: 'ag',
      country: body.country || 'Philippines',
      travelStyle: body.travelStyle || 'Budget',
      credits: 12,
    },
  })

  const response = NextResponse.json({ user }, { status: 201 })
  setSessionCookie(response, user.id)
  return response
}
