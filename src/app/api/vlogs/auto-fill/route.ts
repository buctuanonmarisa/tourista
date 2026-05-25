import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { detectVideoSource } from '@/utils/vlogHelpers'
import { FALLBACK_VIBES, FALLBACK_COUNTRIES } from '@/lib/travel-options'

/**
 * AI Auto-Fill API Endpoint
 *
 * Accepts a YouTube URL, extracts metadata, and uses Google Gemini AI
 * to generate enhanced vlog content (title, description, vibes, itinerary)
 */

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

// Fetch YouTube video metadata using oEmbed API (no API key needed!)
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
  // Using stable Gemini 1.5 Flash model (fast and cost-effective)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const vibesList = FALLBACK_VIBES.join(', ')
  const countriesList = FALLBACK_COUNTRIES.slice(0, 20).join(', ')

  const prompt = `You are a travel vlog content specialist. Analyze this YouTube video metadata and generate structured travel vlog content.

VIDEO METADATA:
- Title: ${metadata.title}
- Author: ${metadata.author}

TASK: Generate a JSON response with these exact fields:
{
  "enhanced_title": "Catchy, SEO-friendly title (max 80 chars)",
  "description": "Engaging 3-4 sentence description highlighting what makes this trip special",
  "country": "Country name (must be from: ${countriesList}, etc.)",
  "cities": "Comma-separated list of 2-4 cities/locations mentioned",
  "travel_vibes": ["Select 2-3 from: ${vibesList}"],
  "estimated_cost_php": "Estimated total trip cost in PHP (number only, e.g., 15000)",
  "estimated_days": "Trip duration in days (1-30)",
  "day1_itinerary": {
    "activity": "Brief description of Day 1 main activity",
    "highlights": "3-4 specific highlights or attractions",
    "tips": "Practical travel tips for Day 1",
    "estimated_cost_php": "Day 1 cost estimate (number only)"
  }
}

IMPORTANT:
- Respond ONLY with valid JSON (no markdown, no code blocks, no backticks)
- Use realistic cost estimates based on the destination
- Extract actual locations mentioned in the title
- Choose vibes that match the video content
- Keep descriptions engaging and informative
- If location is unclear, default to "Philippines"
- Ensure all fields are present in the response`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Clean up response (remove markdown code blocks if present)
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '')
    }

    const aiResponse = JSON.parse(cleanedText)
    return aiResponse
  } catch (error: any) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate AI content. Please try again.')
  }
}

// Validate and clean AI response
function validateAIResponse(aiResponse: any, metadata: { title: string; thumbnailUrl: string }) {
  // Validate country
  const country = FALLBACK_COUNTRIES.includes(aiResponse.country)
    ? aiResponse.country
    : 'Philippines'

  // Validate and clean vibes
  const vibes = Array.isArray(aiResponse.travel_vibes)
    ? aiResponse.travel_vibes.filter((v: string) => FALLBACK_VIBES.includes(v)).slice(0, 3)
    : []
  const vibeString = vibes.join(',')

  // Clean and validate costs
  const estimatedCost = String(aiResponse.estimated_cost_php || '0').replace(/[^\d]/g, '')
  const day1Cost = String(aiResponse.day1_itinerary?.estimated_cost_php || '0').replace(/[^\d]/g, '')

  // Validate duration
  const duration = Math.min(Math.max(parseInt(aiResponse.estimated_days) || 7, 1), 30)

  return {
    title: (aiResponse.enhanced_title || metadata.title).slice(0, 100),
    description: aiResponse.description || '',
    country,
    cities: aiResponse.cities || '',
    vibe: vibeString,
    coverImage: metadata.thumbnailUrl,
    duration,
    estimatedCost,
    itinerary: [
      {
        day: 1,
        activity: aiResponse.day1_itinerary?.activity || '',
        highlights: aiResponse.day1_itinerary?.highlights || '',
        tips: aiResponse.day1_itinerary?.tips || '',
        cost: day1Cost,
      }
    ]
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
        { status: 400 }
      )
    }

    const videoSource = detectVideoSource(youtubeUrl)
    if (videoSource !== 'youtube') {
      return NextResponse.json(
        { error: 'Only YouTube URLs are supported for AI auto-fill' },
        { status: 400 }
      )
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      )
    }

    // Fetch YouTube metadata
    let metadata
    try {
      metadata = await fetchYouTubeMetadata(videoId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch YouTube video data. Please check the URL.' },
        { status: 404 }
      )
    }

    // Generate AI content
    let aiResponse
    try {
      aiResponse = await generateVlogContent(metadata)
    } catch (error: any) {
      // Fallback to basic metadata if AI fails
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
            duration: 7,
            estimatedCost: '0',
            itinerary: []
          },
          warning: 'AI enhancement unavailable. Basic metadata provided.'
        },
        { status: 200 }
      )
    }

    // Validate and clean AI response
    const validatedData = validateAIResponse(aiResponse, metadata)

    return NextResponse.json(
      {
        success: true,
        data: validatedData
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Auto-fill error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
