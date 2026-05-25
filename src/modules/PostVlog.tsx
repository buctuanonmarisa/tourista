'use client'

import { useState, useCallback, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { DEFAULT_COUNTRY, FALLBACK_VIBES } from '@/lib/travel-options'

/**
 * POST VLOG MODULE
 *
 * Handles the 3-step vlog posting process:
 * - Step 1: Video & Info (video link, title, description, cover photo, country, cities, vibe)
 * - Step 2: Itinerary (day-by-day breakdown with activities, costs, media, tips)
 * - Step 3: Credits & Publish (credits calculation, income projection, confirmation, publish)
 */

interface ItineraryFormDay {
  day: number
  activity: string
  cost: string
  locked: boolean
  mediaUrl?: string
  mediaType?: 'image' | 'video' | null
  media?: Array<{ url: string; type: 'image' | 'video' }>
  mediaCarouselIndex?: number
  highlights?: string
  foodTips?: string
  gettingThere?: string
  tips?: string
  expanded?: boolean
}

interface PostFormData {
  title: string
  description: string
  country: string
  cities: string
  vibe: string
  credits: number
  coverImage: string
}

interface PostVlogProps {
  onPublishSuccess: () => void
}

const defaultPostForm: PostFormData = {
  title: '',
  description: '',
  country: DEFAULT_COUNTRY,
  cities: '',
  vibe: '',
  credits: 2,
  coverImage: '',
}

const defaultItinDays: ItineraryFormDay[] = [
  { day: 1, activity: '', cost: '', locked: false, expanded: false },
  { day: 2, activity: '', cost: '', locked: false, expanded: false },
  { day: 3, activity: '', cost: '', locked: true, expanded: false },
]

const VIBES = FALLBACK_VIBES

export default function PostVlog({ onPublishSuccess }: PostVlogProps) {
  // ─── State ───
  const [postStep, setPostStep] = useState(1)
  const [postForm, setPostForm] = useState(defaultPostForm)
  const [itinDays, setItinDays] = useState<ItineraryFormDay[]>(defaultItinDays.map((d) => ({ ...d })))
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDetected, setVideoDetected] = useState('')
  const [altLinks, setAltLinks] = useState({ fb: '', tt: '', ig: '' })
  const [showAltLinks, setShowAltLinks] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [creditsReviewed, setCreditsReviewed] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [dayUploading, setDayUploading] = useState<Record<number, boolean>>({})
  const [vibeInput, setVibeInput] = useState('')
  const [vibeFocused, setVibeFocused] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [cityFocused, setCityFocused] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState<Record<string, boolean>>({})
  const [emojiPickerField, setEmojiPickerField] = useState<string | null>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // ─── Step Navigation ───
  const nextStep = () => {
    setPublishError('')
    if (postStep === 1) {
      if (!videoUrl.trim()) {
        setPublishError('Please add a video link (YouTube, Facebook, TikTok, or Instagram).')
        return
      }
      if (!postForm.title.trim()) {
        setPublishError('Please add a vlog title.')
        return
      }
    }
    if (postStep === 2) {
      const hasDay = itinDays.some(
        (d) =>
          d.activity.trim() ||
          d.highlights?.trim() ||
          d.foodTips?.trim() ||
          d.gettingThere?.trim() ||
          d.tips?.trim()
      )
      if (!hasDay) {
        setPublishError('Please fill in at least one itinerary day.')
        return
      }
    }
    if (postStep === 3) {
      if (!creditsReviewed) {
        setPublishError('Please review and confirm the credits before publishing.')
        return
      }
      const hasFreeDays = itinDays.some(
        (d) =>
          !d.locked &&
          (d.activity.trim() ||
            d.highlights?.trim() ||
            d.foodTips?.trim() ||
            d.gettingThere?.trim() ||
            d.tips?.trim())
      )
      if (!hasFreeDays) {
        setPublishError('Please unlock at least one itinerary day so tourists can preview your content.')
        return
      }
      publishVlog()
      return
    }
    setPostStep((s) => s + 1)
  }

  const prevStep = () => {
    setPublishError('')
    setCreditsReviewed(false)
    if (postStep === 1) return
    setPostStep((s) => s - 1)
  }

  // ─── Publish ───
  const publishVlog = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      const isYt = videoUrl.includes('youtube') || videoUrl.includes('youtu.be')
      const isFb = videoUrl.includes('facebook') || videoUrl.includes('fb.com')
      const isTt = videoUrl.includes('tiktok')
      const isIg = videoUrl.includes('instagram')

      const filledDays = itinDays.filter(
        (d) =>
          d.activity.trim() ||
          d.highlights?.trim() ||
          d.foodTips?.trim() ||
          d.gettingThere?.trim() ||
          d.tips?.trim()
      )

      const calculatedCredits = Math.ceil(
        filledDays.reduce((sum, d) => {
          if (!d.cost.trim()) return sum
          const cleaned = d.cost.replace(/[₱$,\s]/g, '')
          const num = parseInt(cleaned) || 0
          return sum + num
        }, 0) / 75
      )

      const res = await fetch('/api/vlogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postForm,
          credits: calculatedCredits,
          youtubeUrl: isYt ? videoUrl : altLinks.fb.includes('youtube') ? altLinks.fb : null,
          facebookUrl: isFb ? videoUrl : altLinks.fb.includes('facebook') ? altLinks.fb : null,
          tiktokUrl: isTt ? videoUrl : altLinks.tt || null,
          instagramUrl: isIg ? videoUrl : altLinks.ig || null,
          itinerary: filledDays,
        }),
      })

      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        setPublishError(e.error || 'Failed to publish. Please try again.')
        return
      }

      // Reset form
      setPostForm(defaultPostForm)
      setVideoUrl('')
      setVideoDetected('')
      setAltLinks({ fb: '', tt: '', ig: '' })
      setPostStep(1)
      setVibeInput('')
      setVibeFocused(false)
      setItinDays(defaultItinDays.map((d) => ({ ...d })))
      setCreditsReviewed(false)

      onPublishSuccess()
    } catch {
      setPublishError('Network error. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      <h2>Post a Vlog - Step {postStep} of 3</h2>

      {/* Step Indicator */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                padding: '10px 15px',
                background: postStep >= s ? '#4CAF50' : '#ddd',
                color: postStep >= s ? 'white' : '#666',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              {postStep > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {postStep === 1 && <Step1Video videoUrl={videoUrl} setVideoUrl={setVideoUrl} postForm={postForm} setPostForm={setPostForm} />}
      {postStep === 2 && <Step2Itinerary itinDays={itinDays} setItinDays={setItinDays} />}
      {postStep === 3 && <Step3Credits itinDays={itinDays} creditsReviewed={creditsReviewed} setCreditsReviewed={setCreditsReviewed} />}

      {/* Error Message */}
      {publishError && <div style={{ color: 'red', marginTop: '10px' }}>{publishError}</div>}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={prevStep} disabled={postStep === 1}>
          ← Back
        </button>
        <button onClick={nextStep} disabled={publishing || (postStep === 3 && !creditsReviewed)}>
          {postStep === 3 ? (publishing ? 'Publishing…' : 'Publish →') : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

// ─── Step Components ───

function Step1Video({ videoUrl, setVideoUrl, postForm, setPostForm }: any) {
  return (
    <div>
      <h3>Step 1: Video & Info</h3>
      <div style={{ marginBottom: '15px' }}>
        <label>Video URL</label>
        <input
          type="text"
          placeholder="YouTube, Facebook, TikTok, or Instagram link"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Title</label>
        <input
          type="text"
          placeholder="e.g., Siargao in 7 days"
          value={postForm.title}
          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Description</label>
        <textarea
          placeholder="What's this vlog about?"
          value={postForm.description}
          onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
        />
      </div>
    </div>
  )
}

function Step2Itinerary({ itinDays, setItinDays }: any) {
  return (
    <div>
      <h3>Step 2: Itinerary</h3>
      <p>Add day-by-day itinerary details</p>
      {itinDays.map((day: ItineraryFormDay, idx: number) => (
        <div key={idx} style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ fontWeight: 600, marginBottom: '10px' }}>Day {day.day}</div>
          <input
            type="text"
            placeholder="Activity"
            value={day.activity}
            onChange={(e) => {
              const newDays = [...itinDays]
              newDays[idx].activity = e.target.value
              setItinDays(newDays)
            }}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <input
            type="text"
            placeholder="Cost (₱)"
            value={day.cost}
            onChange={(e) => {
              const newDays = [...itinDays]
              newDays[idx].cost = e.target.value
              setItinDays(newDays)
            }}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={day.locked}
              onChange={(e) => {
                const newDays = [...itinDays]
                newDays[idx].locked = e.target.checked
                setItinDays(newDays)
              }}
            />
            Locked (Premium only)
          </label>
        </div>
      ))}
    </div>
  )
}

function Step3Credits({ itinDays, creditsReviewed, setCreditsReviewed }: any) {
  const totalDayCost = itinDays.reduce((sum: number, day: ItineraryFormDay) => {
    if (!day.cost.trim()) return sum
    const cleaned = day.cost.replace(/[₱$,\s]/g, '')
    const num = parseInt(cleaned) || 0
    return sum + num
  }, 0)

  const calculatedCredits = Math.ceil(totalDayCost / 75)

  return (
    <div>
      <h3>Step 3: Credits & Publish</h3>
      <div style={{ marginBottom: '15px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
        <strong>Credits to unlock your full itinerary</strong>
        <div style={{ marginTop: '10px' }}>
          <div>Credits per tourist: {calculatedCredits === 0 ? 'Free' : `${calculatedCredits} credit${calculatedCredits > 1 ? 's' : ''}`}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Total itinerary cost: ₱{totalDayCost.toLocaleString()}
            <br />
            ÷ ₱75 per credit = {calculatedCredits} credit{calculatedCredits > 1 ? 's' : ''}
          </div>
          {calculatedCredits > 0 && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              At {calculatedCredits} credit{calculatedCredits > 1 ? 's' : ''} · ₱{calculatedCredits * 10} per tourist · 80% to you = ₱{calculatedCredits * 8}
              <br />
              Est. 50 unlocks/month = ₱{(calculatedCredits * 8 * 50).toLocaleString()} passive income
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '15px', padding: '15px', background: '#fffacd', borderRadius: '8px' }}>
        <strong>✅ Ready to publish?</strong>
        <p>Your vlog will go live immediately. Tourists can browse your itinerary and pay credits to unlock locked days. Make sure costs are accurate.</p>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '15px' }}>
        <input
          type="checkbox"
          checked={creditsReviewed}
          onChange={(e) => setCreditsReviewed(e.target.checked)}
          style={{ marginTop: '3px' }}
        />
        <span>I&apos;ve reviewed the credits and understand the pricing. I also confirm that at least one itinerary day is unlocked for tourists to preview.</span>
      </label>
    </div>
  )
}
