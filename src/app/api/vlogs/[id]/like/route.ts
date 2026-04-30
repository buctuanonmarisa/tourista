import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { liked } = await req.json()
  const vlog = await prisma.vlog.update({
    where: { id: params.id },
    data: { likes: { increment: liked ? 1 : -1 } },
  })
  return NextResponse.json({ likes: vlog.likes })
}
