'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FALLBACK_BUDGETS, FALLBACK_COUNTRIES, FALLBACK_VIBES } from '@/lib/travel-options'

/**
 * BROWSE MODULE
 *
 * Handles:
 * - Browsing and discovering vlogs
 * - Filtering by vibe, country, budget
 * - Viewing vlog details
 * - Liking, reviewing, unlocking vlogs
 * - Following creators
 */

interface VlogAuthor {
  id: string
  handle: string
  initials: string
  avatarColor: string
  verified: boolean
  followers?: number
  vlogCount?: number
}

interface VlogCard {
  id: string
  title: string
  location: string
  cost?: number | null
  currency: string
  rating: number
  views: number
  likes: number
  credits: number
  thumbnailColor: string
  trending: boolean
  author: VlogAuthor
  description?: string | null
  youtubeUrl?: string | null
  facebookUrl?: string | null
  tiktokUrl?: string | null
  instagramUrl?: string | null
  duration?: number | null
  coverImage?: string | null
}

interface ItineraryDay {
  id: string
  day: number
  activity: string
  cost?: number | null
  locked: boolean
  highlights?: string | null
  foodTips?: string | null
  gettingThere?: string | null
  tips?: string | null
}

interface Review {
  id: string
  authorName: string
  rating: number
  text: string
  createdAt: string
}

interface VlogDetail extends VlogCard {
  country: string
  region: string
  vibe: string
  ratingCount: number
  itinerary: ItineraryDay[]
  reviews: Review[]
}

interface BrowseProps {
  onViewDetail: (vlogId: string) => void
  onGoToProfile: () => void
}

const VIBES = FALLBACK_VIBES
const COUNTRIES = ['All countries', ...FALLBACK_COUNTRIES]
const BUDGETS = ['Any budget', ...FALLBACK_BUDGETS]

export default function Browse({ onViewDetail, onGoToProfile }: BrowseProps) {
  // ─── State ───
  const [vlogs, setVlogs] = useState<VlogCard[]>([])
  const [search, setSearch] = useState('')
  const [vibe, setVibe] = useState('All vlogs')
  const [country, setCountry] = useState('All countries')
  const [budget, setBudget] = useState('Any budget')
  const [activeFilterTab, setActiveFilterTab] = useState<'vibe' | 'country' | 'budget'>('vibe')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null)
  const feedRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ─── API Calls ───
  const fetchVlogs = useCallback(async () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (vibe !== 'All vlogs') p.set('vibe', vibe)
    if (country !== 'All countries') p.set('country', country)
    if (budget !== 'Any budget') p.set('budget', budget)
    try {
      const r = await fetch(`/api/vlogs?${p}`)
      const d = await r.json()
      if (Array.isArray(d)) setVlogs(d)
    } catch {
      /* ignore */
    }
  }, [search, vibe, country, budget])

  // ─── Effects ───
  useEffect(() => {
    fetchVlogs()
  }, [fetchVlogs])

  useEffect(() => {
    if (!vlogs.length) return
    setActiveFeedId((current) => current ?? vlogs[0]?.id ?? null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target instanceof HTMLElement) {
          setActiveFeedId(visible.target.dataset.vlogId || null)
        }
      },
      { threshold: [0.55, 0.75], rootMargin: '-12% 0px -18%' }
    )

    vlogs.forEach((v) => {
      const node = feedRefs.current[v.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [vlogs])

  return (
    <div>
      <h2>Browse Vlogs</h2>
      {/* Browse UI will be rendered here */}
      <p>Search: {search}</p>
      <p>Vibe: {vibe}</p>
      <p>Country: {country}</p>
      <p>Budget: {budget}</p>
      <p>Total vlogs: {vlogs.length}</p>
    </div>
  )
}
