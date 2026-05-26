'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface VlogAuthor {
  id: string
  handle: string
  initials: string
  avatarColor: string
  verified: boolean
  followers?: number
  vlogCount?: number
}

interface MediaItem {
  url: string
  type: 'image' | 'video'
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
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | string | null
  media?: MediaItem[] | null
}

interface Review {
  id: string
  authorName: string
  rating: number
  text: string
  createdAt: string
}

export interface TourMeVlog {
  id: string
  title: string
  location: string
  country?: string
  views: number
  likes: number
  trending: boolean
  author: VlogAuthor
  description?: string | null
  youtubeUrl?: string | null
  coverImage?: string | null
}

interface VlogDetail extends TourMeVlog {
  country: string
  region: string
  vibe: string
  ratingCount: number
  itinerary: ItineraryDay[]
  reviews: Review[]
}

interface TourDestination {
  id: string
  title: string
  name: string
  city: string
  country: string
  lat: number
  lng: number
  views: number
  likes: number
  author: VlogAuthor
  description?: string | null
  coverImage?: string | null
  youtubeUrl?: string | null
  pin: { x: number; y: number }
  rank: number
  score: number
  reason: string
}

interface TourMeProps {
  open: boolean
  onClose: () => void
  vlogs: TourMeVlog[]
  profileInitials?: string
}

const normalizeLocationKey = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  siargao: { lat: 9.8482, lng: 126.0458 },
  palawan: { lat: 9.8349, lng: 118.7384 },
  'el nido': { lat: 11.1956, lng: 119.4075 },
  coron: { lat: 12.0016, lng: 120.2009 },
  cebu: { lat: 10.3157, lng: 123.8854 },
  boracay: { lat: 11.9674, lng: 121.9248 },
  baguio: { lat: 16.4023, lng: 120.596 },
  vigan: { lat: 17.5747, lng: 120.3869 },
  iloilo: { lat: 10.7202, lng: 122.5621 },
  dumaguete: { lat: 9.3068, lng: 123.3054 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  hiroshima: { lat: 34.3853, lng: 132.4553 },
  hokkaido: { lat: 43.2203, lng: 142.8635 },
  nara: { lat: 34.6851, lng: 135.8048 },
  kobe: { lat: 34.6901, lng: 135.1955 },
  fukuoka: { lat: 33.5902, lng: 130.4017 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  'chiang mai': { lat: 18.7883, lng: 98.9853 },
  phuket: { lat: 7.8804, lng: 98.3923 },
  krabi: { lat: 8.0863, lng: 98.9063 },
  'koh samui': { lat: 9.512, lng: 100.0136 },
  pattaya: { lat: 12.9236, lng: 100.8825 },
  ayutthaya: { lat: 14.3692, lng: 100.5877 },
  hanoi: { lat: 21.0278, lng: 105.8342 },
  'halong bay': { lat: 20.9101, lng: 107.1839 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'hoi an': { lat: 15.8801, lng: 108.338 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  bali: { lat: -8.3405, lng: 115.092 },
  ubud: { lat: -8.5069, lng: 115.2625 },
  seminyak: { lat: -8.6913, lng: 115.1682 },
  lombok: { lat: -8.65, lng: 116.3249 },
  flores: { lat: -8.6574, lng: 121.0794 },
  yogyakarta: { lat: -7.7956, lng: 110.3695 },
  rome: { lat: 41.9028, lng: 12.4964 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5072, lng: -0.1276 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  santorini: { lat: 36.3932, lng: 25.4615 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  banff: { lat: 51.4968, lng: -115.9281 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  philippines: { lat: 12.8797, lng: 121.774 },
  japan: { lat: 36.2048, lng: 138.2529 },
  vietnam: { lat: 14.0583, lng: 108.2772 },
  thailand: { lat: 15.87, lng: 100.9925 },
  indonesia: { lat: -0.7893, lng: 113.9213 },
  usa: { lat: 39.8283, lng: -98.5795 },
  france: { lat: 46.2276, lng: 2.2137 },
  italy: { lat: 41.8719, lng: 12.5674 },
}

const coordsForVlog = (vlog: { title: string; location?: string | null; country?: string | null }) => {
  const haystack = normalizeLocationKey(`${vlog.location || ''} ${vlog.country || ''} ${vlog.title || ''}`)
  const match = Object.entries(LOCATION_COORDS).find(([key]) => haystack.includes(key))
  return match?.[1] || { lat: 14.5995, lng: 120.9842 }
}

const pinForCoords = ({ lat, lng }: { lat: number; lng: number }) => ({
  x: Math.min(94, Math.max(6, ((lng + 180) / 360) * 100)),
  y: Math.min(92, Math.max(8, (((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) - 0.25) * 200)),
})

const cityFromLocation = (location?: string | null, country?: string | null) => {
  const cleaned = (location || country || 'Destination').split(',')[0]?.trim()
  return cleaned || country || 'Destination'
}

const shortCount = (value: number) =>
  value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)

const destinationScore = (vlog: TourMeVlog) =>
  (vlog.views || 0) + (vlog.likes || 0) * 18 + (vlog.trending ? 12000 : 0)

const reasonForDestination = (vlog: TourMeVlog) => {
  if (vlog.trending) return 'Trending with travelers right now'
  if ((vlog.likes || 0) >= 100) return 'Loved by Tourista viewers'
  if ((vlog.views || 0) >= 1000) return 'High-interest destination'
  return 'Recommended from a creator itinerary'
}

const youtubeIdFromUrl = (url?: string | null) => {
  if (!url) return ''
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/)
  return match?.[1] || ''
}

const youtubeThumbForUrl = (url?: string | null) => {
  const id = youtubeIdFromUrl(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?controls=1&rel=0`
  const ytSearch = url.match(/youtube\.com\/results\?search_query=([^&]+)/)
  if (ytSearch) return `https://www.youtube.com/embed?listType=search&list=${ytSearch[1]}&controls=1&rel=0`
  return null
}

const isDirectVideoUrl = (url: string) =>
  url.startsWith('blob:') ||
  url.startsWith('/api/uploads/') ||
  /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url)

const osmTile = (lat: number, lng: number, zoom = 13) => {
  const latRad = lat * Math.PI / 180
  const scale = 2 ** zoom
  return {
    x: Math.floor((lng + 180) / 360 * scale),
    y: Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * scale),
    zoom,
  }
}

const mapTilesForCoords = (lat: number, lng: number) => {
  const center = osmTile(lat, lng)
  const offsets = [-1, 0, 1]
  return offsets.flatMap(row => offsets.map(col => ({
    key: `${center.zoom}-${center.x + col}-${center.y + row}`,
    url: `https://tile.openstreetmap.org/${center.zoom}/${center.x + col}/${center.y + row}.png`,
    left: `${(col + 1.5) * 33.3333}%`,
    top: `${(row + 1.5) * 33.3333}%`,
  })))
}

const worldMapTiles = Array.from({ length: 8 }, (_, index) => {
  const x = index % 4
  const y = Math.floor(index / 4) + 1
  return {
    key: `world-2-${x}-${y}`,
    url: `https://tile.openstreetmap.org/2/${x}/${y}.png`,
    left: `${x * 25}%`,
    top: `${(y - 1) * 50}%`,
  }
})

const googleMapEmbedUrl = (destination?: TourDestination | null) => {
  if (!destination) return ''
  const query = encodeURIComponent(`${destination.lat},${destination.lng}`)
  return `https://www.google.com/maps?q=${query}&z=14&output=embed`
}

const googleMapOpenUrl = (destination?: TourDestination | null) => {
  if (!destination) return '#'
  const query = encodeURIComponent(`${destination.name}, ${destination.country}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

const googleStreetViewEmbedUrl = (destination?: TourDestination | null) => {
  if (!destination) return ''
  return `https://maps.google.com/maps?layer=c&cbll=${destination.lat},${destination.lng}&cbp=12,0,0,0,0&output=svembed`
}

const googleStreetViewOpenUrl = (destination?: TourDestination | null) => {
  if (!destination) return '#'
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${destination.lat},${destination.lng}`
}

const mediaForDay = (day: ItineraryDay): MediaItem[] => {
  if (Array.isArray(day.media) && day.media.length) return day.media.filter(item => Boolean(item.url))
  if (day.mediaUrl) return [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' : 'image' }]
  return []
}

const PersonAvatar = ({ small = false }: { small?: boolean }) => (
  <svg className={small ? 'tour-person small' : 'tour-person'} viewBox="0 0 120 120" aria-hidden="true">
    <path className="hood-shadow" d="M20 112c6-24 23-36 40-36s34 12 40 36H20Z" />
    <path className="hood" d="M22 114c5-27 22-42 38-42s33 15 38 42H22Z" />
    <path className="jacket" d="M8 120c6-24 26-34 52-34s46 10 52 34H8Z" />
    <path className="neck" d="M47 78h26v24c-5 6-21 6-26 0V78Z" />
    <path className="face" d="M25 48c0-26 15-42 35-42s35 16 35 42c0 31-15 48-35 48S25 79 25 48Z" />
    <path className="ear left" d="M23 50c-9-2-12 12-5 19 4 4 10 2 10-4" />
    <path className="ear right" d="M97 50c9-2 12 12 5 19-4 4-10 2-10-4" />
    <path className="hair" d="M22 50c-5-24 8-43 28-48 17-4 33 1 44 14 9 11 9 28 1 42-6 10-19 12-27 4-9-9-15-24-30-17-9 4-14 12-16 5Z" />
    <path className="hair-stroke" d="M31 21c17-12 38-14 56 1M38 35c15-9 30-12 45-7" />
    <path className="brow left" d="M35 47c8-4 16-4 24-1" />
    <path className="brow right" d="M66 46c8-3 17-3 24 1" />
    <ellipse className="eye-white" cx="45" cy="58" rx="10" ry="8" />
    <ellipse className="eye-white" cx="76" cy="58" rx="10" ry="8" />
    <circle className="iris" cx="45" cy="58" r="5" />
    <circle className="iris" cx="76" cy="58" r="5" />
    <circle className="shine" cx="43" cy="56" r="2" />
    <circle className="shine" cx="74" cy="56" r="2" />
    <path className="nose" d="M59 63 53 76c4 4 11 4 15 0l-6-13" />
    <path className="smile" d="M45 82c8 7 22 7 30 0" />
  </svg>
)

export default function TourMe({ open, onClose, vlogs, profileInitials = 'ME' }: TourMeProps) {
  const [stage, setStage] = useState<'world' | 'place'>('world')
  const [mapMode, setMapMode] = useState<'map' | 'street'>('map')
  const [vlogId, setVlogId] = useState('')
  const [detail, setDetail] = useState<VlogDetail | null>(null)
  const [clipId, setClipId] = useState('')
  const [travelCue, setTravelCue] = useState<{ key: number; direction: 1 | -1; from: string; to: string } | null>(null)
  const travelTimerRef = useRef<number | null>(null)

  const destinations = useMemo<TourDestination[]>(() => {
    return [...vlogs]
      .sort((a, b) => destinationScore(b) - destinationScore(a))
      .slice(0, 8)
      .map((v, index) => {
        const coords = coordsForVlog(v)
        return {
          id: v.id,
          title: v.title,
          name: cityFromLocation(v.location, v.country),
          city: cityFromLocation(v.location, v.country),
          country: v.country || v.location.split(',').pop()?.trim() || 'Travel',
          lat: coords.lat,
          lng: coords.lng,
          views: v.views || 0,
          likes: v.likes || 0,
          author: v.author,
          description: v.description,
          coverImage: v.coverImage || youtubeThumbForUrl(v.youtubeUrl),
          youtubeUrl: v.youtubeUrl,
          pin: pinForCoords(coords),
          rank: index + 1,
          score: destinationScore(v),
          reason: reasonForDestination(v),
        }
      })
  }, [vlogs])

  const topDestination = destinations[0]
  const selectedDestination = destinations.find(destination => destination.id === vlogId) || topDestination
  const displayedDestination = stage === 'world' ? topDestination : selectedDestination
  const itinerary = detail && selectedDestination && detail.id === selectedDestination.id ? detail.itinerary : []
  const mapTarget = selectedDestination || { lat: 14.5995, lng: 120.9842 }
  const mapTiles = mapTilesForCoords(mapTarget.lat, mapTarget.lng)
  const googleMapUrl = googleMapEmbedUrl(selectedDestination)
  const googleOpenUrl = googleMapOpenUrl(selectedDestination)
  const googleStreetUrl = googleStreetViewEmbedUrl(selectedDestination)
  const googleStreetOpenUrl = googleStreetViewOpenUrl(selectedDestination)
  const activeMapUrl = mapMode === 'street' ? googleStreetUrl : googleMapUrl
  const clipItems = itinerary.length
    ? itinerary
    : selectedDestination
      ? [{ id: selectedDestination.id, day: 1, activity: selectedDestination.title, locked: false, highlights: selectedDestination.description || 'Open this destination from a live Tourista vlog.', cost: null, mediaUrl: null, mediaType: null, media: null, foodTips: null, gettingThere: null, tips: null }]
      : []
  const selectedClip = clipItems.find(day => day.id === clipId) || clipItems[0]
  const selectedClipIndex = Math.max(0, clipItems.findIndex(day => day.id === selectedClip?.id))
  const sourceVideoUrl = detail?.youtubeUrl || selectedDestination?.youtubeUrl || ''
  const videoBase = sourceVideoUrl ? getEmbedUrl(sourceVideoUrl) : null
  const selectedVideoUrl = videoBase ? `${videoBase}&start=${selectedClipIndex * 75}` : null
  const selectedVideoThumb = youtubeThumbForUrl(sourceVideoUrl)
  const selectedVideoMedia = selectedClip ? mediaForDay(selectedClip).find(item => item.type === 'video') : null
  const activeClipMedia = selectedVideoMedia || (selectedVideoUrl ? { url: selectedVideoUrl, type: 'video' as const } : null)
  const activeClipEmbedUrl = activeClipMedia ? (getEmbedUrl(activeClipMedia.url) || (activeClipMedia.url.includes('youtube.com/embed') ? activeClipMedia.url : null)) : null
  const activeClipDirectUrl = activeClipMedia && !activeClipEmbedUrl && isDirectVideoUrl(activeClipMedia.url) ? activeClipMedia.url : null
  const activeClipExternalUrl = activeClipMedia && !activeClipEmbedUrl && !activeClipDirectUrl ? activeClipMedia.url : ''
  const activeClipThumb = activeClipMedia ? (youtubeThumbForUrl(activeClipMedia.url) || selectedVideoThumb) : selectedVideoThumb

  const loadDetail = useCallback(async (id: string) => {
    if (!id) return
    try {
      const response = await fetch(`/api/vlogs/${id}`)
      if (!response.ok) return
      const nextDetail: VlogDetail = await response.json()
      setDetail(nextDetail)
      setClipId(nextDetail.itinerary[0]?.id || '')
    } catch {
      /* keep the current tour state */
    }
  }, [])

  const selectDestination = useCallback((destination: TourDestination, options?: { street?: boolean }) => {
    setVlogId(destination.id)
    setClipId('')
    setDetail(null)
    loadDetail(destination.id)
    setMapMode(options?.street ? 'street' : 'map')
    setStage('place')
  }, [loadDetail])

  const moveDestination = (direction: 1 | -1) => {
    if (!destinations.length || !selectedDestination) return
    const currentIndex = destinations.findIndex(destination => destination.id === selectedDestination.id)
    const nextIndex = (Math.max(0, currentIndex) + direction + destinations.length) % destinations.length
    const nextDestination = destinations[nextIndex]
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)
    setTravelCue({ key: Date.now(), direction, from: selectedDestination.name, to: nextDestination.name })
    setMapMode('map')
    setStage('place')
    travelTimerRef.current = window.setTimeout(() => {
      selectDestination(nextDestination, { street: true })
      travelTimerRef.current = null
    }, 3600)
  }

  useEffect(() => {
    if (!travelCue) return
    const timer = window.setTimeout(() => setTravelCue(null), 5000)
    return () => window.clearTimeout(timer)
  }, [travelCue])

  useEffect(() => {
    return () => {
      if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!destinations.length) return
    if (!vlogId || !destinations.some(destination => destination.id === vlogId)) {
      setVlogId(destinations[0].id)
    }
  }, [destinations, vlogId])

  useEffect(() => {
    if (!open) return
    setStage('world')
    if (destinations[0]) {
      setVlogId(destinations[0].id)
      loadDetail(destinations[0].id)
    }
  }, [destinations, loadDetail, open])

  if (!open) return null

  return (
    <div className="tour-modal" role="dialog" aria-modal="true" aria-label="Tour me">
      <div className="tour-shell">
        <div className={`tour-map ${stage === 'world' ? 'is-world' : 'is-place'}`}>
          {stage === 'world' ? (
            <div className="tour-world">
              <div className="tour-world-map" aria-hidden="true">
                {worldMapTiles.map(tile => <img key={tile.key} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="lazy" />)}
              </div>
              <svg className="tour-world-route" viewBox="0 0 900 520" aria-hidden="true">
                <path className="tour-route" d="M164 318 C286 225 378 340 490 244 S682 180 767 282" />
                <path className="tour-route route-two" d="M210 250 C338 155 500 166 684 238" />
              </svg>
              <div className="tour-world-pins">
                {destinations.map(destination => (
                  <button key={destination.id} className={`tour-pin${destination.id === selectedDestination?.id ? ' active' : ''}${destination.id === topDestination?.id ? ' hot' : ''}`} style={{ left:`${destination.pin.x}%`, top:`${destination.pin.y}%` }} onClick={() => selectDestination(destination, { street: true })} title={`${destination.name}, ${destination.country}`}>
                    <span>{destination.rank}</span>
                  </button>
                ))}
              </div>
              <div className="tour-plane" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              <div className="tour-scan-card"><strong>Top spots to visit</strong><span>Ranked by views, likes, and trending vlogs</span></div>
            </div>
          ) : (
            <>
              <div className="tour-google-stage" role="img" aria-label={`Google ${mapMode === 'street' ? 'Street View' : 'map'} for ${selectedDestination?.name || 'selected destination'}`}>
                {activeMapUrl ? (
                  <iframe className="tour-google-map" src={activeMapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${selectedDestination?.name || 'Destination'} ${mapMode === 'street' ? 'Street View' : 'map'}`} />
                ) : (
                  <div className="tour-tile-map">
                    {mapTiles.map(tile => <img key={tile.key} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="lazy"/>)}
                  </div>
                )}
                <div className="tour-map-search">
                  <span>{selectedDestination?.name || 'Search destination'}</span>
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                </div>
                <a className="tour-map-share" href={mapMode === 'street' ? googleStreetOpenUrl : googleOpenUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.8 15.4 6.2M8.6 13.2l6.8 4.6"/></svg>
                  Open
                </a>
                <div className="tour-map-mode" aria-label="Map view mode">
                  <button type="button" className={mapMode === 'map' ? 'active' : ''} onClick={() => setMapMode('map')}>Map</button>
                  <button type="button" className={mapMode === 'street' ? 'active' : ''} onClick={() => setMapMode('street')}>Street</button>
                </div>
                {mapMode === 'map' && activeMapUrl && (
                  <button
                    type="button"
                    className="tour-street-hotspot"
                    onDoubleClick={() => setMapMode('street')}
                    aria-label={`Open Street View for ${selectedDestination?.name || 'this destination'}`}
                    title="Double-click to enter Street View"
                  />
                )}
                {mapMode === 'street' && (
                  <a className="tour-street-open" href={googleStreetOpenUrl} target="_blank" rel="noopener noreferrer">Open Street View</a>
                )}
                {travelCue && (
                  <div key={travelCue.key} className={`tour-travel-cue ${travelCue.direction === 1 ? 'is-next' : 'is-prev'}`} aria-live="polite">
                    <span className="tour-travel-label from">{travelCue.from}</span>
                    <span className="tour-flight-route" aria-hidden="true">
                      <span className="tour-flight-end start" />
                      <span className="tour-flight-dash d1" />
                      <span className="tour-flight-dash d2" />
                      <span className="tour-flight-dash d3" />
                      <span className="tour-flight-dash d4" />
                      <span className="tour-flight-dash d5" />
                      <span className="tour-flight-dash d6" />
                      <span className="tour-flight-end finish" />
                      <svg className="tour-travel-plane" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2Z"/></svg>
                    </span>
                    <span className="tour-travel-label to">{travelCue.to}</span>
                  </div>
                )}
                {mapMode === 'street' && !travelCue && (
                  <div className="tour-google-avatar street" aria-label="Your avatar in Street View"><PersonAvatar /></div>
                )}
                {mapMode === 'map' && !activeMapUrl && <div className="tour-map-center-pin"><span>{selectedDestination?.name || 'Here'}</span></div>}
                <div className="tour-mini-map">
                  {mapTiles.map(tile => <img key={`mini-${tile.key}`} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="lazy"/>)}
                  {mapMode === 'street' && !travelCue && <div className="tour-mini-avatar"><PersonAvatar small /></div>}
                </div>
              </div>
              <div className="tour-map-chip"><strong>{selectedClip?.activity || selectedDestination?.title || 'Selected destination'}</strong><span>{selectedDestination?.city}, {selectedDestination?.country}</span></div>
            </>
          )}
        </div>
        <aside className="tour-panel">
          <div className="tour-panel-head">
            <div><div className="tour-kicker">{stage === 'world' ? 'Top spot finder' : 'Avatar placed here'}</div><h2>{displayedDestination?.name || 'Live destinations'}</h2><p>{displayedDestination ? `${displayedDestination.city}, ${displayedDestination.country}` : 'Loading Tourista vlogs'}</p></div>
            <button className="tour-close" onClick={onClose} aria-label="Close tour me">x</button>
          </div>
          <div className="tour-stats"><span>#{displayedDestination?.rank || 1} top spot</span><span>{shortCount(displayedDestination?.views || 0)} views</span><span>{shortCount(displayedDestination?.likes || 0)} likes</span></div>
          {displayedDestination && (
            <button type="button" className="tour-top-spot" onClick={() => selectDestination(displayedDestination, { street: true })}>
              <span className="tour-top-media" style={{ backgroundImage: displayedDestination.coverImage ? `url('${displayedDestination.coverImage}')` : undefined }}>
                {!displayedDestination.coverImage && displayedDestination.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="tour-top-copy">
                <span>Best match for your next stop</span>
                <strong>{displayedDestination.title}</strong>
                <small>{displayedDestination.reason}</small>
              </span>
            </button>
          )}
          <div className="tour-next-controls">
            <button type="button" onClick={() => moveDestination(-1)} aria-label="Previous destination">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Prev
            </button>
            <button type="button" onClick={() => moveDestination(1)} aria-label="Next destination">
              Next destination
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <p className="tour-why">{stage === 'world' ? `Pick one of the top spots below, or jump straight into ${topDestination?.name || 'the top destination'} to see map context and itinerary clips.` : (detail?.description || selectedDestination?.description || selectedDestination?.title || 'Selected from live Tourista vlog data.')}</p>
          <div className="tour-list-title">Top spots to visit</div>
          <div className="tour-top-list">
            {destinations.map(destination => (
              <button key={destination.id} type="button" className={`tour-top-item${destination.id === selectedDestination?.id ? ' active' : ''}`} onClick={() => selectDestination(destination, { street: true })}>
                <span className="tour-top-rank">{destination.rank}</span>
                <span className="tour-top-thumb" style={{ backgroundImage: destination.coverImage ? `url('${destination.coverImage}')` : undefined }} />
                <span className="tour-top-item-copy">
                  <strong>{destination.name}</strong>
                  <small>{destination.country} · {destination.reason}</small>
                </span>
              </button>
            ))}
          </div>
          {activeClipMedia && (
            <div className="tour-video-player" style={{ backgroundImage: activeClipThumb ? `url('${activeClipThumb}')` : undefined }}>
              {activeClipEmbedUrl ? (
                <iframe src={activeClipEmbedUrl} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={`${selectedDestination?.title || 'Vlog'} video`} />
              ) : activeClipDirectUrl ? (
                <video src={activeClipDirectUrl} controls playsInline/>
              ) : (
                <a href={activeClipExternalUrl} target="_blank" rel="noopener noreferrer" className="tour-video-link">
                  <span className="tour-video-play"><svg viewBox="0 0 24 24"><polygon points="8 5 19 12 8 19 8 5"/></svg></span>
                  <strong>Open itinerary clip</strong>
                </a>
              )}
            </div>
          )}
          <div className="tour-list-title">Itinerary clips from vloggers</div>
          <div className="tour-actions">
            {clipItems.map((day, index) => {
              const media = mediaForDay(day)
              const thumb = media[0]?.type === 'image' ? media[0].url : youtubeThumbForUrl(detail?.youtubeUrl || selectedDestination?.youtubeUrl)
              const active = day.id === selectedClip?.id || (!selectedClip && index === 0)
              return (
                <button key={day.id} className={`tour-action${active ? ' active' : ''}`} onClick={() => { if (selectedDestination) setVlogId(selectedDestination.id); setClipId(day.id); setStage('place') }}>
                  <span className="tour-clip-thumb" style={{ backgroundImage: thumb ? `url('${thumb}')` : undefined }}>
                    {media[0]?.type === 'video' && isDirectVideoUrl(media[0].url) ? <video src={media[0].url} muted playsInline /> : <svg viewBox="0 0 24 24"><polygon points="8 5 19 12 8 19 8 5"/></svg>}
                  </span>
                  <span className="tour-action-copy">
                    <span className="tour-action-kind">Day {day.day} · itinerary clip</span>
                    <strong>{day.activity}</strong>
                    <small>{day.highlights || day.tips || selectedDestination?.title}</small>
                    <em>by @{selectedDestination?.author.handle || 'creator'}{media.length ? ` · ${media.length} media` : ''}</em>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
