'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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
  x: Math.min(92, Math.max(8, ((lng + 180) / 360) * 100)),
  y: Math.min(82, Math.max(14, ((90 - lat) / 180) * 100)),
})

const cityFromLocation = (location?: string | null, country?: string | null) => {
  const cleaned = (location || country || 'Destination').split(',')[0]?.trim()
  return cleaned || country || 'Destination'
}

const shortCount = (value: number) =>
  value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)

const youtubeIdFromUrl = (url?: string | null) => {
  if (!url) return ''
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  return match?.[1] || ''
}

const youtubeThumbForUrl = (url?: string | null) => {
  const id = youtubeIdFromUrl(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?controls=1&rel=0`
  const ytSearch = url.match(/youtube\.com\/results\?search_query=([^&]+)/)
  if (ytSearch) return `https://www.youtube.com/embed?listType=search&list=${ytSearch[1]}&controls=1&rel=0`
  return null
}

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

const mediaForDay = (day: ItineraryDay): MediaItem[] => {
  if (Array.isArray(day.media) && day.media.length) return day.media.filter(item => Boolean(item.url))
  if (day.mediaUrl) return [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' : 'image' }]
  return []
}

export default function TourMe({ open, onClose, vlogs, profileInitials = 'ME' }: TourMeProps) {
  const [stage, setStage] = useState<'world' | 'place'>('world')
  const [vlogId, setVlogId] = useState('')
  const [detail, setDetail] = useState<VlogDetail | null>(null)
  const [clipId, setClipId] = useState('')

  const destinations = useMemo<TourDestination[]>(() => {
    return [...vlogs]
      .sort((a, b) => ((b.likes || 0) * 3 + (b.views || 0) + (b.trending ? 5000 : 0)) - ((a.likes || 0) * 3 + (a.views || 0) + (a.trending ? 5000 : 0)))
      .slice(0, 8)
      .map(v => {
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
          coverImage: v.coverImage,
          youtubeUrl: v.youtubeUrl,
          pin: pinForCoords(coords),
        }
      })
  }, [vlogs])

  const topDestination = destinations[0]
  const selectedDestination = destinations.find(destination => destination.id === vlogId) || topDestination
  const displayedDestination = stage === 'world' ? topDestination : selectedDestination
  const itinerary = detail && selectedDestination && detail.id === selectedDestination.id ? detail.itinerary : []
  const mapTarget = selectedDestination || { lat: 14.5995, lng: 120.9842 }
  const mapTiles = mapTilesForCoords(mapTarget.lat, mapTarget.lng)
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
  const selectedWatchUrl = sourceVideoUrl ? `${sourceVideoUrl}${sourceVideoUrl.includes('?') ? '&' : '?'}t=${selectedClipIndex * 75}s` : ''
  const selectedVideoThumb = youtubeThumbForUrl(sourceVideoUrl)
  const selectedVideoMedia = selectedClip ? mediaForDay(selectedClip).find(item => item.type === 'video') : null
  const activeClipMedia = selectedVideoMedia || (selectedVideoUrl ? { url: selectedVideoUrl, type: 'video' as const } : null)

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

  const selectDestination = useCallback((destination: TourDestination) => {
    setVlogId(destination.id)
    setClipId('')
    setDetail(null)
    loadDetail(destination.id)
    setStage('place')
  }, [loadDetail])

  const moveDestination = (direction: 1 | -1) => {
    if (!destinations.length || !selectedDestination) return
    const currentIndex = destinations.findIndex(destination => destination.id === selectedDestination.id)
    const nextIndex = (Math.max(0, currentIndex) + direction + destinations.length) % destinations.length
    selectDestination(destinations[nextIndex])
  }

  useEffect(() => {
    if (!destinations.length) return
    if (!vlogId || !destinations.some(destination => destination.id === vlogId)) {
      setVlogId(destinations[0].id)
    }
  }, [destinations, vlogId])

  useEffect(() => {
    if (!open) return
    setStage('world')
    if (destinations[0]) setVlogId(destinations[0].id)
  }, [destinations, open])

  useEffect(() => {
    if (!open || stage !== 'world' || !topDestination) return
    const timer = window.setTimeout(() => {
      setVlogId(topDestination.id)
      loadDetail(topDestination.id)
      setStage('place')
    }, 3200)
    return () => window.clearTimeout(timer)
  }, [loadDetail, open, stage, topDestination])

  if (!open) return null

  return (
    <div className="tour-modal" role="dialog" aria-modal="true" aria-label="Tour me">
      <div className="tour-shell">
        <div className={`tour-map ${stage === 'world' ? 'is-world' : 'is-place'}`}>
          {stage === 'world' ? (
            <div className="tour-world">
              <svg className="tour-world-art" viewBox="0 0 900 520" aria-hidden="true">
                <path d="M130 170c44-50 122-60 190-36 37 13 70 2 104-14 64-30 139-20 195 21 33 24 69 32 109 26 58-8 104 16 130 62 16 28 7 58-20 76-29 20-72 18-117 13-43-5-75 1-108 22-48 31-105 37-162 20-45-13-86-8-129 10-72 31-148 12-192-43-39-48-40-112 0-157Z" fill="#e7f4ec"/>
                <path d="M159 178c28-25 79-30 125-15 25 8 55 28 47 49-8 22-45 17-71 30-33 17-18 61-51 68-43 10-91-21-102-58-8-29 9-54 52-74Zm248-30c51-33 123-34 171-4 32 20 29 48-3 58-31 10-70 2-98 22-31 22-27 62-63 67-35 4-77-28-82-64-4-28 24-57 75-79Zm263 79c52-21 113-6 139 33 22 33 5 72-42 86-46 13-104-2-130-36-24-31-14-64 33-83ZM370 358c47 11 85 48 82 83-3 31-39 49-80 40-40-8-71-38-74-70-3-35 24-61 72-53Z" fill="#46b978"/>
                <path className="tour-route" d="M220 190 C332 96 448 112 527 186 S686 305 744 252" />
                <path className="tour-route route-two" d="M234 296 C366 374 536 368 660 285" />
              </svg>
              <div className="tour-world-pins">
                {destinations.map(destination => (
                  <button key={destination.id} className={`tour-pin${destination.id === topDestination?.id ? ' hot' : ''}`} style={{ left:`${destination.pin.x}%`, top:`${destination.pin.y}%` }} onClick={() => selectDestination(destination)} title={`${destination.name}, ${destination.country}`}>
                    <span>{destination.id === topDestination?.id ? 'Top' : destination.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                  </button>
                ))}
              </div>
              <div className="tour-plane" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              <div className="tour-scan-card"><strong>Touring the world</strong><span>Stopping at the most liked destination</span></div>
            </div>
          ) : (
            <>
              <div className="tour-tile-map" role="img" aria-label={`Map for ${selectedDestination?.name || 'selected destination'}`}>
                {mapTiles.map(tile => <img key={tile.key} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="lazy"/>)}
                <div className="tour-avatar-route" aria-hidden="true"/>
                <div className="tour-map-center-pin"><span>{selectedDestination?.name || 'Here'}</span></div>
              </div>
              <div className="tour-avatar roaming"><span>{profileInitials}</span></div>
              <div className="tour-map-chip"><strong>{selectedClip?.activity || selectedDestination?.title || 'Selected destination'}</strong><span>{selectedDestination?.city}, {selectedDestination?.country}</span></div>
            </>
          )}
        </div>
        <aside className="tour-panel">
          <div className="tour-panel-head">
            <div><div className="tour-kicker">{stage === 'world' ? 'Tour me preview' : 'Avatar placed here'}</div><h2>{displayedDestination?.name || 'Live destinations'}</h2><p>{displayedDestination ? `${displayedDestination.city}, ${displayedDestination.country}` : 'Loading Tourista vlogs'}</p></div>
            <button className="tour-close" onClick={onClose} aria-label="Close tour me">x</button>
          </div>
          <div className="tour-stats"><span>{shortCount(displayedDestination?.views || 0)} views</span><span>{shortCount(displayedDestination?.likes || 0)} likes</span><span>{stage === 'world' ? 'Auto landing' : 'Map tiles'}</span></div>
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
          <p className="tour-why">{stage === 'world' ? `Tourista is flying across the most viewed and liked vlogs, then landing on ${topDestination?.name || 'the top destination'}.` : (detail?.description || selectedDestination?.description || selectedDestination?.title || 'Selected from live Tourista vlog data.')}</p>
          {activeClipMedia && (
            <div className="tour-video-player" style={{ backgroundImage: selectedVideoThumb ? `url('${selectedVideoThumb}')` : undefined }}>
              {activeClipMedia.url.includes('youtube.com/embed') && selectedWatchUrl ? (
                <a href={selectedWatchUrl} target="_blank" rel="noopener noreferrer" className="tour-video-link">
                  <span className="tour-video-play"><svg viewBox="0 0 24 24"><polygon points="8 5 19 12 8 19 8 5"/></svg></span>
                  <strong>Watch day {selectedClip?.day || 1} video</strong>
                </a>
              ) : (
                <video src={activeClipMedia.url} controls playsInline/>
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
                    {media[0]?.type === 'video' ? <video src={media[0].url} muted playsInline /> : <svg viewBox="0 0 24 24"><polygon points="8 5 19 12 8 19 8 5"/></svg>}
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
          <div className="tour-place-strip">
            {destinations.map(destination => <button key={destination.id} className={destination.id === selectedDestination?.id ? 'active' : ''} onClick={() => selectDestination(destination)}>{destination.name}</button>)}
          </div>
        </aside>
      </div>
    </div>
  )
}
