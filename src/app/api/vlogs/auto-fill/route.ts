import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { detectVideoSource } from '@/utils/vlogHelpers'
import { FALLBACK_VIBES, FALLBACK_COUNTRIES } from '@/lib/travel-options'

/**
 * AI Auto-Fill API Endpoint
 *
 * Accepts a YouTube URL, extracts metadata, and uses Google Gemini AI
 * to generate enhanced vlog content across every post-vlog step.
 */

type GeneratedItineraryDay = {
  day?: number
  activity?: string
  highlights?: string
  food_tips?: string
  foodTips?: string
  getting_there?: string
  gettingThere?: string
  tips?: string
  estimated_cost_php?: string | number
  cost?: string | number
  media?: Array<{ url: string; type: 'image' | 'video' }>
}

type YouTubeMetadata = {
  title: string
  author: string
  thumbnailUrl: string
  description?: string
  durationSeconds?: number
  keywords?: string[]
  transcript?: string
  transcriptLanguage?: string
}

type CaptionTrack = {
  baseUrl?: string
  languageCode?: string
  name?: { simpleText?: string; runs?: Array<{ text?: string }> }
  kind?: string
  vssId?: string
}

const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
].filter(Boolean) as string[]

const RETRYABLE_GEMINI_STATUSES = new Set([429, 500, 502, 503, 504])

const stripToJson = (value: string) => {
  let cleanedText = value.trim()
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/```\n?/g, '')
  }

  const firstBrace = cleanedText.indexOf('{')
  const lastBrace = cleanedText.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleanedText = cleanedText.slice(firstBrace, lastBrace + 1)
  }

  return cleanedText
}

const toDigits = (value: unknown) => String(value || '0').replace(/[^\d]/g, '')
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const TRANSCRIPT_PROMPT_LIMIT = 12000

const htmlDecode = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const compactWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const captionTrackName = (track: CaptionTrack) =>
  track.name?.simpleText || track.name?.runs?.map(run => run.text || '').join('') || ''

const chooseCaptionTrack = (tracks: CaptionTrack[]) => {
  if (!tracks.length) return null

  const manuallyCreatedEnglish = tracks.find(track =>
    track.languageCode?.toLowerCase().startsWith('en') && track.kind !== 'asr'
  )
  if (manuallyCreatedEnglish) return manuallyCreatedEnglish

  const anyEnglish = tracks.find(track => track.languageCode?.toLowerCase().startsWith('en'))
  if (anyEnglish) return anyEnglish

  return tracks.find(track => track.kind !== 'asr') || tracks[0]
}

const parseJson3Transcript = (data: any) => {
  if (!Array.isArray(data?.events)) return ''

  return compactWhitespace(
    data.events
      .flatMap((event: any) => Array.isArray(event?.segs) ? event.segs : [])
      .map((segment: any) => segment?.utf8 || '')
      .join(' '),
  )
}

const parseXmlTranscript = (xml: string) =>
  compactWhitespace(
    [...xml.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
      .map(match => htmlDecode(decodeURIComponent(match[1].replace(/\+/g, ' '))))
      .join(' '),
  )

const fetchCaptionTranscript = async (track: CaptionTrack) => {
  if (!track.baseUrl) return ''

  const transcriptUrl = new URL(track.baseUrl)
  transcriptUrl.searchParams.set('fmt', 'json3')

  const jsonResponse = await fetch(transcriptUrl.toString())
  if (jsonResponse.ok) {
    const data = await jsonResponse.json().catch(() => null)
    const transcript = parseJson3Transcript(data)
    if (transcript) return transcript
  }

  const xmlUrl = new URL(track.baseUrl)
  const xmlResponse = await fetch(xmlUrl.toString())
  if (!xmlResponse.ok) return ''

  return parseXmlTranscript(await xmlResponse.text())
}

const extractJsonObject = (source: string, marker: string) => {
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) return null

  const firstBrace = source.indexOf('{', markerIndex)
  if (firstBrace < 0) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = firstBrace; index < source.length; index += 1) {
    const char = source[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue
    if (char === '{') depth += 1
    if (char === '}') depth -= 1

    if (depth === 0) {
      return source.slice(firstBrace, index + 1)
    }
  }

  return null
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || null
    } else if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || null
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1]?.split('?')[0] || null
    }
    return null
  } catch {
    return null
  }
}

const splitPlaces = (value: unknown) =>
  String(value || '')
    .split(',')
    .map(item => compactWhitespace(item))
    .filter(Boolean)

const generateItineraryMedia = (): Array<{ url: string; type: 'image' | 'video' }> => []

const assumedDayCostPhp = (country: string, dayIndex: number) => {
  const baseByCountry: Record<string, number> = {
    Philippines: 2800,
    Japan: 8500,
    Thailand: 3600,
    Indonesia: 3400,
    Vietnam: 3000,
    Singapore: 9000,
    USA: 11000,
    Canada: 10000,
    Australia: 10500,
    France: 9500,
    Italy: 9000,
    Greece: 8500,
    'United Kingdom': 10000,
    Ecuador: 5200,
    'South Africa': 5800,
  }
  const base = baseByCountry[country] || 5000
  const multiplier = [1, 1.15, 0.9, 1.25, 1.05, 1.1, 0.95][dayIndex % 7]
  return String(Math.round((base * multiplier) / 100) * 100)
}

const dayCostOrAssumption = (day: GeneratedItineraryDay, country: string, index: number) => {
  const cost = toDigits(day.cost || day.estimated_cost_php)
  return cost && Number(cost) > 0 ? cost : assumedDayCostPhp(country, index)
}

// Fetch YouTube video metadata using oEmbed API (no API key needed)
async function fetchYouTubeMetadata(videoId: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

  const response = await fetch(oembedUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch YouTube metadata')
  }

  const data = await response.json()
  // Always use maxresdefault for highest quality thumbnail
  const metadata: YouTubeMetadata = {
    title: data.title || '',
    author: data.author_name || '',
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  }

  try {
    const watchResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 TouristaMetadataBot/1.0',
      },
    })

    if (watchResponse.ok) {
      const html = await watchResponse.text()
      const playerResponseJson = extractJsonObject(html, 'ytInitialPlayerResponse')

      if (playerResponseJson) {
        const playerResponse = JSON.parse(playerResponseJson)
        const videoDetails = playerResponse?.videoDetails || {}
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
        metadata.title = videoDetails.title || metadata.title
        metadata.author = videoDetails.author || metadata.author
        metadata.description = videoDetails.shortDescription || metadata.description
        metadata.durationSeconds = Number(videoDetails.lengthSeconds) || metadata.durationSeconds
        metadata.keywords = Array.isArray(videoDetails.keywords)
          ? videoDetails.keywords.slice(0, 20).map(String)
          : metadata.keywords

        if (Array.isArray(captionTracks)) {
          const track = chooseCaptionTrack(captionTracks)
          if (track) {
            metadata.transcript = await fetchCaptionTranscript(track)
            metadata.transcriptLanguage = captionTrackName(track) || track.languageCode
          }
        }
      }

      metadata.description ||= htmlDecode(
        html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ||
        html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)?.[1] ||
        '',
      )
    }
  } catch (error) {
    console.warn('YouTube page metadata unavailable; using oEmbed only:', error)
  }

  return metadata
}

// Generate enhanced vlog content using Google Gemini AI
async function generateVlogContent(metadata: YouTubeMetadata) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please add it to your .env file.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const vibesList = FALLBACK_VIBES.join(', ')
  const countriesList = FALLBACK_COUNTRIES.join(', ')
  const transcriptExcerpt = metadata.transcript
    ? metadata.transcript.slice(0, TRANSCRIPT_PROMPT_LIMIT)
    : 'Not available'

  const prompt = `You are a travel vlog content specialist. Analyze this YouTube video metadata and transcript, then generate structured travel vlog content.

VIDEO METADATA:
- Title: ${metadata.title}
- Author: ${metadata.author}
- Description: ${metadata.description || 'Not available'}
- Keywords: ${metadata.keywords?.join(', ') || 'Not available'}
- Duration: ${metadata.durationSeconds ? `${Math.round(metadata.durationSeconds / 60)} minutes` : 'Not available'}
- Transcript language: ${metadata.transcriptLanguage || 'Not available'}

TRANSCRIPT EXCERPT:
${transcriptExcerpt}

TASK: Generate a JSON response with these exact fields:
{
  "enhanced_title": "Catchy, SEO-friendly title (max 80 chars)",
  "description": "Engaging 3-4 sentence description highlighting what makes this trip special",
  "country": "Country name (must be one of: ${countriesList})",
  "cities": "Comma-separated list of 2-5 cities, islands, neighborhoods, or landmarks inferred from the title",
  "travel_vibes": ["Select 2-3 from: ${vibesList}"],
  "estimated_cost_php": "Estimated total trip cost in PHP (number only, e.g., 15000)",
  "estimated_days": "Trip duration in days (1-30)",
  "itinerary": [
    {
      "day": 1,
      "activity": "Specific main activity for this day",
      "highlights": "✨ Use emojis! 3-4 specific attractions, moments, or shots from this day. Be descriptive and exciting. Example: '🏛️ Explored the ancient pyramids at sunrise, 🐪 camel ride through the desert, 📸 sunset at the Sphinx'",
      "food_tips": "🍜 Use emojis! Where/what to eat and realistic meal advice. Include specific dishes, restaurant types, and price ranges. Example: '🥙 Try koshari at local street vendors (₱150-200), 🍰 Must-try: Om Ali dessert at Naguib Mahfouz Cafe, 🥤 Fresh sugarcane juice everywhere (₱50)'",
      "getting_there": "🚌 Use emojis! Transport route, how to move around, and fare guidance. Be specific about transport types and costs. Example: '🚕 Uber from airport to hotel (₱800-1000), 🚇 Metro is cheapest (₱20/ride), 🚌 Day tour buses (₱1500 with guide)'",
      "tips": "💡 Use emojis! Practical travel, booking, timing, and budget tips with specific advice. Example: '💰 Bring cash - many places don't take cards, 🌅 Visit pyramids early morning to avoid crowds, 🎫 Book tours online for 20% discount, 🧴 Sunscreen is essential!'",
      "estimated_cost_php": "Day cost estimate in PHP (number only)"
    }
  ]
}

IMPORTANT:
- Respond ONLY with valid JSON (no markdown, no code blocks, no backticks)
- Use realistic cost estimates based on the destination
- Treat the transcript as the strongest source when it is available
- Build the itinerary from the vlog's actual sequence. If the video says Day 1, put those captured moments, places, food, transport, and tips in Day 1. If day labels are not explicit, infer a sensible order from the route and note what travelers should verify.
- Make every itinerary field concise, specific, and exciting: roughly 12-24 words for highlights, food_tips, getting_there, and tips.
- Use several relevant emojis in every itinerary detail field, with the first character being an emoji.
- Include concrete vlog-based details, but avoid long paragraphs. Prefer one punchy sentence per field.
- Extract actual locations mentioned in the transcript or metadata only
- Do not claim specific attractions, restaurants, transport routes, or events unless they are supported by the transcript or metadata
- If the transcript and metadata are too vague, keep the itinerary broad and say what the traveler should verify
- Choose vibes that match the video content
- Return one itinerary object for every estimated day, up to 10 days maximum
- Make every itinerary day distinct and useful, not generic filler
- Day 1 and Day 2 should be free-preview quality; later days can be premium detail
- Include food_tips, getting_there, tips, highlights, activity, and estimated_cost_php for every day
- Keep descriptions engaging and informative
- **CRITICAL: The "country" field MUST match the actual country shown in the video. Analyze the title, description, keywords, and transcript carefully to identify the correct country. For example, if the video is about Egypt, the country MUST be "Egypt", NOT "Philippines". Only use "Philippines" as a fallback if no country can be determined from the video content.**
- If the country is clearly mentioned in the title (e.g., "Egypt Travel Guide"), use that country
- The cities field should contain cities from the identified country, not from a different country
- **EMOJIS ARE MANDATORY**: Every highlights, food_tips, getting_there, and tips field MUST start with relevant emojis and include emojis throughout to make content visually appealing
- **BE SPECIFIC AND REALISTIC**: Include actual prices, specific locations, real transport options, and practical advice based on the destination
- **MAKE IT ENGAGING**: Write like a travel blogger sharing insider tips, not a generic travel guide
- Use conversational language with personality (e.g., "Don't miss...", "Pro tip:", "Trust me on this...")
- Include time-saving tips, money-saving hacks, and local secrets when possible
- Ensure all fields are present in the response`

  let lastError: unknown
  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      return JSON.parse(stripToJson(result.response.text()))
    } catch (error: any) {
      lastError = error
      const status = Number(error?.status || error?.response?.status)
      const message = String(error?.message || '')
      const canTryNextModel =
        status === 404 ||
        RETRYABLE_GEMINI_STATUSES.has(status) ||
        message.includes('is not found') ||
        message.includes('not supported') ||
        message.includes('high demand') ||
        message.includes('try again later')
      if (!canTryNextModel) break
    }
  }

  console.error('AI generation error:', lastError)
  throw new Error('Failed to generate AI content. Please try again.')
}

const normalizeItinerary = (aiResponse: any, duration: number): GeneratedItineraryDay[] => {
  if (Array.isArray(aiResponse.itinerary) && aiResponse.itinerary.length > 0) {
    return aiResponse.itinerary
  }

  if (aiResponse.day1_itinerary) {
    return [{ day: 1, ...aiResponse.day1_itinerary }]
  }

  return Array.from({ length: Math.min(duration, 3) }, (_, index) => ({
    day: index + 1,
    activity: index === 0 ? aiResponse.enhanced_title : `Day ${index + 1} travel plan`,
    highlights: aiResponse.description || '',
    tips: 'Review and adjust this AI-generated day before publishing.',
    estimated_cost_php: '0',
  }))
}

const conciseDetail = (value: unknown, fallbackEmoji: string) => {
  const text = compactWhitespace(String(value || ''))
  if (!text) return ''

  const withoutDuplicateEmoji = text.startsWith(fallbackEmoji) ? text : `${fallbackEmoji} ${text}`
  const words = withoutDuplicateEmoji.split(' ')
  if (words.length <= 28) return withoutDuplicateEmoji

  return `${words.slice(0, 28).join(' ').replace(/[,.!?;:]*$/, '')}.`
}

const countryFromMetadata = (metadata: Pick<YouTubeMetadata, 'title' | 'description' | 'keywords'>) => {
  const metadataText = [
    metadata.title,
    metadata.keywords?.join(' '),
    metadata.description,
  ].filter(Boolean).join(' ').toLowerCase()

  if (metadataText.includes('galapagos') || metadataText.includes('galápagos')) {
    return 'Ecuador'
  }

  const findCountry = (source: string) =>
    FALLBACK_COUNTRIES.find(country => source.toLowerCase().includes(country.toLowerCase()))

  return (
    findCountry(metadata.title || '') ||
    findCountry(metadata.keywords?.join(' ') || '') ||
    findCountry(metadata.description || '') ||
    'Philippines'
  )
}

const cityOptionsForCountry: Record<string, string[]> = {
  'South Africa': ['Cape Town', 'Kruger National Park', 'Garden Route'],
  Philippines: ['Manila', 'Cebu', 'Palawan'],
  Japan: ['Tokyo', 'Kyoto', 'Osaka'],
  Thailand: ['Bangkok', 'Chiang Mai', 'Phuket'],
  Indonesia: ['Bali', 'Ubud', 'Jakarta'],
  France: ['Paris', 'Nice', 'Lyon'],
  Italy: ['Rome', 'Florence', 'Venice'],
  Greece: ['Athens', 'Santorini', 'Crete'],
  USA: ['New York', 'Los Angeles', 'San Francisco'],
  Canada: ['Banff', 'Vancouver', 'Toronto'],
  Ecuador: ['Galapagos Islands', 'Santa Cruz Island', 'Isabela Island', 'San Cristobal Island', 'Quito'],
}

function buildFallbackAIResponse(metadata: YouTubeMetadata, videoId: string) {
  const country = countryFromMetadata(metadata)
  const cities = cityOptionsForCountry[country] || [country]
  const duration = 3
  const itinerary = Array.from({ length: duration }, (_, index) => {
    const place = cities[index % cities.length]
    const day: GeneratedItineraryDay = {
      day: index + 1,
      activity: `${place} travel highlights`,
      highlights: `✨ Use this day for the strongest ${place} sights and scenic stops mentioned in the vlog.`,
      food_tips: `🍜 Try local food near the route and verify specific restaurants from the creator's video notes.`,
      getting_there: `🚕 Cluster nearby stops, use rideshare or local transport, and check drive times before booking.`,
      tips: `💡 Start early, save offline maps, and confirm fees or opening hours before locking the plan.`,
      estimated_cost_php: assumedDayCostPhp(country, index),
    }

    return {
      day: index + 1,
      activity: day.activity || `Day ${index + 1}`,
      highlights: conciseDetail(day.highlights, '✨'),
      foodTips: conciseDetail(day.food_tips, '🍜'),
      gettingThere: conciseDetail(day.getting_there, '🚕'),
      tips: conciseDetail(day.tips, '💡'),
      cost: dayCostOrAssumption(day, country, index),
      media: generateItineraryMedia(),
    }
  })

  return {
    title: metadata.title.slice(0, 100),
    description: metadata.description || `A travel vlog by ${metadata.author}`,
    country,
    cities: cities.join(', '),
    vibe: '',
    coverImage: metadata.thumbnailUrl,
    duration,
    estimatedCost: itinerary.reduce((sum, day) => sum + (parseInt(day.cost) || 0), 0).toString(),
    cost: itinerary.reduce((sum, day) => sum + (parseInt(day.cost) || 0), 0).toString(),
    itinerary,
  }
}

// Validate and clean AI response
function validateAIResponse(aiResponse: any, metadata: YouTubeMetadata, videoId: string) {
  // Try to extract country from video title if AI response is invalid
  let country = aiResponse.country

  // Check if the AI-provided country is valid
  if (!FALLBACK_COUNTRIES.includes(country)) {
    // Try to extract country from title
    const titleLower = metadata.title.toLowerCase()
    const foundCountry = FALLBACK_COUNTRIES.find(c =>
      titleLower.includes(c.toLowerCase())
    )
    country = foundCountry || countryFromMetadata(metadata)
  }

  const vibes = Array.isArray(aiResponse.travel_vibes)
    ? aiResponse.travel_vibes.filter((v: string) => FALLBACK_VIBES.includes(v)).slice(0, 3)
    : []
  const vibeString = vibes.join(',')

  const duration = clamp(parseInt(aiResponse.estimated_days) || 3, 1, 30)

  const itinerary = normalizeItinerary(aiResponse, duration)
    .slice(0, Math.min(duration, 10))
    .map((day, index) => ({
      day: Number(day.day) || index + 1,
      activity: String(day.activity || `Day ${index + 1}`).slice(0, 180),
      highlights: conciseDetail(day.highlights, '✨'),
      foodTips: conciseDetail(day.foodTips || day.food_tips, '🍜'),
      gettingThere: conciseDetail(day.gettingThere || day.getting_there, '🚕'),
      tips: conciseDetail(day.tips, '💡'),
      cost: dayCostOrAssumption(day, country, index),
      media: generateItineraryMedia(),
    }))

  const itineraryTotal = itinerary.reduce((sum, day) => sum + (parseInt(day.cost) || 0), 0)
  const estimatedCost = toDigits(aiResponse.estimated_cost_php) || String(itineraryTotal)

  return {
    title: (aiResponse.enhanced_title || metadata.title).slice(0, 100),
    description: aiResponse.description || '',
    country,
    cities: aiResponse.cities || '',
    vibe: vibeString,
    coverImage: metadata.thumbnailUrl,
    duration,
    estimatedCost,
    cost: estimatedCost,
    itinerary,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { youtubeUrl } = body

    // Validate YouTube URL
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 },
      )
    }

    const videoSource = detectVideoSource(youtubeUrl)
    if (videoSource !== 'youtube') {
      return NextResponse.json(
        { error: 'Only YouTube URLs are supported for AI auto-fill' },
        { status: 400 },
      )
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 },
      )
    }

    let metadata
    try {
      metadata = await fetchYouTubeMetadata(videoId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch YouTube video data. Please check the URL.' },
        { status: 404 },
      )
    }

    let aiResponse
    try {
      aiResponse = await generateVlogContent(metadata)
    } catch (error: any) {
      return NextResponse.json(
        {
          success: true,
          data: buildFallbackAIResponse(metadata, videoId),
          warning: 'AI enhancement unavailable. Basic metadata provided.',
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: validateAIResponse(aiResponse, metadata, videoId),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Auto-fill error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
