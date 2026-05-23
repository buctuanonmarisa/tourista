'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * BROWSE MODULE
 *
 * Handles:
 * - Browsing and discovering vlogs
 * - Filtering by vibe, region, budget
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

const VIBES = [
  'Beach & islands',
  'Mountain hiking',
  'City break',
  'Adventure sports',
  'Food & culture',
  'Solo travel',
  'Family trip',
  'Road trip',
  'Backpacking',
  'Island hopping',
  'Cultural immersion',
  'Wildlife & nature',
  'Photography spots',
  'Nightlife',
  'Wellness & spa',
  'Historical sites',
]

const REGIONS = ['All regions', 'Philippines', 'Japan', 'Southeast Asia', 'Europe', 'Americas']
const BUDGETS = ['Any budget', 'Under ₱10k', '₱10k – ₱30k', 'Above ₱30k', 'Free vlogs only']

export default function Browse({ onViewDetail, onGoToProfile }: BrowseProps) {
  // ─── State ───
  const [vlogs, setVlogs] = useState<VlogCard[]>([])
  const [search, setSearch] = useState('')
  const [vibe, setVibe] = useState('All vlogs')
  const [region, setRegion] = useState('All regions')
  const [budget, setBudget] = useState('Any budget')
  const [activeFilterTab, setActiveFilterTab] = useState<'vibe' | 'region' | 'budget'>('vibe')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null)
  const feedRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ─── API Calls ───
  const fetchVlogs = useCallback(async () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (vibe !== 'All vlogs') p.set('vibe', vibe)
    if (region !== 'All regions') p.set('region', region)
    if (budget !== 'Any budget') p.set('budget', budget)
    try {
      const r = await fetch(`/api/vlogs?${p}`)
      const d = await r.json()
      if (Array.isArray(d)) setVlogs(d)
    } catch {
      /* ignore */
    }
  }, [search, vibe, region, budget])

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
      <p>Region: {region}</p>
      <p>Budget: {budget}</p>
      <p>Total vlogs: {vlogs.length}</p>
    </div>
  )
}
