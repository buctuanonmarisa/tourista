import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { setSessionCookie } from '@/lib/auth-session'

const cleanHandle = (value: string) =>
  value.trim().replace(/^@+/, '')

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const handle = cleanHandle(String(body.handle || ''))

  if (!handle) {
    return NextResponse.json({ error: 'Enter your username to continue.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { handle } })
  if (!user) {
    return NextResponse.json({ error: 'No profile uses that username yet. Register first.' }, { status: 404 })
  }

  const response = NextResponse.json({ user })
  setSessionCookie(response, user.id)
  return response
}
