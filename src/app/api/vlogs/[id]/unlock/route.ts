import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 401 })

  const existing = await prisma.unlock.findUnique({
    where: { vlogId_userId: { vlogId: params.id, userId: user.id } },
  })

  if (existing) return NextResponse.json({ unlocked: true })

  await prisma.unlock.create({ data: { vlogId: params.id, userId: user.id } })
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: 2 } },
  })

  return NextResponse.json({ unlocked: true }, { status: 201 })
}
