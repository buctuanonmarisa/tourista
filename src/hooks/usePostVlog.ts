import { useState, useCallback } from 'react'

/**
 * CUSTOM HOOK: usePostVlog
 *
 * Manages the state and logic for the 3-step vlog posting flow
 * Handles form data, validation, and API submission
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

const defaultPostForm: PostFormData = {
  title: '',
  description: '',
  country: 'Philippines',
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

export function usePostVlog() {
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

  // ─── Validation ───
  const validateStep = useCallback((step: number): boolean => {
    setPublishError('')

    if (step === 1) {
      if (!videoUrl.trim()) {
        setPublishError('Please add a video link (YouTube, Facebook, TikTok, or Instagram).')
        return false
      }
      if (!postForm.title.trim()) {
        setPublishError('Please add a vlog title.')
        return false
      }
    }

    if (step === 2) {
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
        return false
      }
    }

    if (step === 3) {
      if (!creditsReviewed) {
        setPublishError('Please review and confirm the credits before publishing.')
        return false
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
        return false
      }
    }

    return true
  }, [videoUrl, postForm.title, itinDays, creditsReviewed])

  // ─── Navigation ───
  const nextStep = useCallback(() => {
    if (!validateStep(postStep)) return
    if (postStep < 3) {
      setPostStep((s) => s + 1)
    }
  }, [postStep, validateStep])

  const prevStep = useCallback(() => {
    setPublishError('')
    setCreditsReviewed(false)
    if (postStep > 1) {
      setPostStep((s) => s - 1)
    }
  }, [postStep])

  // ─── Publishing ───
  const publishVlog = useCallback(async () => {
    if (!validateStep(3)) return

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
      setItinDays(defaultItinDays.map((d) => ({ ...d })))
      setCreditsReviewed(false)

      return true
    } catch {
      setPublishError('Network error. Please try again.')
      return false
    } finally {
      setPublishing(false)
    }
  }, [videoUrl, altLinks, postForm, itinDays, validateStep])

  // ─── Reset ───
  const resetForm = useCallback(() => {
    setPostForm(defaultPostForm)
    setVideoUrl('')
    setVideoDetected('')
    setAltLinks({ fb: '', tt: '', ig: '' })
    setPostStep(1)
    setItinDays(defaultItinDays.map((d) => ({ ...d })))
    setCreditsReviewed(false)
    setPublishError('')
  }, [])

  return {
    // State
    postStep,
    postForm,
    itinDays,
    videoUrl,
    videoDetected,
    altLinks,
    showAltLinks,
    publishing,
    publishError,
    creditsReviewed,

    // Setters
    setPostStep,
    setPostForm,
    setItinDays,
    setVideoUrl,
    setVideoDetected,
    setAltLinks,
    setShowAltLinks,
    setCreditsReviewed,

    // Methods
    nextStep,
    prevStep,
    publishVlog,
    resetForm,
    validateStep,
  }
}
