'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ─── Types ──────────────────────────────────────────── */
interface VlogAuthor {
  id: string; handle: string; initials: string; avatarColor: string
  verified: boolean; followers?: number; vlogCount?: number
}
interface ItineraryDay {
  id: string; day: number; activity: string; cost?: number | null
  description?: string | null; clipDuration?: string | null
  clipDescription?: string | null; locked: boolean
}
interface Review {
  id: string; authorName: string; rating: number; text: string; createdAt: string
}
interface VlogCard {
  id: string; title: string; location: string; cost?: number | null
  currency: string; rating: number; views: number; likes: number
  credits: number; thumbnailColor: string; trending: boolean; author: VlogAuthor
  description?: string | null; youtubeUrl?: string | null; facebookUrl?: string | null
  tiktokUrl?: string | null; instagramUrl?: string | null; duration?: number | null
}
interface VlogDetail extends VlogCard {
  country: string; region: string; vibe: string; duration?: number | null
  description?: string | null; youtubeUrl?: string | null; facebookUrl?: string | null
  tiktokUrl?: string | null; instagramUrl?: string | null; ratingCount: number
  itinerary: ItineraryDay[]; reviews: Review[]
}
interface UserProfile {
  id: string; handle: string; name: string; bio?: string | null; tagline?: string | null
  initials: string; avatarColor: string; country?: string | null; travelStyle?: string | null
  verified: boolean; followers: number; vlogCount: number; avgRating: number
  totalViews: number; credits: number; earnings: number
  youtubeUrl?: string | null; instagramUrl?: string | null; tiktokUrl?: string | null
}
interface ItineraryFormDay {
  day: number; activity: string; cost: string; locked: boolean
  mediaUrl?: string; mediaType?: 'image' | 'video' | null
  highlights?: string; foodTips?: string; gettingThere?: string; tips?: string
  expanded?: boolean
}
interface SavedDraft {
  id: string; savedAt: number; title: string
  data: { videoUrl: string; altLinks: { fb: string; tt: string; ig: string }; postForm: typeof defaultPostForm; itinDays: ItineraryFormDay[]; postStep: number }
}
const defaultPostForm = { title: '', description: '', country: 'Philippines', city: '', cost: '', duration: '', vibe: '', credits: 2, coverImage: '' }
const defaultItinDays: ItineraryFormDay[] = [
  { day: 1, activity: '', cost: '', locked: false, expanded: false },
  { day: 2, activity: '', cost: '', locked: false, expanded: false },
  { day: 3, activity: '', cost: '', locked: true, expanded: false },
]

const VIBES = ['Beach & islands','Mountain hiking','City break','Budget travel','Luxury travel','Adventure sports','Food & culture','Solo travel','Family trip','Road trip','Backpacking','Island hopping','Cultural immersion','Wildlife & nature','Photography spots','Nightlife','Wellness & spa','Historical sites']
const REGIONS = ['All regions','Philippines','Japan','Southeast Asia','Europe','Americas']
const BUDGETS = ['Any budget','Under ₱10k','₱10k – ₱30k','Above ₱30k','Free vlogs only']

export default function Home() {
  /* ─── Navigation ─── */
  const [page, setPage] = useState('browse')
  const [prev, setPrev] = useState('browse')

  /* ─── Browse filters ─── */
  const [search, setSearch] = useState('')
  const [vibe, setVibe] = useState('All vlogs')
  const [region, setRegion] = useState('All regions')
  const [budget, setBudget] = useState('Any budget')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null)
  const feedRefs = useRef<Record<string, HTMLDivElement | null>>({})

  /* ─── Data ─── */
  const [vlogs, setVlogs] = useState<VlogCard[]>([])
  const [myVlogs, setMyVlogs] = useState<VlogCard[]>([])
  const [vlog, setVlog] = useState<VlogDetail | null>(null)
  const [vlogLoading, setVlogLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  /* ─── Detail UI ─── */
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  /* ─── Post form ─── */
  const [postStep, setPostStep] = useState(1)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDetected, setVideoDetected] = useState('')
  const [showAltLinks, setShowAltLinks] = useState(false)
  const [altLinks, setAltLinks] = useState({ fb: '', tt: '', ig: '' })
  const [postForm, setPostForm] = useState({ ...defaultPostForm })
  const [itinDays, setItinDays] = useState<ItineraryFormDay[]>(defaultItinDays.map(d => ({ ...d })))
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [dayUploading, setDayUploading] = useState<Record<number, boolean>>({})
  const [postView, setPostView] = useState<'form' | 'drafts'>('form')
  const [vibeInput, setVibeInput] = useState('')
  const [vibeFocused, setVibeFocused] = useState(false)
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try { return JSON.parse(localStorage.getItem('tourista_drafts') || '[]') } catch { return [] }
  })
  const [pinnedVlogIds, setPinnedVlogIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('tourista_pinned') || '[]')) } catch { return new Set() }
  })

  /* ─── Profile form ─── */
  const [pForm, setPForm] = useState({
    name: '', tagline: '', bio: '', country: 'Philippines',
    travelStyle: 'Budget', youtubeUrl: '', instagramUrl: '', tiktokUrl: '',
  })

  /* ─── Notifications ─── */
  const [nCnt, setNCnt] = useState(4)
  const [readN, setReadN] = useState<Set<string>>(new Set())

  /* ─── Refs for file inputs ─── */
  const coverRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  /* ══════════════════════════════════════════
     API helpers
  ══════════════════════════════════════════ */
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
    } catch { /* ignore */ }
  }, [search, vibe, region, budget])

  const fetchMyVlogs = useCallback(async () => {
    try {
      const r = await fetch('/api/vlogs?mine=true')
      const d = await r.json()
      if (Array.isArray(d)) setMyVlogs(d)
    } catch { /* ignore */ }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/profile')
      if (!r.ok) return
      const d: UserProfile = await r.json()
      setProfile(d)
      setPForm({
        name: d.name || '', tagline: d.tagline || '', bio: d.bio || '',
        country: d.country || 'Philippines', travelStyle: d.travelStyle || 'Budget',
        youtubeUrl: d.youtubeUrl || '', instagramUrl: d.instagramUrl || '', tiktokUrl: d.tiktokUrl || '',
      })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchVlogs() }, [fetchVlogs])
  useEffect(() => { fetchMyVlogs() }, [fetchMyVlogs])
  useEffect(() => { fetchProfile() }, [fetchProfile])
  useEffect(() => {
    if (!vlogs.length) return
    setActiveFeedId(current => current ?? vlogs[0]?.id ?? null)

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible?.target instanceof HTMLElement) {
        setActiveFeedId(visible.target.dataset.vlogId || null)
      }
    }, { threshold: [0.55, 0.75], rootMargin: '-12% 0px -18%' })

    vlogs.forEach(v => {
      const node = feedRefs.current[v.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [vlogs])

  /* ══════════════════════════════════════════
     Navigation
  ══════════════════════════════════════════ */
  const go = (p: string) => { setPrev(page); setPage(p) }
  const closeT = () => setPage('browse')

  const openD = async (from: string, vlogId?: string) => {
    setPrev(from); setPage('detail'); setUnlocked(false); setReviewText('')
    if (!vlogId) return
    setVlogLoading(true)
    try {
      const r = await fetch(`/api/vlogs/${vlogId}`)
      const d: VlogDetail = await r.json()
      setVlog(d); setLikeCount(d.likes); setLiked(false)
    } finally { setVlogLoading(false) }
  }

  /* ══════════════════════════════════════════
     Video embed
  ══════════════════════════════════════════ */
  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?controls=1&rel=0`
    return null
  }
  const getFeedEmbedUrl = (v: VlogCard) => {
    const base = v.youtubeUrl ? getEmbedUrl(v.youtubeUrl) : null
    return base ? `${base}&autoplay=1&mute=1&playsinline=1` : null
  }

  const detectVideo = (url: string) => {
    setVideoUrl(url)
    if (!url) { setVideoDetected(''); return }
    if (url.includes('youtube') || url.includes('youtu.be')) setVideoDetected('YouTube link detected ✓')
    else if (url.includes('facebook') || url.includes('fb.com')) setVideoDetected('Facebook link detected ✓')
    else if (url.includes('tiktok')) setVideoDetected('TikTok link detected ✓')
    else if (url.includes('instagram')) setVideoDetected('Instagram link detected ✓')
    else setVideoDetected('')
  }

  /* ══════════════════════════════════════════
     Detail interactions
  ══════════════════════════════════════════ */
  const tLike = async () => {
    if (!vlog) return
    const next = !liked; setLiked(next); setLikeCount(c => next ? c + 1 : c - 1)
    await fetch(`/api/vlogs/${vlog.id}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: next }),
    })
  }

  const doUnlock = async () => {
    if (!vlog) return
    await fetch(`/api/vlogs/${vlog.id}/unlock`, { method: 'POST' })
    setUnlocked(true)
  }

  const submitReview = async () => {
    if (!vlog || !reviewText.trim()) return
    const r = await fetch(`/api/vlogs/${vlog.id}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: profile?.name || 'You', rating: 5, text: reviewText }),
    })
    const nr: Review = await r.json()
    setVlog(v => v ? { ...v, reviews: [nr, ...v.reviews] } : v)
    setReviewText('')
  }

  const tFollow = (id: string) => setFollowStates(p => ({ ...p, [id]: !p[id] }))

  /* ══════════════════════════════════════════
     Post vlog
  ══════════════════════════════════════════ */
  const isValidNumber = (s: string) => {
    if (!s.trim()) return true
    const cleaned = s.replace(/[₱$,\s]/g, '').replace(/\s*(days?|nights?|weeks?)\s*$/i, '')
    return /^\d+(\.\d{1,2})?$/.test(cleaned)
  }

  const nextStep = () => {
    setPublishError('')
    if (postStep === 1) {
      if (!videoUrl.trim()) { setPublishError('Please add a video link (YouTube, Facebook, TikTok, or Instagram).'); return }
      if (!postForm.title.trim()) { setPublishError('Please add a vlog title.'); return }
      if (postForm.cost && !isValidNumber(postForm.cost)) { setPublishError('Total cost must be a valid number (e.g. 12500 or ₱12,500).'); return }
      if (postForm.duration && !isValidNumber(postForm.duration)) { setPublishError('Duration must be a valid number (e.g. 7 or "7 days").'); return }
    }
    if (postStep === 2) {
      const hasDay = itinDays.some(d =>
        d.activity.trim() || d.highlights?.trim() || d.foodTips?.trim() || d.gettingThere?.trim() || d.tips?.trim()
      )
      if (!hasDay) { setPublishError('Please fill in at least one itinerary day.'); return }
    }
    if (postStep === 3) { publishVlog(); return }
    setPostStep(s => s + 1)
  }
  const prevStepFn = () => {
    setPublishError('')
    if (postStep === 1) { go('browse'); return }
    setPostStep(s => s - 1)
  }

  const addDay = () => {
    const n = itinDays.length + 1
    setItinDays(d => [...d, { day: n, activity: '', cost: '', locked: n > 2, expanded: false }])
  }

  const updDay = (i: number, k: keyof ItineraryFormDay, v: string | boolean | null) =>
    setItinDays(d => d.map((x, j) => j === i ? { ...x, [k]: v } : x))

  const handleDayMedia = async (i: number, file: File) => {
    const isVideo = file.type.startsWith('video/')
    const localUrl = URL.createObjectURL(file)
    updDay(i, 'mediaUrl', localUrl)
    updDay(i, 'mediaType', isVideo ? 'video' : 'image')
    setDayUploading(p => ({ ...p, [i]: true }))
    try {
      const url = await handleUpload(file)
      updDay(i, 'mediaUrl', url)
      URL.revokeObjectURL(localUrl)
    } catch {
      updDay(i, 'mediaUrl', '')
      updDay(i, 'mediaType', null)
      URL.revokeObjectURL(localUrl)
    } finally {
      setDayUploading(p => ({ ...p, [i]: false }))
    }
  }

  const publishVlog = async () => {
    setPublishing(true); setPublishError('')
    try {
      const isYt = videoUrl.includes('youtube') || videoUrl.includes('youtu.be')
      const isFb = videoUrl.includes('facebook') || videoUrl.includes('fb.com')
      const isTt = videoUrl.includes('tiktok')
      const isIg = videoUrl.includes('instagram')
      const filledDays = itinDays.filter(d =>
        d.activity.trim() || d.highlights?.trim() || d.foodTips?.trim() || d.gettingThere?.trim() || d.tips?.trim()
      )
      const r = await fetch('/api/vlogs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postForm,
          youtubeUrl: isYt ? videoUrl : (altLinks.fb.includes('youtube') || altLinks.fb.includes('youtu.be') ? altLinks.fb : null),
          facebookUrl: isFb ? videoUrl : (altLinks.fb.includes('facebook') || altLinks.fb.includes('fb.com') ? altLinks.fb : null),
          tiktokUrl: isTt ? videoUrl : (altLinks.tt || null),
          instagramUrl: isIg ? videoUrl : (altLinks.ig || null),
          itinerary: filledDays,
        }),
      })
      if (!r.ok) { const e = await r.json().catch(() => ({})); setPublishError(e.error || 'Failed to publish. Please try again.'); return }
      fetchVlogs()
      fetchMyVlogs()
      setPostForm({ ...defaultPostForm })
      setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' }); setPostStep(1)
      setVibeInput(''); setVibeFocused(false)
      setItinDays(defaultItinDays.map(d => ({ ...d })))
      go('dashboard')
    } catch { setPublishError('Network error. Please try again.')
    } finally { setPublishing(false) }
  }

  const saveDraft = () => {
    try {
      const existing: SavedDraft[] = JSON.parse(localStorage.getItem('tourista_drafts') || '[]')
      const newDraft: SavedDraft = {
        id: Date.now().toString(36),
        savedAt: Date.now(),
        title: postForm.title.trim() || 'Untitled draft',
        data: { videoUrl, altLinks, postForm, itinDays, postStep },
      }
      const updated = [newDraft, ...existing].slice(0, 10)
      localStorage.setItem('tourista_drafts', JSON.stringify(updated))
      setDrafts(updated)
      setPostView('drafts')
    } catch { /* storage unavailable */ }
  }

  const loadDraftById = (id: string) => {
    const draft = drafts.find(d => d.id === id)
    if (!draft) return
    const d = draft.data
    setVideoUrl(d.videoUrl || '')
    setAltLinks(d.altLinks || { fb: '', tt: '', ig: '' })
    setPostForm(d.postForm || { ...defaultPostForm })
    setItinDays(d.itinDays || defaultItinDays.map(x => ({ ...x })))
    setPostStep(d.postStep || 1)
    setPublishError('')
    setPostView('form')
  }

  const deleteDraft = (id: string) => {
    try {
      const updated = drafts.filter(d => d.id !== id)
      localStorage.setItem('tourista_drafts', JSON.stringify(updated))
      setDrafts(updated)
    } catch { /* ignore */ }
  }

  const togglePin = (vlogId: string) => {
    setPinnedVlogIds(prev => {
      const next = new Set(prev)
      if (next.has(vlogId)) next.delete(vlogId); else next.add(vlogId)
      try { localStorage.setItem('tourista_pinned', JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  const fmtDraftAge = (savedAt: number) => {
    const diff = Date.now() - savedAt
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  /* ══════════════════════════════════════════
     Profile edit
  ══════════════════════════════════════════ */
  const saveProfile = async () => {
    await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pForm),
    })
    await fetchProfile(); go('profile')
  }

  const handleUpload = async (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!r.ok) throw new Error('Upload failed')
    return (await r.json()).url as string
  }

  const handleCoverUpload = async (file: File) => {
    const localUrl = URL.createObjectURL(file)
    setPostForm(p => ({ ...p, coverImage: localUrl }))
    setCoverUploading(true)
    try {
      const url = await handleUpload(file)
      setPostForm(p => ({ ...p, coverImage: url }))
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000)
    } catch {
      setPublishError('Cover photo upload failed. Please try again.')
    } finally {
      setCoverUploading(false)
    }
  }

  /* ══════════════════════════════════════════
     Notifications
  ══════════════════════════════════════════ */
  const rdN = (id: string) => {
    if (readN.has(id)) return
    setReadN(s => new Set([...s, id])); setNCnt(n => Math.max(0, n - 1))
  }
  const clrAll = () => { setReadN(new Set(['n1','n2','n3','n4'])); setNCnt(0) }

  /* ══════════════════════════════════════════
     Helpers
  ══════════════════════════════════════════ */
  const fmtCost = (cost?: number | null, cur?: string) => {
    if (!cost) return ''
    return cur === 'JPY' ? `¥${cost.toLocaleString()}` : `₱${cost.toLocaleString()}`
  }
  const activeFilters = [vibe !== 'All vlogs' ? vibe : '', region !== 'All regions' ? region : '', budget !== 'Any budget' ? budget : ''].filter(Boolean)
  const embedUrl = vlog?.youtubeUrl ? getEmbedUrl(vlog.youtubeUrl) : null
  const updCr = (v: number) => {
    setPostForm(f => ({ ...f, credits: v }))
  }

  /* ══════════════════════════════════════════
     Step indicator helper
  ══════════════════════════════════════════ */
  const stepDot = (n: number) => {
    if (n < postStep) return 'sd dn'
    if (n === postStep) return 'sd ac'
    return 'sd'
  }
  const stepLbl = (n: number) => n === postStep ? 'sl2 ac' : 'sl2'
  const stepLine = (n: number) => n < postStep ? 'sln dn' : 'sln'

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <h2 className="sr-only">Tourista — travel vlog portal</h2>

      {/* ── NEW TOP NAVIGATION BAR ───────────────────────────────── */}
      <div className="topnav">
        <div className="topnav-inner">
          {/* Logo */}
          <div className="tn-logo" onClick={() => go('browse')}>
            <svg width="24" height="28" viewBox="0 0 80 90" fill="none">
              <path d="M40 8C24 8 14 20 14 34c0 18 26 46 26 46S66 52 66 34C66 20 56 8 40 8z" fill="#5dba7a" stroke="#2A7A50" strokeWidth="2.5"/>
              <polygon points="40,18 50,25 50,39 40,46 30,39 30,25" fill="rgba(255,255,255,.2)" stroke="#2A7A50" strokeWidth="1.2"/>
              <path d="M40 18v28M30 25h20M30 39h20" stroke="#2A7A50" strokeWidth="1" opacity=".4"/>
              <path d="M52 11Q64 4 61 16Q56 18 51 16Z" fill="#4aaa62" stroke="#2A7A50" strokeWidth="1.8"/>
              <circle cx="59" cy="10" r="2" fill="#2A7A50"/>
            </svg>
            <div className="tn-logo-t">Tourista</div>
          </div>

          {/* Search Bar */}
          <div className="tn-search">
            <div className="tn-search-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input type="text" placeholder="Search destinations, vloggers..." value={search}
              onChange={e => setSearch(e.target.value)}/>
            {search && (
              <button className="tn-search-clear" onClick={() => setSearch('')}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="tn-actions">
            <button className="tn-btn" onClick={() => go('notif')} aria-label="Notifications">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="tn-btn-label">Notifications</span>
              {nCnt > 0 && <span className="tn-dot"/>}
            </button>
            <button className="tn-btn" onClick={() => go('dashboard')} aria-label="Dashboard">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              <span className="tn-btn-label">Dashboard</span>
            </button>
            <button className="tn-btn tn-post" onClick={() => {
              setPostForm({ ...defaultPostForm })
              setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' })
              setItinDays(defaultItinDays.map(d => ({ ...d }))); setPostStep(1); setPublishError('')
              setVibeInput(''); setVibeFocused(false)
              setPostView('form')
              go('post')
            }}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="tn-btn-label">Post vlog</span>
            </button>
            <button className="tn-avatar" onClick={() => go('profile')} title="Profile">{profile?.initials || 'M'}</button>
          </div>
        </div>
      </div>

      {/* Old navigation hidden - using new topnav instead */}

      {/* ── FILTER BAR ───────────────────────────────── */}
      {page === 'browse' && (
        <div className="filterbar">
          <div className="filterbar-inner">
            <div className="fb-tabs">
              <button className={`fb-tab${vibe === 'All vlogs' ? '' : ' on'}`} onClick={() => setVibe('All vlogs')}>
                Vibe {vibe !== 'All vlogs' && <span className="fb-tab-count">{vibe}</span>}
              </button>
              <button className={`fb-tab${region === 'All regions' ? '' : ' on'}`} onClick={() => setRegion('All regions')}>
                Region {region !== 'All regions' && <span className="fb-tab-count">{region}</span>}
              </button>
              <button className={`fb-tab${budget === 'Any budget' ? '' : ' on'}`} onClick={() => setBudget('Any budget')}>
                Budget {budget !== 'Any budget' && <span className="fb-tab-count">{budget}</span>}
              </button>
            </div>
          </div>

          {/* Filter chips - always show for current active category */}
          <div className="filterbar-inner">
            <div className="fb-chips">
              {vibe === 'All vlogs' ? (
                <>
                  {VIBES.map(v => (
                    <span key={v} className={`fb-chip${vibe === v ? ' on' : ''}`} onClick={() => setVibe(v)}>
                      {v}
                    </span>
                  ))}
                </>
              ) : region === 'All regions' ? (
                <>
                  {REGIONS.map(r => (
                    <span key={r} className={`fb-chip${region === r ? ' on' : ''}`} onClick={() => setRegion(r)}>
                      {r}
                    </span>
                  ))}
                </>
              ) : budget === 'Any budget' ? (
                <>
                  {BUDGETS.map(b => (
                    <span key={b} className={`fb-chip${budget === b ? ' on' : ''}`} onClick={() => setBudget(b)}>
                      {b}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {VIBES.map(v => (
                    <span key={v} className={`fb-chip${vibe === v ? ' on' : ''}`} onClick={() => setVibe(v)}>
                      {v}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BROWSE - GOOGLE IMAGES STYLE
      ══════════════════════════════════════ */}
      {page === 'browse' && (
        <div className="tn-page">
          <div className={`gi-layout${vlog && activeFeedId ? ' with-panel' : ''}`}>
            {/* Vlog Grid */}
            {vlogs.length === 0 ? (
              <div className="vl-empty">No vlogs found — try adjusting your filters.</div>
            ) : (
              <div className="gi-grid">
                {vlogs.map(v => {
                  const isActive = activeFeedId === v.id
                  const feedEmbed = isActive ? getFeedEmbedUrl(v) : null
                  return (
                    <div
                      key={v.id}
                      className={`gi-card${isActive ? ' on' : ''}`}
                      data-vlog-id={v.id}
                      ref={node => { feedRefs.current[v.id] = node }}
                      onClick={() => openD('browse', v.id)}
                    >
                      <div className={`gi-thumb ${v.thumbnailColor}`}>
                        {feedEmbed ? (
                          <iframe src={feedEmbed} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={v.title}/>
                        ) : (
                          <>
                            <div className="gi-thumb-play">
                              <div className="gi-thumb-play-btn">
                                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </div>
                            </div>
                          </>
                        )}
                        {v.credits > 0 && <div className="gi-cred-badge">✦ {v.credits}</div>}
                      </div>
                      <div className="gi-title">{v.title}</div>
                      <div className="gi-info">
                        <div className={`gi-info-avatar av ${v.author.avatarColor}`}>{v.author.initials}</div>
                        <div className="gi-info-handle">{v.author.handle}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Detail Panel (right side on desktop, bottom sheet on mobile) */}
            {vlog && activeFeedId && (
              <div className="gi-panel">
                <div className="gi-panel-header">
                  <div className="gi-panel-source">
                    <div className={`gi-panel-source-icon av ${vlog.author.avatarColor}`}>{vlog.author.initials}</div>
                    <div className="gi-panel-handle">{vlog.author.handle}</div>
                  </div>
                  <div className="gi-panel-nav">
                    <button className="gi-panel-navbtn" title="Previous">
                      <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="gi-panel-navbtn" title="Next">
                      <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <button className="gi-panel-close" onClick={() => setActiveFeedId(null)}>×</button>
                </div>
                <div className="gi-panel-body">
                  {/* Media */}
                  <div className="gi-panel-media">
                    {embedUrl ? (
                      <iframe src={embedUrl} width="100%" height="100%" allowFullScreen title={vlog.title}/>
                    ) : (
                      <>
                        <div style={{ position:'absolute', fontSize:'11px', background:'rgba(0,0,0,.6)', color:'#fff', padding:'4px 8px', borderRadius:'4px' }}>Preview</div>
                        <svg viewBox="0 0 24 24" width="40" height="40" style={{ stroke:'rgba(255,255,255,.6)', fill:'none', strokeWidth:1.5 }}>
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </>
                    )}
                    <button className="gi-panel-zoom" title="Expand">
                      <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </button>
                  </div>

                  {/* Title & Meta */}
                  <div className="gi-panel-title">{vlog.title}</div>
                  <div className="gi-panel-meta">
                    <span>📍 {vlog.location}</span>
                    {vlog.cost && <span>💰 {fmtCost(vlog.cost, vlog.currency)}</span>}
                    <span>⭐ {vlog.rating}</span>
                    {vlog.duration && <span>📅 {vlog.duration} days</span>}
                  </div>

                  {/* Description */}
                  {vlog.description && <div className="gi-panel-copy">{vlog.description}</div>}

                  {/* Actions */}
                  <div className="gi-panel-actions">
                    <button className="gi-panel-btn gi-panel-btn-primary" onClick={tLike}>
                      <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {likeCount}
                    </button>
                    <button className="gi-panel-btn gi-panel-btn-secondary">
                      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {vlog.reviews.length}
                    </button>
                  </div>

                  {/* Unlock Box */}
                  {vlog.credits > 0 && !unlocked && (
                    <div style={{ padding:'12px', background:'var(--yl)', borderRadius:'10px', marginBottom:'14px' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'var(--y1)', marginBottom:'6px' }}>Unlock itinerary</div>
                      <div style={{ fontSize:'12px', color:'var(--y1)', marginBottom:'8px', opacity:0.8 }}>{vlog.credits} credits · ₱{vlog.credits * 10}</div>
                      <button className="gi-panel-btn gi-panel-btn-primary" onClick={doUnlock} style={{ background:'var(--y)', color:'var(--y1)', fontSize:'12px', padding:'8px' }}>
                        Unlock
                      </button>
                    </div>
                  )}

                  {/* More from creator */}
                  {myVlogs.length > 1 && (
                    <div className="gi-panel-more">
                      <div className="gi-panel-more-lbl">More from {vlog.author.handle}</div>
                      <div className="gi-panel-more-grid">
                        {myVlogs.slice(0, 3).map(v => (
                          <div key={v.id} className="gi-panel-more-card" onClick={() => openD('browse', v.id)}>
                            <div className={`gi-thumb ${v.thumbnailColor}`}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DETAIL
      ══════════════════════════════════════ */}
      {page === 'detail' && (
        <div className="page on">
          <div className="w">
            <div className="bk" onClick={() => go(prev)}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Back to {prev === 'profile' ? 'Profile' : prev === 'dashboard' ? 'Dashboard' : 'Explore'}
            </div>

            {vlogLoading ? (
              <div className="loading">
                <span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/>
              </div>
            ) : vlog ? (
              <>
                {/* Video */}
                <div className="vbox">
                  <div className={`vpl ${vlog.thumbnailColor}`}>
                    {embedUrl ? (
                      <iframe src={embedUrl} width="100%" height="100%" allowFullScreen title={vlog.title}/>
                    ) : (
                      <>
                        <div className="vbadge">Preview</div>
                        <div className="vpbig"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      </>
                    )}
                  </div>
                  <div className="won">
                    <span>Watch on:</span>
                    {vlog.youtubeUrl ? (
                      <a href={vlog.youtubeUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#f00' }}/> YouTube ↗
                      </a>
                    ) : <div className="pp"><span className="pdot" style={{ background:'#f00' }}/> YouTube ↗</div>}
                    {vlog.facebookUrl ? (
                      <a href={vlog.facebookUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#1877f2' }}/> Facebook ↗
                      </a>
                    ) : <div className="pp"><span className="pdot" style={{ background:'#1877f2' }}/> Facebook ↗</div>}
                    <div className="pp"><span className="pdot" style={{ background:'#111' }}/> TikTok ↗</div>
                    <span style={{ fontSize:'11px', color:'var(--color-text-secondary)' }}>Same vlog · pick your platform</span>
                  </div>
                </div>

                {/* Title + author */}
                <div className="dtt">{vlog.title}</div>
                <div className="dvl" onClick={() => go('profile')}>
                  <div className={`av ${vlog.author.avatarColor}`} style={{ width:'34px', height:'34px', fontSize:'11px' }}>{vlog.author.initials}</div>
                  <div>
                    <div className="dvln">{vlog.author.handle} {vlog.author.verified && <span className="bx bf" style={{ fontSize:'10px' }}>✓ Verified</span>}</div>
                    <div className="dvls">{vlog.author.vlogCount} vlogs · {((vlog.author.followers || 0) / 1000).toFixed(1)}k followers</div>
                  </div>
                  <button className={`fbtn${followStates[vlog.author.id] ? ' fol' : ''}`}
                    onClick={e => { e.stopPropagation(); tFollow(vlog.author.id) }}>
                    {followStates[vlog.author.id] ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Stats */}
                <div className="s4">
                  <div className="sb"><div className="sv">{fmtCost(vlog.cost, vlog.currency) || '—'}</div><div className="sl">Total cost</div></div>
                  <div className="sb"><div className="sv">{vlog.duration ? `${vlog.duration} days` : '—'}</div><div className="sl">Duration</div></div>
                  <div className="sb"><div className="sv">★ {vlog.rating}</div><div className="sl">Rating</div></div>
                  <div className="sb"><div className="sv">{vlog.views >= 1000 ? `${(vlog.views/1000).toFixed(1)}k` : vlog.views}</div><div className="sl">Views</div></div>
                </div>

                {vlog.description && <div className="dd">{vlog.description}</div>}

                {/* Engagement */}
                <div className="eng">
                  <button className={`eb${liked ? ' lk' : ''}`} onClick={tLike}>
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {likeCount}
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {vlog.reviews.length}
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    Save
                  </button>
                </div>

                {/* Unlock box */}
                {vlog.credits > 0 && (
                  <div className="ulb" id="ulb">
                    {unlocked ? (
                      <div style={{ display:'flex', alignItems:'center', gap:'9px', color:'var(--g)', fontSize:'14px', fontWeight:500 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Full itinerary unlocked — enjoy your trip!
                      </div>
                    ) : (
                      <>
                        <div className="ulh">
                          <div className="uln">Unlock full itinerary</div>
                          <div className="ulp">{vlog.credits} {vlog.credits === 1 ? 'credit' : 'credits'}</div>
                        </div>
                        <div className="uld">
                          Get all locked days with costs, descriptions, booking contacts &amp; exclusive clips from {vlog.author.handle}.
                        </div>
                        <button className="ulc" onClick={doUnlock}>
                          Unlock for {vlog.credits} {vlog.credits === 1 ? 'credit' : 'credits'} — ₱{vlog.credits * 10}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Itinerary */}
                {vlog.itinerary.length > 0 && (
                  <>
                    <div className="slbl" style={{ marginBottom:'12px' }}>Day-by-day itinerary</div>
                    {vlog.itinerary.map(day => (
                      <div key={day.id} className="id" style={{ opacity: day.locked && !unlocked ? 0.45 : 1 }}>
                        <div className="ir1">
                          <div className="iday" style={{ color: day.locked && !unlocked ? 'var(--color-text-secondary)' : 'var(--g)' }}>
                            Day {day.day}
                          </div>
                          <div className="inn">{day.activity}</div>
                          {(day.cost && (!day.locked || unlocked)) && (
                            <div className="ico"><span className="ico-lbl">Cost</span> ₱{day.cost.toLocaleString()}</div>
                          )}
                        </div>
                        {day.locked && !unlocked ? (
                          <div className="ilk">
                            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Unlock to see cost, description &amp; clip
                          </div>
                        ) : (
                          <>
                            {day.description && <div className="idc">{day.description}</div>}
                            {day.clipDuration && (
                              <div className="iclr">
                                <div className={`icth ${vlog.thumbnailColor}`}>
                                  <div className="icp"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                                </div>
                                <span className="iclbl">{day.clipDuration} clip — {day.clipDescription}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Reviews */}
                <div className="rlbl">Reviews ({vlog.ratingCount})</div>
                {vlog.reviews.map(r => (
                  <div key={r.id} className="ri">
                    <div className="rh">
                      <div className="av ag" style={{ width:'26px', height:'26px', fontSize:'9px' }}>
                        {r.authorName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="rn">{r.authorName}</div>
                      <div className="rs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <div className="rt">{new Date(r.createdAt).toLocaleDateString('en', { month:'short', day:'numeric' })}</div>
                    </div>
                    <div className="rtx">{r.text}</div>
                  </div>
                ))}
                <div className="rir">
                  <input className="rin" type="text" placeholder="Share your experience..."
                    value={reviewText} onChange={e => setReviewText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitReview()}/>
                  <button className="rsb" onClick={submitReview}>Post</button>
                </div>
              </>
            ) : (
              <div className="loading">Vlog not found.</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PROFILE
      ══════════════════════════════════════ */}
      {page === 'profile' && (
        <div className="page on">
          <div className="w" style={{ paddingTop:0 }}>
            <div style={{ border:'1px solid var(--color-border-tertiary)', borderRadius:'14px', overflow:'hidden', marginTop:'20px' }}>
              <div className="pcv" style={{ background:'linear-gradient(135deg,var(--g1),var(--g))' }}>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px', opacity:.08 }}>🌿</div>
              </div>
              <div className="pbar">
                <div className="pavw"><div className="pavi">{profile?.initials || 'M'}</div></div>
                <div style={{ flex:1, paddingBottom:'2px' }}>
                  <div className="pn">{profile?.name || 'MarisolRoams'}</div>
                  <div className="ps">
                    {profile?.verified && '✓ Verified · '}
                    {profile?.country} · {((profile?.followers || 0)/1000).toFixed(1)}k followers
                  </div>
                </div>
                <div className="pac">
                  <button className="edbtn" onClick={() => go('edit')}>
                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit profile
                  </button>
                  <button className={`fbtn${followStates['pf'] ? ' fol' : ''}`} onClick={() => tFollow('pf')}>
                    {followStates['pf'] ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
              <div className="ptbs">
                <div className="pt on">Vlogs</div>
                <div className="pt">About</div>
                <div className="pt">Reviews</div>
              </div>
              <div className="pstats">
                <div className="pst"><div className="psv">{profile?.vlogCount || 48}</div><div className="psl">Vlogs</div></div>
                <div className="pst"><div className="psv">{profile?.avgRating || 4.8}</div><div className="psl">Avg rating</div></div>
                <div className="pst"><div className="psv">{((profile?.totalViews || 38000)/1000).toFixed(0)}k</div><div className="psl">Views</div></div>
                <div className="pst"><div className="psv">{profile?.credits || 432}</div><div className="psl">Credits</div></div>
              </div>
              {pinnedVlogIds.size > 0 && (
                <div style={{ padding:'12px 16px 0' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'var(--g)', letterSpacing:'.04em', marginBottom:'8px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--g)" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                    PINNED
                  </div>
                  <div className="vg" style={{ marginBottom:'0' }}>
                    {vlogs.filter(v => pinnedVlogIds.has(v.id)).map((v) => (
                      <div key={v.id} className="vgc" style={{ position:'relative', outline:'2px solid var(--g)', outlineOffset:'-2px', borderRadius:'12px' }} onClick={() => openD('profile', v.id)}>
                        <div className={`vgth ${v.thumbnailColor}`}>
                          <div className="vp"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                        </div>
                        <div className="vgi">
                          <div className="vgn">{v.title.length > 28 ? v.title.slice(0,28)+'…' : v.title}</div>
                          <div className="vgm">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `✦ ${v.credits} credits` : '✓ Free'}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); togglePin(v.id) }}
                          style={{ position:'absolute', top:'6px', right:'6px', background:'var(--g)', border:'none', borderRadius:'6px', width:'22px', height:'22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                          title="Unpin">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: pinnedVlogIds.size > 0 ? '10px 16px 0' : '0' }}>
                {pinnedVlogIds.size > 0 && (
                  <div style={{ fontSize:'12px', fontWeight:700, color:'var(--color-text-secondary)', letterSpacing:'.04em', marginBottom:'8px' }}>ALL VLOGS</div>
                )}
              </div>
              <div className="vg">
                {vlogs.slice(0,4).map((v) => (
                  <div key={v.id} className="vgc" style={{ position:'relative' }} onClick={() => openD('profile', v.id)}>
                    <div className={`vgth ${v.thumbnailColor}`}>
                      <div className="vp"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                    </div>
                    <div className="vgi">
                      <div className="vgn">{v.title.length > 28 ? v.title.slice(0,28)+'…' : v.title}</div>
                      <div className="vgm">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `✦ ${v.credits} credits` : '✓ Free'}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togglePin(v.id) }}
                      style={{ position:'absolute', top:'6px', right:'6px', background: pinnedVlogIds.has(v.id) ? 'var(--g)' : 'rgba(0,0,0,.32)', border:'none', borderRadius:'6px', width:'22px', height:'22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: pinnedVlogIds.has(v.id) ? 1 : 0, transition:'opacity .15s' }}
                      className="pin-btn"
                      title={pinnedVlogIds.has(v.id) ? 'Unpin' : 'Pin to profile'}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          EDIT PROFILE
      ══════════════════════════════════════ */}
      {page === 'edit' && (
        <div className="page on">
          <div className="w">
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'4px' }}>Edit profile</div>
            <div style={{ fontSize:'13.5px', color:'var(--color-text-secondary)', marginBottom:'20px' }}>Update how tourists and vloggers see you</div>

            <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={async e => { if (e.target.files?.[0]) await handleUpload(e.target.files[0]) }}/>
            <div className="ecv" onClick={() => coverRef.current?.click()}>
              <div className="ecvb">Change cover photo</div>
            </div>

            <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={async e => { if (e.target.files?.[0]) await handleUpload(e.target.files[0]) }}/>
            <div className="eav">
              <div className="efav" onClick={() => avatarRef.current?.click()}>
                {profile?.initials || 'M'}
                <div className="efavc">+</div>
              </div>
              <div style={{ fontSize:'13px', color:'var(--color-text-secondary)' }}>Tap to change profile photo</div>
            </div>

            <div className="fg">
              <label>Display name</label>
              <input className="fi" type="text" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))}/>
            </div>
            <div className="fg">
              <label>Tagline</label>
              <input className="fi" type="text" value={pForm.tagline} onChange={e => setPForm(f => ({ ...f, tagline: e.target.value }))}/>
            </div>
            <div className="fg">
              <label>About you</label>
              <textarea className="fi" value={pForm.bio} onChange={e => setPForm(f => ({ ...f, bio: e.target.value }))}/>
            </div>
            <div className="fr">
              <div className="fg">
                <label>Country / base</label>
                <select className="fi" value={pForm.country} onChange={e => setPForm(f => ({ ...f, country: e.target.value }))}>
                  <option>Philippines</option><option>Japan</option><option>Vietnam</option><option>Thailand</option>
                </select>
              </div>
              <div className="fg">
                <label>Travel style</label>
                <select className="fi" value={pForm.travelStyle} onChange={e => setPForm(f => ({ ...f, travelStyle: e.target.value }))}>
                  <option>Budget</option><option>Mid-range</option><option>Luxury</option>
                </select>
              </div>
            </div>
            <div className="fg">
              <label>Social links (optional)</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div className="xr">
                  <span className="xd" style={{ background:'#f00' }}/>
                  <input className="xi" type="text" placeholder="YouTube channel link" value={pForm.youtubeUrl} onChange={e => setPForm(f => ({ ...f, youtubeUrl: e.target.value }))}/>
                </div>
                <div className="xr">
                  <span className="xd" style={{ background:'#e1306c' }}/>
                  <input className="xi" type="text" placeholder="Instagram profile" value={pForm.instagramUrl} onChange={e => setPForm(f => ({ ...f, instagramUrl: e.target.value }))}/>
                </div>
                <div className="xr">
                  <span className="xd" style={{ background:'#111' }}/>
                  <input className="xi" type="text" placeholder="TikTok profile" value={pForm.tiktokUrl} onChange={e => setPForm(f => ({ ...f, tiktokUrl: e.target.value }))}/>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'1px solid var(--color-border-tertiary)' }}>
              <button className="bb" onClick={() => go('profile')}>Cancel</button>
              <button className="nb" onClick={saveProfile}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          POST A VLOG
      ══════════════════════════════════════ */}
      {page === 'post' && (
        <div className="page on">
          <div className="w">

            {/* ── Drafts-only view ── */}
            {postView === 'drafts' && (
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                  <div>
                    <div style={{ fontSize:'22px', fontWeight:800, color:'var(--color-text-primary)' }}>Saved drafts</div>
                    <div style={{ fontSize:'13.5px', color:'var(--color-text-secondary)', marginTop:'2px' }}>Pick up where you left off, or start fresh.</div>
                  </div>
                  <button className="nb" onClick={() => {
                    setPostForm({ ...defaultPostForm })
                    setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' })
                    setItinDays(defaultItinDays.map(d => ({ ...d }))); setPostStep(1); setPublishError('')
                    setPostView('form')
                  }}>+ New vlog</button>
                </div>
                {drafts.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 0', color:'var(--color-text-secondary)', fontSize:'14px' }}>No saved drafts yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {drafts.map(d => (
                      <div key={d.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', border:'1px solid var(--color-border-tertiary)', borderRadius:'14px', background:'var(--color-bg-secondary)' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'14px', fontWeight:700, color:'var(--color-text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</div>
                          <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'3px' }}>Saved {fmtDraftAge(d.savedAt)}</div>
                        </div>
                        <button onClick={() => loadDraftById(d.id)}
                          style={{ flexShrink:0, padding:'7px 16px', fontSize:'13px', fontWeight:600, background:'var(--g)', color:'#fff', border:'none', borderRadius:'9px', cursor:'pointer' }}>
                          Continue
                        </button>
                        <button onClick={() => deleteDraft(d.id)}
                          style={{ flexShrink:0, width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--color-border-tertiary)', borderRadius:'9px', cursor:'pointer', color:'var(--color-text-secondary)', fontSize:'18px' }}
                          title="Delete draft">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Form view ── */}
            {postView === 'form' && <>
            <div style={{ fontSize:'24px', fontWeight:800, marginBottom:'4px', color:'var(--color-text-primary)' }}>Post a vlog</div>
            <div style={{ fontSize:'14px', color:'var(--color-text-secondary)', marginBottom:'22px' }}>Share your journey. Earn when tourists unlock your itinerary.</div>

            {/* Step indicator */}
            <div className="steps">
              <div className="si2">
                <div className={stepDot(1)}>{postStep > 1 ? '✓' : '1'}</div>
                <div className={stepLbl(1)}>Video &amp; info</div>
              </div>
              <div className={stepLine(1)}/>
              <div className="si2">
                <div className={stepDot(2)}>{postStep > 2 ? '✓' : '2'}</div>
                <div className={stepLbl(2)}>Itinerary</div>
              </div>
              <div className={stepLine(2)}/>
              <div className="si2">
                <div className={stepDot(3)}>3</div>
                <div className={stepLbl(3)}>Credits &amp; publish</div>
              </div>
            </div>

            {/* Step 1 */}
            {postStep === 1 && (
              <div>
                <div className="vlbx">
                  <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'4px', display:'flex', alignItems:'center', gap:'5px' }}>
                    Paste your video link <span className="req-star">*</span>
                  </div>
                  <div style={{ fontSize:'13px', color:'var(--g1)', lineHeight:'1.6' }}>
                    Add a link from YouTube, Facebook, TikTok, or Instagram. Tourists watch a preview here on Tourista.
                  </div>
                  <div className="vlbr">
                    <input className="vli" type="text" placeholder="e.g. https://youtube.com/watch?v=..."
                      value={videoUrl} onChange={e => detectVideo(e.target.value)}/>
                    <button className="vlbb">Add</button>
                  </div>
                  {videoDetected && (
                    <div className="detp">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      {videoDetected}
                    </div>
                  )}
                  <div className="aml" onClick={() => setShowAltLinks(s => !s)}>
                    + Add same vlog from another platform (optional)
                  </div>
                  {showAltLinks && (
                    <div className="xls on" style={{ marginTop:'9px' }}>
                      <div className="xr"><span className="xd" style={{ background:'#1877f2' }}/><input className="xi" type="text" placeholder="Facebook link (same vlog)" value={altLinks.fb} onChange={e => setAltLinks(a => ({ ...a, fb: e.target.value }))}/></div>
                      <div className="xr"><span className="xd" style={{ background:'#111' }}/><input className="xi" type="text" placeholder="TikTok link (same vlog)" value={altLinks.tt} onChange={e => setAltLinks(a => ({ ...a, tt: e.target.value }))}/></div>
                      <div className="xr"><span className="xd" style={{ background:'#e1306c' }}/><input className="xi" type="text" placeholder="Instagram Reel (same vlog)" value={altLinks.ig} onChange={e => setAltLinks(a => ({ ...a, ig: e.target.value }))}/></div>
                    </div>
                  )}
                </div>
                <div className="fg">
                  <label>Vlog title <span className="req-star">*</span></label>
                  <input className={`fi${!postForm.title.trim() && publishError ? ' err' : ''}`} type="text"
                    placeholder="e.g. Siargao in 7 days — surfing, lagoons & local eats"
                    value={postForm.title} onChange={e => { setPostForm(f => ({ ...f, title: e.target.value })); setPublishError('') }}/>
                </div>
                <div className="fg">
                  <label>Description</label>
                  <textarea className="fi" placeholder="Tell tourists what makes this trip special — highlights, vibes, who it's for..."
                    value={postForm.description} onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label>Cover photo</label>
                  {postForm.coverImage ? (
                    <div className="cover-preview">
                      <img src={postForm.coverImage} alt="Cover"
                        onError={() => setPublishError('Cover photo preview unavailable, but your photo was saved. You can continue posting.')}/>
                      {coverUploading && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.6)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', fontSize:'13px', color:'var(--g)', fontWeight:600 }}>
                          Uploading…
                        </div>
                      )}
                      <button className="cover-remove" onClick={() => setPostForm(f => ({ ...f, coverImage: '' }))}>×</button>
                    </div>
                  ) : (
                    <div className={`upload-zone${coverUploading ? ' upload-zone-uploading' : ''}`}
                      onClick={() => {
                        if (coverUploading) return
                        const inp = document.createElement('input')
                        inp.type = 'file'; inp.accept = 'image/*'
                        inp.onchange = (e) => {
                          const f = (e.target as HTMLInputElement).files?.[0]
                          if (f) handleCoverUpload(f)
                        }
                        inp.click()
                      }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <div>
                        <div style={{ fontSize:'13.5px', fontWeight:600, color:'var(--color-text-secondary)' }}>{coverUploading ? 'Uploading…' : 'Click to upload cover photo'}</div>
                        <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'2px' }}>JPG, PNG or WebP · Recommended 16:9</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="fr">
                  <div className="fg">
                    <label>Country</label>
                    <select className="fi" value={postForm.country} onChange={e => setPostForm(f => ({ ...f, country: e.target.value }))}>
                      <option>Philippines</option><option>Japan</option><option>Vietnam</option><option>Thailand</option><option>Indonesia</option><option>Other</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>City / location</label>
                    <input className="fi" type="text" placeholder="e.g. Siargao Island"
                      value={postForm.city} onChange={e => setPostForm(f => ({ ...f, city: e.target.value }))}/>
                  </div>
                </div>
                <div className="fr">
                  <div className="fg">
                    <label>Total cost</label>
                    <input className="fi" type="text" placeholder="e.g. ₱12,500"
                      value={postForm.cost} onChange={e => setPostForm(f => ({ ...f, cost: e.target.value }))}/>
                  </div>
                  <div className="fg">
                    <label>Duration</label>
                    <input className="fi" type="text" placeholder="e.g. 7 days"
                      value={postForm.duration} onChange={e => setPostForm(f => ({ ...f, duration: e.target.value }))}/>
                  </div>
                </div>
                <div className="fg">
                  <label>Vibe</label>
                  <div className="vti">
                    {postForm.vibe.split(',').filter(Boolean).map(tag => (
                      <span key={tag} className="vtag">
                        {tag}
                        <button type="button" className="vtag-x" onClick={() => {
                          const tags = postForm.vibe.split(',').filter(Boolean).filter(t => t !== tag)
                          setPostForm(f => ({ ...f, vibe: tags.join(',') }))
                        }}>×</button>
                      </span>
                    ))}
                    <div className="vti-wrap">
                      <input
                        type="text"
                        className="vti-in"
                        placeholder={postForm.vibe ? '' : 'Search vibes...'}
                        value={vibeInput}
                        onChange={e => setVibeInput(e.target.value)}
                        onFocus={() => setVibeFocused(true)}
                        onBlur={() => { setTimeout(() => setVibeFocused(false), 150) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && vibeInput.trim()) {
                            e.preventDefault()
                            const existing = postForm.vibe.split(',').filter(Boolean)
                            const match = VIBES.find(v => v.toLowerCase() === vibeInput.trim().toLowerCase())
                            const val = match || vibeInput.trim()
                            if (!existing.includes(val)) {
                              setPostForm(f => ({ ...f, vibe: [...existing, val].join(',') }))
                            }
                            setVibeInput('')
                          }
                          if (e.key === 'Backspace' && !vibeInput) {
                            const tags = postForm.vibe.split(',').filter(Boolean)
                            if (tags.length) setPostForm(f => ({ ...f, vibe: tags.slice(0,-1).join(',') }))
                          }
                        }}
                      />
                      {(vibeFocused) && (() => {
                        const existing = postForm.vibe.split(',').filter(Boolean)
                        const opts = VIBES.filter(v => !existing.includes(v) && (!vibeInput || v.toLowerCase().includes(vibeInput.toLowerCase())))
                        return opts.length > 0 ? (
                          <div className="vdrop">
                            {opts.map(v => (
                              <div key={v} className="vopt" onMouseDown={() => {
                                setPostForm(f => ({ ...f, vibe: [...existing, v].join(',') }))
                                setVibeInput('')
                              }}>{v}</div>
                            ))}
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {postStep === 2 && (
              <div>
                <div className="step-hint">
                  Add each day with a summary and optional cost. Mark days as <strong>Locked</strong> so tourists pay credits to access them — that&apos;s how you earn. Expand any day to add photos, food tips, and travel notes.
                </div>
                {itinDays.map((d, i) => (
                  <div key={d.day} className={`day-card${d.expanded ? ' open' : ''}`}>
                    {/* Day header row */}
                    <div className="day-hdr">
                      <span className="ibd">D{d.day}</span>
                      <input className="ibin" type="text"
                        placeholder={`Day ${d.day} — e.g. Island hopping at Sugba Lagoon`}
                        value={d.activity} onChange={e => updDay(i, 'activity', e.target.value)}/>
                      <input className="ibco" type="text" placeholder="₱ cost"
                        value={d.cost} onChange={e => updDay(i, 'cost', e.target.value)}/>
                      <button className={`tog ${d.locked ? 'tgl' : 'tgf'}`}
                        onClick={() => updDay(i, 'locked', !d.locked)}>
                        {d.locked ? '🔒 Locked' : '✓ Free'}
                      </button>
                      <button className="day-toggle" onClick={() => updDay(i, 'expanded', !d.expanded)}>
                        {d.expanded ? '▲ Less' : '＋ Details'}
                      </button>
                    </div>

                    {/* Expanded detail panel */}
                    {d.expanded && (
                      <div className="day-body">
                        {/* Media upload */}
                        <div>
                          <span className="day-sub-lbl">📸 Photo or video for this day</span>
                          {d.mediaUrl ? (
                            <div style={{ position:'relative', borderRadius:'10px', overflow:'hidden' }}>
                              {d.mediaType === 'video'
                                ? <video src={d.mediaUrl} controls style={{ width:'100%', maxHeight:'200px', display:'block' }}/>
                                : <img src={d.mediaUrl} alt={`Day ${d.day}`} style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }}/>
                              }
                              <button onClick={() => { updDay(i, 'mediaUrl', ''); updDay(i, 'mediaType', null) }}
                                className="cover-remove">×</button>
                            </div>
                          ) : (
                            <div className={`day-media-zone${dayUploading[i] ? ' upload-zone-uploading' : ''}`}
                              onClick={() => {
                                if (dayUploading[i]) return
                                const inp = document.createElement('input')
                                inp.type = 'file'; inp.accept = 'image/*,video/*'
                                inp.onchange = (e) => {
                                  const f = (e.target as HTMLInputElement).files?.[0]
                                  if (f) handleDayMedia(i, f)
                                }
                                inp.click()
                              }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              <span style={{ fontSize:'12.5px', color:'var(--color-text-secondary)', fontWeight:500 }}>
                                {dayUploading[i] ? 'Uploading…' : 'Upload photo or video'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Highlights */}
                        <div>
                          <span className="day-sub-lbl">✨ Highlights</span>
                          <textarea className="fi" style={{ minHeight:'65px' }}
                            placeholder="What made this day special? e.g. Watched the sunset at Cloud 9, swam in the lagoon..."
                            value={d.highlights || ''}
                            onChange={e => updDay(i, 'highlights', e.target.value)}/>
                        </div>

                        {/* Food tips + Getting there */}
                        <div className="fr">
                          <div>
                            <span className="day-sub-lbl">🍜 Food tips</span>
                            <textarea className="fi" style={{ minHeight:'70px' }}
                              placeholder="Best restaurants, must-try dishes, estimated meal cost..."
                              value={d.foodTips || ''}
                              onChange={e => updDay(i, 'foodTips', e.target.value)}/>
                          </div>
                          <div>
                            <span className="day-sub-lbl">🚌 Getting around</span>
                            <textarea className="fi" style={{ minHeight:'70px' }}
                              placeholder="Transport used, how to get there, fare estimates..."
                              value={d.gettingThere || ''}
                              onChange={e => updDay(i, 'gettingThere', e.target.value)}/>
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <span className="day-sub-lbl">💡 Tips & budget breakdown</span>
                          <textarea className="fi" style={{ minHeight:'65px' }}
                            placeholder="Money-saving tips, what to avoid, booking advice, entrance fees..."
                            value={d.tips || ''}
                            onChange={e => updDay(i, 'tips', e.target.value)}/>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ibadd" onClick={addDay}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add another day
                </div>
              </div>
            )}

            {/* Step 3 */}
            {postStep === 3 && (
              <div>
                <div className="fg">
                  <label>Credits to unlock your full itinerary</label>
                  <div className="crc">
                    <div className="crt">
                      <span className="crl">Credits per tourist</span>
                      <span className="crv">{postForm.credits === 0 ? 'Free' : `${postForm.credits} credit${postForm.credits > 1 ? 's' : ''}`}</span>
                    </div>
                    <input type="range" min="0" max="10" value={postForm.credits} step="1"
                      style={{ width:'100%', accentColor:'var(--y)' }}
                      onChange={e => updCr(parseInt(e.target.value))}/>
                    <div className="cri">
                      {postForm.credits === 0
                        ? 'Free vlog — great for building your audience.'
                        : <>At {postForm.credits} credit{postForm.credits > 1 ? 's' : ''} · ₱{postForm.credits * 10} per tourist · 80% to you = <strong>₱{postForm.credits * 8}</strong>. Est. 50 unlocks/month = <strong>₱{(postForm.credits * 8 * 50).toLocaleString()} passive income</strong></>
                      }
                    </div>
                  </div>
                </div>
                <div style={{ padding:'14px 16px', border:'1.5px solid var(--gm)', borderRadius:'12px', fontSize:'13px', lineHeight:'1.75', color:'var(--color-text-secondary)', background:'var(--gp)' }}>
                  <strong style={{ color:'var(--g1)', display:'block', marginBottom:'6px', fontSize:'14px' }}>✅ Ready to publish?</strong>
                  Your vlog will go live immediately. Tourists can browse your itinerary and pay credits to unlock locked days. Make sure costs are accurate.
                </div>
              </div>
            )}

            {publishError && (
              <div className="ferr">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {publishError}
              </div>
            )}
            <div className="ff">
              <button className="bb" onClick={prevStepFn}>← Back</button>
              <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                {postStep < 3 && (
                  <button className="bb" onClick={saveDraft}>Save draft</button>
                )}
                <button className="nb" onClick={nextStep} disabled={publishing}>
                  {postStep === 3 ? (publishing ? 'Publishing…' : 'Publish →') : 'Continue →'}
                </button>
              </div>
            </div>

            {/* Saved drafts */}
            {drafts.length > 0 && (
              <div style={{ marginTop:'32px', paddingTop:'24px', borderTop:'1px solid var(--color-border-tertiary)' }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:'var(--color-text-primary)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'7px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Saved drafts
                  <span style={{ fontSize:'12px', fontWeight:500, color:'var(--color-text-secondary)', background:'var(--color-border-tertiary)', borderRadius:'10px', padding:'1px 7px' }}>{drafts.length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {drafts.map(d => (
                    <div key={d.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', border:'1px solid var(--color-border-tertiary)', borderRadius:'12px', background:'var(--color-bg-secondary)' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'13.5px', fontWeight:600, color:'var(--color-text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</div>
                        <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'2px' }}>Saved {fmtDraftAge(d.savedAt)}</div>
                      </div>
                      <button onClick={() => loadDraftById(d.id)}
                        style={{ flexShrink:0, padding:'5px 13px', fontSize:'12.5px', fontWeight:600, background:'var(--g)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                        Load
                      </button>
                      <button onClick={() => deleteDraft(d.id)}
                        style={{ flexShrink:0, width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--color-border-tertiary)', borderRadius:'8px', cursor:'pointer', color:'var(--color-text-secondary)', fontSize:'16px', lineHeight:1 }}
                        title="Delete draft">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DASHBOARD
      ══════════════════════════════════════ */}
      {page === 'dashboard' && (
        <div className="page on">
          <div className="w">
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'3px' }}>
              Good morning, <span style={{ color:'var(--g)' }}>{profile?.name?.split(/\s|R/)[0] || 'Marisol'}</span>
            </div>
            <div style={{ fontSize:'14px', color:'var(--color-text-secondary)', marginBottom:'20px' }}>Your vlog performance this month</div>
            <div className="kpig">
              <div className="kp">
                <div className="kpl">Earnings</div>
                <div className="kpv" style={{ color:'var(--y)' }}>₱{(profile?.earnings || 4320).toLocaleString()}</div>
                <div className="kpc up">↑ +18%</div>
              </div>
              <div className="kp">
                <div className="kpl">Credits</div>
                <div className="kpv">{profile?.credits || 432}</div>
                <div className="kpc up">↑ +64</div>
              </div>
              <div className="kp">
                <div className="kpl">Views</div>
                <div className="kpv">{((profile?.totalViews || 38400)/1000).toFixed(1)}k</div>
                <div className="kpc up">↑ +2.1k</div>
              </div>
              <div className="kp">
                <div className="kpl">Vlogs</div>
                <div className="kpv">{vlogs.length || profile?.vlogCount || 48}</div>
                <div className="kpc dw" style={{ color:'var(--color-text-secondary)' }}>2 in review</div>
              </div>
            </div>
            <div style={{ marginBottom:'22px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'11px' }}>
                <span style={{ fontSize:'14px', fontWeight:600 }}>Monthly earnings</span>
                <span style={{ fontSize:'12px', color:'var(--color-text-secondary)' }}>Oct: 86 unlocks</span>
              </div>
              <div className="ca">
                <div className="brs">
                  {[28,40,32,55,47,66,51,76,62,94].map((h, i) => (
                    <div key={i} className={`bar${i === 9 ? ' hi' : ''}`} style={{ height:`${h}%` }}/>
                  ))}
                </div>
                <div className="blbs">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'].map(m => (
                    <div key={m} className="blb">{m}</div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'11px' }}>
              <span style={{ fontSize:'14px', fontWeight:600 }}>My vlogs</span>
              <button className="nb" style={{ fontSize:'12px', padding:'7px 14px' }} onClick={() => { setPostStep(1); go('post') }}>+ New vlog</button>
            </div>
            <div className="vl2">
              {myVlogs.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', color:'var(--color-text-secondary)', fontSize:'13px' }}>
                  No vlogs yet. <span style={{ color:'var(--g)', cursor:'pointer', fontWeight:600 }} onClick={() => { setPostStep(1); go('post') }}>Post your first vlog →</span>
                </div>
              ) : myVlogs.slice(0,4).map(v => (
                <div key={v.id} className="vr2" onClick={() => openD('dashboard', v.id)}>
                  <div className={`vt2 ${v.thumbnailColor}`}/>
                  <div style={{ flex:1 }}>
                    <div className="vn2">{v.title.length > 36 ? v.title.slice(0,36)+'…' : v.title}</div>
                    <span className="vs2">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `${v.credits} unlocks` : 'free vlog'}</span>
                  </div>
                  <span className="st sl3">Live</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          NOTIFICATIONS
      ══════════════════════════════════════ */}
      {page === 'notif' && (
        <div className="page on">
          <div className="w">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <span style={{ fontSize:'21px', fontWeight:700 }}>Notifications</span>
              <span style={{ fontSize:'13px', color:'var(--g)', cursor:'pointer', fontWeight:500 }} onClick={clrAll}>Mark all read</span>
            </div>
            <div className="nl">
              {[
                { id:'n1', bg:'var(--yl)', icon:'✦', text: <><strong>Janna P.</strong> unlocked &ldquo;Siargao in 7 days&rdquo; — you earned ₱16</>, time:'12 minutes ago' },
                { id:'n2', bg:'#f0f0ff', icon:'★', text: <><strong>Rico G.</strong> left a 5-star review — &ldquo;Totally worth the credits!&rdquo;</>, time:'3 hours ago' },
                { id:'n3', bg:'var(--gl)', icon:'👤', text: <><strong>Ana Cruz</strong> and 3 others started following you</>, time:'Yesterday' },
                { id:'n4', bg:'var(--yl)', icon:'✦', text: <><strong>Mark T.</strong> unlocked &ldquo;Siargao in 7 days&rdquo; — you earned ₱16</>, time:'Yesterday' },
                { id:'n5', bg:'var(--bl)', icon:'📈', text: <>&ldquo;Cebu island hopping&rdquo; is trending in PH — 408 new views this week</>, time:'2 days ago' },
              ].map(n => (
                <div key={n.id} className={`nr${!readN.has(n.id) && n.id !== 'n5' ? ' ur' : ''}`} onClick={() => rdN(n.id)}>
                  <div className="nic" style={{ background:n.bg }}>{n.icon}</div>
                  <div style={{ flex:1 }}>
                    <div className="ntx">{n.text}</div>
                    <div className="ntm">{n.time}</div>
                  </div>
                  {!readN.has(n.id) && n.id !== 'n5' && <div className="nd2"/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
