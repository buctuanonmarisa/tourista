import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { DEFAULT_COUNTRY, FALLBACK_COUNTRIES, FALLBACK_VIBES } from '@/lib/travel-options'

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoFor = (vlog: { coverImage?: string | null; title: string; location: string; country: string }) =>
  vlog.coverImage ||
  `https://loremflickr.com/1200/800/${encodeURIComponent(vlog.location)},${encodeURIComponent(vlog.country)},travel/all?lock=${stableImageLock(vlog.title)}`

const STOP_WORDS = new Set([
  'i','me','my','we','us','our','want','wanna','would','like','to','go','visit','see','travel','trip','tour','vlog',
  'vlogs','video','videos','show','find','search','for','in','at','on','the','a','an','of','and','or','with','near',
  'around','please','pls','can','you','display','related','similar',
])

const SYNONYMS: Record<string, string[]> = {
  'national park': ['national park','park','wildlife','nature','mountain','lake','forest','hiking','banff','kruger','amboseli','tsavo','patagonia'],
  palawan: ['palawan','el nido','coron','puerto princesa','kayangan lake','philippines','island hopping','beach islands'],
  island: ['island','islands','beach','beaches','lagoon','snorkeling','diving','island hopping','beach islands'],
  islands: ['island','islands','beach','beaches','lagoon','snorkeling','diving','island hopping','beach islands'],
  beach: ['beach','beaches','island','islands','coast','surf','snorkeling','diving','beach islands'],
  nature: ['nature','wildlife','national park','mountain','lake','forest','hiking'],
  wildlife: ['wildlife','nature','national park','animals','marine sanctuary','komodo','deer'],
  food: ['food','street food','food culture','restaurant','market','ramen','hawker'],
  temple: ['temple','temples','historical sites','culture','heritage','ancient'],
  temples: ['temple','temples','historical sites','culture','heritage','ancient'],
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)))

const buildSearchTerms = (search: string) => {
  const normalized = normalize(search)
  if (!normalized) return { phrases: [] as string[], tokens: [] as string[] }

  const rawTokens = normalized.split(' ').filter(token => token.length > 1 && !STOP_WORDS.has(token))
  const bigrams = rawTokens.slice(0, -1).map((token, index) => `${token} ${rawTokens[index + 1]}`)
  const phrases = unique([normalized, ...bigrams.filter(phrase => phrase.length > 5)])
  const expanded = [...rawTokens, ...bigrams].flatMap(term => SYNONYMS[term] || [])
  const tokens = unique([...rawTokens, ...expanded.flatMap(term => normalize(term).split(' '))])
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))

  return { phrases, tokens }
}

const fieldScore = (field: string, phrases: string[], tokens: string[], weight: number) => {
  const text = normalize(field)
  if (!text) return 0
  let score = 0

  for (const phrase of phrases) {
    if (phrase && text === phrase) score += weight * 2.6
    else if (phrase && text.includes(phrase)) score += weight * 1.5
  }

  const words = text.split(' ')
  for (const token of tokens) {
    if (words.includes(token)) score += weight
    else if (text.includes(token)) score += weight * 0.55
    else if (words.some(word => word.length > 4 && token.length > 4 && (word.startsWith(token) || token.startsWith(word)))) {
      score += weight * 0.35
    }
  }

  return score
}

type SearchableVlog = {
  title: string
  location: string
  country: string
  region: string
  vibe: string
  description?: string | null
  views: number
  trending: boolean
  author?: { handle: string } | null
}

const scoreVlog = (
  vlog: SearchableVlog,
  search: string,
) => {
  const { phrases, tokens } = buildSearchTerms(search)
  if (phrases.length === 0 && tokens.length === 0) return 0

  const title = fieldScore(vlog.title, phrases, tokens, 90)
  const location = fieldScore(vlog.location, phrases, tokens, 105)
  const country = fieldScore(vlog.country, phrases, tokens, 85)
  const vibe = fieldScore(vlog.vibe, phrases, tokens, 70)
  const region = fieldScore(vlog.region, phrases, tokens, 45)
  const description = fieldScore(vlog.description || '', phrases, tokens, 34)
  const author = fieldScore(vlog.author?.handle || '', phrases, tokens, 12)
  const popularity = Math.min(35, Math.log10(Math.max(1, vlog.views || 0)) * 6) + (vlog.trending ? 12 : 0)

  return title + location + country + vibe + region + description + author + popularity
}

const loadOptionLabels = async (category: string, fallback: string[]) => {
  try {
    const options = await prisma.travelOption.findMany({
      where: { category, active: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: { label: true },
    })
    return options.length ? options.map(option => option.label) : fallback
  } catch {
    return fallback
  }
}

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const vibe = searchParams.get('vibe') || ''
  const country = searchParams.get('country') || searchParams.get('region') || ''
  const budget = searchParams.get('budget') || ''
  const access = searchParams.get('access') || ''
  const mine = searchParams.get('mine') === 'true'

  const where: Prisma.VlogWhereInput = { status: 'live' }

  const andFilters: Prisma.VlogWhereInput[] = []
  const selectedVibes = vibe.split(',').map(v => v.trim()).filter(v => v && v !== 'All vlogs')
  if (selectedVibes.length) {
    andFilters.push({ OR: selectedVibes.map(v => ({ vibe: { contains: v } })) })
  }
  const selectedCountries = country.split(',').map(c => c.trim()).filter(c => c && c !== 'All countries' && c !== 'All regions')
  if (selectedCountries.length) {
    andFilters.push({ OR: selectedCountries.map(c => ({ country: c })) })
  }

  if (budget && budget !== 'Any budget') {
    if (budget === 'Under ₱10k') where.cost = { lt: 10000 }
    else if (budget === '₱10k – ₱30k') where.cost = { gte: 10000, lte: 30000 }
    else if (budget === 'Above ₱30k') where.cost = { gt: 30000 }
    else if (budget === 'Free vlogs only') where.credits = 0
  }

  if (access === 'free') where.credits = 0
  else if (access === 'unlock') where.credits = { gt: 0 }

  if (andFilters.length) where.AND = andFilters

  const vlogs = await prisma.vlog.findMany({
    where,
    include: {
      author: {
        select: { id: true, handle: true, initials: true, avatarColor: true, verified: true },
      },
    },
    orderBy: mine || search ? [{ createdAt: 'desc' }] : [{ trending: 'desc' }, { views: 'desc' }],
  })

  const scored = search
    ? vlogs
        .map(vlog => ({ vlog, score: scoreVlog(vlog, search) }))
        .sort((a, b) => b.score - a.score || Number(b.vlog.trending) - Number(a.vlog.trending) || b.vlog.views - a.vlog.views)
    : []
  const relevanceCutoff = scored.length ? Math.max(45, scored[0].score * 0.16) : 0
  let ranked = search
    ? scored.filter(item => item.score >= relevanceCutoff).map(item => item.vlog)
    : vlogs

  const fallback = Boolean(search && ranked.length === 0)
  if (fallback) {
    ranked = [...vlogs]
      .sort((a, b) => Number(b.trending) - Number(a.trending) || b.views - a.views)
      .slice(0, 12)
  }

  return NextResponse.json(
    ranked.map(vlog => ({ ...vlog, coverImage: coverPhotoFor(vlog) })),
    { headers: fallback ? { 'x-search-fallback': 'true' } : undefined },
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let author = await prisma.user.findFirst()
    if (!author) {
      author = await prisma.user.create({
        data: {
          handle: 'traveler',
          name: 'Traveler',
          initials: 'T',
          avatarColor: 'ag',
        },
      })
    }

    const stripNonDigit = (s: string) => parseInt(String(s).replace(/[^\d]/g, '') || '0')
    const allowedCountries = await loadOptionLabels('country', FALLBACK_COUNTRIES)
    const allowedVibes = await loadOptionLabels('vibe', FALLBACK_VIBES)
    const requestedCountry = typeof body.country === 'string' ? body.country.trim() : ''
    const country = allowedCountries.includes(requestedCountry) ? requestedCountry : DEFAULT_COUNTRY
    const locationBase = body.city || body.cities || body.location || 'Unknown'
    const requestedVibes = String(body.vibe || '')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
    const vibe = requestedVibes.filter(v => allowedVibes.includes(v)).join(',') || allowedVibes[0] || 'All vlogs'
    const title = body.title || 'Untitled Vlog'
    const fallbackCoverImage =
      `https://loremflickr.com/1200/800/${encodeURIComponent(locationBase)},${encodeURIComponent(country)},travel/all?lock=${stableImageLock(title)}`

    const vlog = await prisma.vlog.create({
      data: {
        title,
        location: `${locationBase}, ${country}`,
        country,
        region: body.region || country,
        vibe,
        cost: body.cost ? stripNonDigit(body.cost) : null,
        currency: 'PHP',
        duration: body.duration ? stripNonDigit(body.duration) : null,
        credits: typeof body.credits === 'number' ? body.credits : stripNonDigit(body.credits || '0'),
        description: body.description || null,
        youtubeUrl: body.youtubeUrl || null,
        facebookUrl: body.facebookUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        instagramUrl: body.instagramUrl || null,
        thumbnailColor: ['t1', 't2', 't3', 't4', 't5'][Math.floor(Math.random() * 5)],
        status: body.status || 'live',
        authorId: author.id,
        coverImage: body.coverImage || fallbackCoverImage,
        itinerary:
          body.itinerary?.length > 0
            ? {
                create: body.itinerary.map((d: {
                  day: number; activity: string; cost: string; locked: boolean
                  highlights?: string; foodTips?: string; gettingThere?: string; tips?: string
                  mediaUrl?: string; mediaType?: string; clipUrl?: string
                  clipUrls?: string[]
                  media?: Array<{ url: string; type: 'image' | 'video' }>
                }) => {
                  const media = buildItineraryMedia(d)
                  return {
                    day: d.day,
                    activity: d.activity || d.highlights?.slice(0, 120) || `Day ${d.day}`,
                    cost: d.cost ? stripNonDigit(d.cost) : null,
                    locked: d.locked || false,
                    highlights: d.highlights || null,
                    foodTips: d.foodTips || null,
                    gettingThere: d.gettingThere || null,
                    tips: d.tips || null,
                    clipDescription: media.length ? JSON.stringify({ media }) : null,
                    mediaUrl: media[0]?.url || null,
                    mediaType: media[0]?.type || null,
                  }
                }),
              }
            : undefined,
      },
      include: { author: true, itinerary: { orderBy: { day: 'asc' } } },
    })

    return NextResponse.json(vlog, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create vlog' }, { status: 500 })
  }
}
