import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    if (!body.text?.trim()) return NextResponse.json({ error: 'Review text required' }, { status: 400 })

    const review = await prisma.review.create({
      data: {
        vlogId: params.id,
        authorName: body.authorName || 'Anonymous',
        rating: Math.min(5, Math.max(1, body.rating || 5)),
        text: body.text.trim(),
      },
    })

    const all = await prisma.review.findMany({ where: { vlogId: params.id } })
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length
    await prisma.vlog.update({
      where: { id: params.id },
      data: { rating: Math.round(avg * 10) / 10, ratingCount: all.length },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
