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
}

const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
].filter(Boolean) as string[]

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

// Fetch YouTube video metadata using oEmbed API (no API key needed)
async function fetchYouTubeMetadata(videoId: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

  const response = await fetch(oembedUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch YouTube metadata')
  }

  const data = await response.json()
  return {
    title: data.title || '',
    author: data.author_name || '',
    thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

// Generate enhanced vlog content using Google Gemini AI
async function generateVlogContent(metadata: { title: string; author: string; thumbnailUrl: string }) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please add it to your .env file.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const vibesList = FALLBACK_VIBES.join(', ')
  const countriesList = FALLBACK_COUNTRIES.join(', ')

  const prompt = `You are a travel vlog content specialist. Analyze this YouTube video metadata and generate structured travel vlog content.

VIDEO METADATA:
- Title: ${metadata.title}
- Author: ${metadata.author}

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
      "highlights": "3-4 specific attractions, moments, or shots from this day",
      "food_tips": "Where/what to eat and realistic meal advice for this day",
      "getting_there": "Transport route, how to move around, and fare guidance",
      "tips": "Practical travel, booking, timing, and budget tips",
      "estimated_cost_php": "Day cost estimate in PHP (number only)"
    }
  ]
}

IMPORTANT:
- Respond ONLY with valid JSON (no markdown, no code blocks, no backticks)
- Use realistic cost estimates based on the destination
- Extract actual locations mentioned in the title
- Choose vibes that match the video content
- Return one itinerary object for every estimated day, up to 10 days maximum
- Make every itinerary day distinct and useful, not generic filler
- Day 1 and Day 2 should be free-preview quality; later days can be premium detail
- Include food_tips, getting_there, tips, highlights, activity, and estimated_cost_php for every day
- Keep descriptions engaging and informative
- If location is unclear, default to "Philippines"
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
      const canTryNextModel = status === 404 || message.includes('is not found') || message.includes('not supported')
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

// Validate and clean AI response
function validateAIResponse(aiResponse: any, metadata: { title: string; thumbnailUrl: string }) {
  const country = FALLBACK_COUNTRIES.includes(aiResponse.country)
    ? aiResponse.country
    : 'Philippines'

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
      highlights: String(day.highlights || ''),
      foodTips: String(day.foodTips || day.food_tips || ''),
      gettingThere: String(day.gettingThere || day.getting_there || ''),
      tips: String(day.tips || ''),
      cost: toDigits(day.cost || day.estimated_cost_php),
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
          data: {
            title: metadata.title,
            description: `A travel vlog by ${metadata.author}`,
            country: 'Philippines',
            cities: '',
            vibe: '',
            coverImage: metadata.thumbnailUrl,
            duration: 3,
            estimatedCost: '0',
            cost: '0',
            itinerary: [],
          },
          warning: 'AI enhancement unavailable. Basic metadata provided.',
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: validateAIResponse(aiResponse, metadata),
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
