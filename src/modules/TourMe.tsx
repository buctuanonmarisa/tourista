'use client'

import type { CSSProperties } from 'react'
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
  day: { day: number }
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
  streetLat?: number
  streetLng?: number
  hasStreetView: boolean
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

interface TourAreaClip {
  id: string
  url: string
  title: string
  description?: string | null
  day: number
  vlogId: string
  vlogTitle: string
  location: string
  country: string
  coverImage?: string | null
  author: VlogAuthor
  views: number
  likes: number
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
  'el nido': { lat: 11.17307562502276, lng: 119.3950475274839 },
  coron: { lat: 12.0016, lng: 120.2009 },
  cebu: { lat: 10.3157, lng: 123.8854 },
  boracay: { lat: 11.9674, lng: 121.9248 },
  baguio: { lat: 16.4023, lng: 120.596 },
  vigan: { lat: 17.5747, lng: 120.3869 },
  iloilo: { lat: 10.7202, lng: 122.5621 },
  dumaguete: { lat: 9.3068, lng: 123.3054 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 34.97131910400563, lng: 135.77866553169181 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  hiroshima: { lat: 34.3853, lng: 132.4553 },
  hokkaido: { lat: 43.2203, lng: 142.8635 },
  nara: { lat: 34.6851, lng: 135.8048 },
  kobe: { lat: 34.6901, lng: 135.1955 },
  fukuoka: { lat: 33.5902, lng: 130.4017 },
  bangkok: { lat: 13.753597290416279, lng: 100.49182275558415 },
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
  bali: { lat: -8.590959828681374, lng: 115.08592107881513 },
  ubud: { lat: -8.5069, lng: 115.2625 },
  seminyak: { lat: -8.6913, lng: 115.1682 },
  lombok: { lat: -8.65, lng: 116.3249 },
  flores: { lat: -8.6574, lng: 121.0794 },
  yogyakarta: { lat: -7.7956, lng: 110.3695 },
  rome: { lat: 41.89930661187925, lng: 12.477098843150232 },
  paris: { lat: 48.859697126192614, lng: 2.2943954674158236 },
  london: { lat: 51.5072, lng: -0.1276 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  santorini: { lat: 36.41909126407468, lng: 25.43215848592153 },
  'new york': { lat: 40.58698870663118, lng: -73.94609869695802 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  banff: { lat: 51.50475402823146, lng: -115.92736956972638 },
  'cape town': { lat: -33.891354246580676, lng: 18.42668549225774 },
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
  greece: { lat: 39.0742, lng: 21.8243 },
  canada: { lat: 56.1304, lng: -106.3468 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
}

const fallbackAuthor: VlogAuthor = {
  id: 'tourista-curated',
  handle: 'tourista',
  initials: 'TR',
  avatarColor: 'ag',
  verified: true,
}

const TOUR_ME_TRAVEL_DURATION_MS = 3000
const TOUR_ME_TRAVEL_DURATION_SECONDS = TOUR_ME_TRAVEL_DURATION_MS / 1000

interface CuratedCountryStop {
  country: string
  name: string
  lat: number
  lng: number
  streetLat?: number
  streetLng?: number
  reason: string
}

const CURATED_COUNTRY_STOPS: CuratedCountryStop[] = [
  { country: 'Philippines', name: 'El Nido', lat: 11.17307562502276, lng: 119.3950475274839, streetLat: 11.1797, streetLng: 119.3908, reason: 'Island lagoons, limestone cliffs, and clear water' },
  { country: 'Japan', name: 'Kyoto', lat: 34.97131910400563, lng: 135.77866553169181, streetLat: 34.9674, streetLng: 135.7727, reason: 'Temples, old streets, gardens, and seasonal beauty' },
  { country: 'Thailand', name: 'Bangkok', lat: 13.753597290416279, lng: 100.49182275558415, streetLat: 13.7525, streetLng: 100.4941, reason: 'Street food, temples, markets, and nightlife' },
  { country: 'Indonesia', name: 'Bali', lat: -8.590959828681374, lng: 115.08592107881513, streetLat: -8.5069, streetLng: 115.2625, reason: 'Beaches, rice terraces, temples, and surf culture' },
  { country: 'France', name: 'Paris', lat: 48.859697126192614, lng: 2.2943954674158236, streetLat: 48.8584, streetLng: 2.2945, reason: 'Museums, cafes, architecture, and classic city walks' },
  { country: 'Italy', name: 'Rome', lat: 41.89930661187925, lng: 12.477098843150232, streetLat: 41.8902, streetLng: 12.4922, reason: 'Ancient landmarks, piazzas, and food neighborhoods' },
  { country: 'Greece', name: 'Santorini', lat: 36.41909126407468, lng: 25.43215848592153, streetLat: 36.4618, streetLng: 25.3753, reason: 'Caldera views, white villages, and sunset viewpoints' },
  { country: 'USA', name: 'New York City', lat: 40.58698870663118, lng: -73.94609869695802, streetLat: 40.758, streetLng: -73.9855, reason: 'Skyline walks, food, museums, and city energy' },
  { country: 'Canada', name: 'Banff', lat: 51.50475402823146, lng: -115.92736956972638, streetLat: 51.1784, streetLng: -115.5708, reason: 'Turquoise lakes, mountain trails, and wildlife views' },
  { country: 'South Africa', name: 'Cape Town', lat: -33.891354246580676, lng: 18.42668549225774, streetLat: -33.9258, streetLng: 18.4232, reason: 'Table Mountain, coast roads, penguins, and wine country' },
]

const makeTourAudioDataUrl = () => {
  const sampleRate = 44100
  const duration = 10
  const sampleCount = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, sampleCount * 2, true)

  const notes = [
    { frequency: 146.83, start: 0, end: 9.8, gain: 0.12 },
    { frequency: 220, start: 0.9, end: 9.4, gain: 0.1 },
    { frequency: 523.25, start: 3.1, end: 3.32, gain: 0.3 },
    { frequency: 659.25, start: 3.6, end: 3.82, gain: 0.26 },
    { frequency: 783.99, start: 4.1, end: 4.32, gain: 0.24 },
    { frequency: 987.77, start: 4.6, end: 4.82, gain: 0.22 },
    { frequency: 587.33, start: 5.1, end: 5.32, gain: 0.24 },
    { frequency: 739.99, start: 5.6, end: 5.82, gain: 0.22 },
    { frequency: 880, start: 6.1, end: 6.32, gain: 0.22 },
    { frequency: 1046.5, start: 6.6, end: 6.82, gain: 0.2 },
    { frequency: 1174.66, start: 7.1, end: 7.32, gain: 0.2 },
    { frequency: 1318.51, start: 7.6, end: 7.95, gain: 0.24 },
  ]

  for (let i = 0; i < sampleCount; i += 1) {
    const time = i / sampleRate
    const value = notes.reduce((sum, note, index) => {
      if (time < note.start || time > note.end) return sum
      const local = (time - note.start) / (note.end - note.start)
      const envelope = Math.sin(Math.PI * local)
      return sum + Math.sin(2 * Math.PI * note.frequency * time) * envelope * note.gain
    }, 0)
    const sweep = Math.sin(2 * Math.PI * (320 + time * 62) * time) * Math.sin(Math.PI * Math.min(1, time / 2)) * Math.sin(Math.PI * Math.min(1, (10 - time) / 1.6)) * 0.045
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, value + sweep)) * 0x7fff, true)
  }

  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return `data:audio/wav;base64,${btoa(binary)}`
}

export const playTourMeIntroAudio = () => {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(makeTourAudioDataUrl())
    ;(window as typeof window & { tourMeIntroAudio?: HTMLAudioElement }).tourMeIntroAudio = audio
    audio.muted = false
    audio.volume = 1
    audio.currentTime = 0
    void audio.play().catch(() => {
      window.setTimeout(() => {
        void audio.play().catch(() => undefined)
      }, 80)
    })
  } catch {
    /* Fall back to Web Audio below. */
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return
  try {
    const context = new AudioContextCtor()
    void context.resume()
    const startedAt = context.currentTime + 0.02
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, startedAt)
    master.gain.exponentialRampToValueAtTime(0.55, startedAt + 0.05)
    master.gain.exponentialRampToValueAtTime(0.0001, startedAt + 10)
    master.connect(context.destination)

    const tone = (frequency: number, start: number, duration: number, volume = 0.28, type: OscillatorType = 'sine') => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startedAt + start)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.12, startedAt + start + duration)
      gain.gain.setValueAtTime(0.0001, startedAt + start)
      gain.gain.exponentialRampToValueAtTime(volume, startedAt + start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + start + duration)
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(startedAt + start)
      oscillator.stop(startedAt + start + duration + 0.04)
    }

    tone(146.83, 0, 9.7, 0.13, 'triangle')
    tone(220, 0.9, 8.5, 0.11, 'sine')
    ;[523.25, 659.25, 783.99, 987.77, 587.33, 739.99, 880, 1046.5, 1174.66, 1318.51].forEach((frequency, index) => {
      tone(frequency, 3.1 + index * 0.5, index === 9 ? 0.36 : 0.22, index === 9 ? 0.24 : 0.2)
    })
    tone(320, 4.4, 4.9, 0.09, 'sawtooth')
    window.setTimeout(() => context.close().catch(() => undefined), 10400)
  } catch {
    /* Some browsers mute generated audio until a direct user gesture. */
  }
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
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : ''
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

const worldMapTiles = Array.from({ length: 4 }, (_, index) => {
  const x = index % 2
  const y = Math.floor(index / 2)
  return {
    key: `world-1-${x}-${y}`,
    url: `https://tile.openstreetmap.org/1/${x}/${y}.png`,
    left: `${x * 50}%`,
    top: `${y * 50}%`,
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
  if (!destination.hasStreetView || destination.streetLat == null || destination.streetLng == null) return ''
  return `https://maps.google.com/maps?layer=c&cbll=${destination.streetLat},${destination.streetLng}&cbp=12,0,0,0,0&output=svembed`
}

const googleStreetViewOpenUrl = (destination?: TourDestination | null) => {
  if (!destination) return '#'
  const lat = destination.streetLat ?? destination.lat
  const lng = destination.streetLng ?? destination.lng
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
}

const mediaForDay = (day: ItineraryDay): MediaItem[] => {
  if (Array.isArray(day.media) && day.media.length) return day.media.filter(item => Boolean(item.url))
  if (day.mediaUrl) return [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' : 'image' }]
  return []
}

const clipLabelFor = (day: ItineraryDay, index: number) => {
  const mediaCount = mediaForDay(day).length
  return mediaCount > 1 ? `${day.activity} clip ${index + 1}` : day.activity
}

const routeCurvePath = (from: TourDestination, to: TourDestination, index: number) => {
  const midX = (from.pin.x + to.pin.x) / 2
  const midY = (from.pin.y + to.pin.y) / 2
  const dx = to.pin.x - from.pin.x
  const dy = to.pin.y - from.pin.y
  const distance = Math.max(1, Math.hypot(dx, dy))
  const sweep = index % 2 === 0 ? 1 : -1
  const lift = Math.min(18, Math.max(7, distance * 0.18))
  const controlX = Math.min(96, Math.max(4, midX - (dy / distance) * lift * sweep))
  const controlY = Math.min(94, Math.max(6, midY + (dx / distance) * lift * sweep - 2))
  return `M ${from.pin.x.toFixed(2)} ${from.pin.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.pin.x.toFixed(2)} ${to.pin.y.toFixed(2)}`
}

const conciseDestinationCopy = (destination?: TourDestination | null) => {
  if (!destination) return 'A curated Tourista stop with creator clips and map context.'
  const base = destination.reason || destination.description || `${destination.name} is a curated Tourista destination.`
  const firstSentence = base.split(/(?<=[.!?])\s+/)[0] || base
  return firstSentence.length > 118 ? `${firstSentence.slice(0, 115).trim()}...` : firstSentence
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
  const [areaClips, setAreaClips] = useState<TourAreaClip[]>([])
  const [travelCue, setTravelCue] = useState<{ key: number; direction: 1 | -1; from: string; to: string; fromDest: TourDestination; toDest: TourDestination } | null>(null)
  const [currentClipIndex, setCurrentClipIndex] = useState(0)
  const travelTimerRef = useRef<number | null>(null)
  const lastAudioOpenRef = useRef(false)
  const clipsContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const videoEndHandlersRef = useRef<Map<string, () => void>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const destinations = useMemo<TourDestination[]>(() => {
    const rankedVlogs = [...vlogs].sort((a, b) => destinationScore(b) - destinationScore(a))

    return CURATED_COUNTRY_STOPS.map((stop, index) => {
      const stopKey = normalizeLocationKey(stop.name)
      const countryKey = normalizeLocationKey(stop.country)
      const vlog =
        rankedVlogs.find(candidate => {
          const text = normalizeLocationKey(`${candidate.title} ${candidate.location} ${candidate.country || ''}`)
          return text.includes(stopKey) && text.includes(countryKey)
        }) ||
        rankedVlogs.find(candidate => {
          const text = normalizeLocationKey(`${candidate.location} ${candidate.country || ''}`)
          return text.includes(countryKey)
        })
      // Always use the curated coordinates from CURATED_COUNTRY_STOPS
      const coords = { lat: stop.lat, lng: stop.lng }
      return {
        id: vlog?.id || `curated-${stop.country.toLowerCase().replace(/\s+/g, '-')}`,
        title: vlog?.title || `${stop.name}: Best spot in ${stop.country}`,
        name: stop.name,
        city: stop.name,
        country: stop.country,
        lat: coords.lat,
        lng: coords.lng,
        streetLat: stop.streetLat,
        streetLng: stop.streetLng,
        hasStreetView: Boolean(stop.streetLat && stop.streetLng),
        views: vlog?.views || 0,
        likes: vlog?.likes || 0,
        author: vlog?.author || fallbackAuthor,
        description: stop.reason,
        coverImage: vlog?.coverImage || youtubeThumbForUrl(vlog?.youtubeUrl),
        youtubeUrl: vlog?.youtubeUrl,
        pin: pinForCoords(coords),
        rank: index + 1,
        score: vlog ? destinationScore(vlog) : CURATED_COUNTRY_STOPS.length - index,
        reason: stop.reason,
      }
    })
  }, [vlogs])
  const topDestination = destinations[0]
  const selectedDestination = destinations.find(destination => destination.id === vlogId) || topDestination
  const displayedDestination = stage === 'world' ? topDestination : selectedDestination
  const displayedDescription = stage === 'world'
    ? 'A 10-stop world route built from Tourista creator recommendations. Start at the first stop, then follow each pin in order.'
    : conciseDestinationCopy(selectedDestination)
  const itinerary = detail && selectedDestination && detail.id === selectedDestination.id ? detail.itinerary : []
  const mapTarget = selectedDestination || { lat: 14.5995, lng: 120.9842 }
  const mapTiles = mapTilesForCoords(mapTarget.lat, mapTarget.lng)
  const googleMapUrl = googleMapEmbedUrl(selectedDestination)
  const googleOpenUrl = googleMapOpenUrl(selectedDestination)
  const googleStreetUrl = googleStreetViewEmbedUrl(selectedDestination)
  const googleStreetOpenUrl = googleStreetViewOpenUrl(selectedDestination)
  const activeMapUrl = mapMode === 'street' && googleStreetUrl ? googleStreetUrl : googleMapUrl
  const clipItems = itinerary.length
    ? itinerary
    : selectedDestination
      ? [{ id: selectedDestination.id, day: { day: 1 }, activity: selectedDestination.title, locked: false, highlights: selectedDestination.description || 'Open this destination from a live Tourista vlog.', cost: null, mediaUrl: null, mediaType: null, media: null, foodTips: null, gettingThere: null, tips: null }]
      : []
  const selectedClip = clipItems.find(day => day.id === clipId) || clipItems[0]
  const fallbackAreaClips: TourAreaClip[] = clipItems.flatMap(day =>
    mediaForDay(day)
      .filter(item => item.type === 'video')
      .map((item, index) => ({
        id: `${day.id}-${index}`,
        url: item.url,
        title: clipLabelFor(day, index),
        description: day.highlights || day.tips || selectedDestination?.title || '',
        day: typeof day.day === 'number' ? day.day : day.day.day,
        vlogId: selectedDestination?.id || '',
        vlogTitle: selectedDestination?.title || '',
        location: `${selectedDestination?.city || ''}, ${selectedDestination?.country || ''}`,
        country: selectedDestination?.country || '',
        coverImage: selectedDestination?.coverImage || '',
        author: selectedDestination?.author || fallbackAuthor,
        views: selectedDestination?.views || 0,
        likes: selectedDestination?.likes || 0,
      })),
  )
  const displayedAreaClips = areaClips.length ? areaClips : fallbackAreaClips

  const scrollToClipIndex = useCallback((index: number) => {
    const container = clipsContainerRef.current
    if (!container || !displayedAreaClips.length) return
    const boundedIndex = (index + displayedAreaClips.length) % displayedAreaClips.length
    const clipElements = container.querySelectorAll('.tour-tiktok-clip')
    const nextElement = clipElements[boundedIndex] as HTMLElement | undefined
    if (nextElement) {
      nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentClipIndex(boundedIndex)
      setClipId(displayedAreaClips[boundedIndex].id)
    }
  }, [displayedAreaClips])

  const loadAreaClips = useCallback(async (destination: TourDestination) => {
    try {
      const params = new URLSearchParams({ spot: destination.name, country: destination.country })
      const response = await fetch(`/api/tourme/clips?${params.toString()}`)
      if (!response.ok) {
        setAreaClips([])
        return
      }
      const data: { clips?: TourAreaClip[] } = await response.json()
      setAreaClips(Array.isArray(data.clips) ? data.clips : [])
    } catch {
      setAreaClips([])
    }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    if (!id || id.startsWith('curated-')) return
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
    loadAreaClips(destination)
    setMapMode(destination.hasStreetView ? 'street' : 'map')
    setStage('place')
  }, [loadAreaClips, loadDetail])

  const playNextClip = useCallback(() => {
    if (!displayedAreaClips.length) return
    const currentIndex = displayedAreaClips.findIndex(clip => clip.id === clipId)
    scrollToClipIndex(currentIndex + 1)
  }, [clipId, displayedAreaClips, scrollToClipIndex])

  const moveDestination = (direction: 1 | -1) => {
    if (!destinations.length || !selectedDestination) return
    const currentIndex = destinations.findIndex(destination => destination.id === selectedDestination.id)
    const nextIndex = (Math.max(0, currentIndex) + direction + destinations.length) % destinations.length
    const nextDestination = destinations[nextIndex]
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)

    // First, update the selected destination immediately for pin highlighting
    setVlogId(nextDestination.id)

    // Show world map with travel animation
    setTravelCue({
      key: Date.now(),
      direction,
      from: selectedDestination.name,
      to: nextDestination.name,
      fromDest: selectedDestination,
      toDest: nextDestination
    })
    setMapMode('map')
    setStage('world')

    // After the travel animation, switch to the new destination with full details.
    travelTimerRef.current = window.setTimeout(() => {
      setClipId('')
      setDetail(null)
      loadDetail(nextDestination.id)
      loadAreaClips(nextDestination)
      setMapMode(nextDestination.hasStreetView ? 'street' : 'map')
      setStage('place')
      setTravelCue(null)
      travelTimerRef.current = null
    }, TOUR_ME_TRAVEL_DURATION_MS)
  }

  useEffect(() => {
    if (!travelCue) return
    const timer = window.setTimeout(() => setTravelCue(null), TOUR_ME_TRAVEL_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [travelCue])

  useEffect(() => {
    return () => {
      if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (open && !lastAudioOpenRef.current) {
      playTourMeIntroAudio()
      lastAudioOpenRef.current = true
    }
    if (!open) lastAudioOpenRef.current = false
  }, [open])

  useEffect(() => {
    if (!destinations.length) return
    if (!vlogId || !destinations.some(destination => destination.id === vlogId)) {
      setVlogId(destinations[0].id)
    }
  }, [destinations, vlogId])

  useEffect(() => {
    if (!open) return
    setStage('world')
    setCurrentClipIndex(0)
    if (destinations[0]) {
      setVlogId(destinations[0].id)
      loadDetail(destinations[0].id)
      loadAreaClips(destinations[0])
    }
  }, [destinations, loadAreaClips, loadDetail, open])

  // TikTok-style intersection observer for autoplay
  useEffect(() => {
    if (!displayedAreaClips.length || stage !== 'place') return

    const options = {
      root: clipsContainerRef.current,
      threshold: 0.75, // 75% of video must be visible
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLElement
        const clipId = videoElement.dataset.clipId
        if (!clipId) return

        const video = videoRefs.current.get(clipId)

        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          // Pause all other videos
          videoRefs.current.forEach((v, id) => {
            if (id !== clipId) {
              v.pause()
            }
          })

          if (video) {
            video.muted = false
            video.volume = 1
            video.play().catch(() => {
              // Autoplay might be blocked, user needs to interact first
            })
          }

          // Update current clip index
          const index = displayedAreaClips.findIndex(c => c.id === clipId)
          if (index !== -1) {
            setCurrentClipIndex(index)
            setClipId(clipId)
          }
        } else {
          // Pause when out of view
          if (video) {
            video.pause()
          }
        }
      })
    }, options)

    clipsContainerRef.current?.querySelectorAll('.tour-tiktok-clip').forEach(clip => {
      observerRef.current?.observe(clip)
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [displayedAreaClips, stage])

  useEffect(() => {
    if (!displayedAreaClips.length || stage !== 'place') return

    const handleYoutubeMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return
      if (!String(event.origin).includes('youtube.com')) return

      try {
        const data = JSON.parse(event.data)
        if (data.event === 'onStateChange' && data.info === 0) {
          const currentIndex = displayedAreaClips.findIndex(clip => clip.id === clipId)
          scrollToClipIndex(currentIndex + 1)
        }
      } catch {
        /* Ignore unrelated player messages. */
      }
    }

    window.addEventListener('message', handleYoutubeMessage)
    return () => window.removeEventListener('message', handleYoutubeMessage)
  }, [clipId, displayedAreaClips, scrollToClipIndex, stage])

  // Auto-advance to next clip when video ends
  useEffect(() => {
    const handleVideoEnd = (clipId: string) => {
      const currentIndex = displayedAreaClips.findIndex(c => c.id === clipId)
      scrollToClipIndex(currentIndex + 1)
    }

    const videoRefsMap = videoRefs.current
    const videoEndHandlersMap = videoEndHandlersRef.current

    videoEndHandlersMap.forEach((handler, clipId) => {
      const video = videoRefsMap.get(clipId)
      if (video) video.removeEventListener('ended', handler)
    })
    videoEndHandlersMap.clear()

    // Add ended listeners to all videos
    videoRefsMap.forEach((video, clipId) => {
      const handler = () => handleVideoEnd(clipId)
      video.addEventListener('ended', handler)
      videoEndHandlersMap.set(clipId, handler)
    })

    return () => {
      videoEndHandlersMap.forEach((handler, clipId) => {
        const video = videoRefsMap.get(clipId)
        if (video) video.removeEventListener('ended', handler)
      })
      videoEndHandlersMap.clear()
    }
  }, [displayedAreaClips, scrollToClipIndex])

  if (!open) return null

  return (
    <div className="tour-modal" role="dialog" aria-modal="true" aria-label="Tour me">
      <div className="tour-shell">
        <div className={`tour-map ${stage === 'world' ? 'is-world' : 'is-place'}`}>
          {stage === 'world' ? (
            <div className="tour-world">
              <div className="tour-globe" aria-hidden="true">
                <div className="tour-globe-map">
                  {[0, 1].map(copy => (
                    <div key={copy} className="tour-globe-strip" style={{ left: `${copy * 100}%`, right: 'auto', width: '100%' }}>
                      {worldMapTiles.map(tile => <img key={`${copy}-${tile.key}`} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="eager" />)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tour-world-map" aria-hidden="true">
                {worldMapTiles.map(tile => <img key={tile.key} src={tile.url} style={{ left: tile.left, top: tile.top }} alt="" loading="eager" />)}
              </div>
              <svg className="tour-world-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <marker id="tourRouteArrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
                    <path d="M 0 1.5 L 8 5 L 0 8.5" fill="none" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                  <marker id="tourRouteArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
                    <path d="M 0 1.5 L 8 5 L 0 8.5" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                </defs>
                {travelCue && travelCue.fromDest && travelCue.toDest && (
                  <g key={travelCue.key} className="tour-travel-route">
                    <path
                      className="tour-travel-route-underlay"
                      d={routeCurvePath(travelCue.fromDest, travelCue.toDest, 0)}
                    />
                    <path
                      className="tour-travel-route-path"
                      d={routeCurvePath(travelCue.fromDest, travelCue.toDest, 0)}
                      markerEnd="url(#tourRouteArrowGreen)"
                    />
                    <circle className="tour-travel-plane-marker" r="1.6" fill="#e53935">
                      <animateMotion dur={`${Math.max(1.2, TOUR_ME_TRAVEL_DURATION_SECONDS - 0.5)}s`} fill="freeze" calcMode="spline" keySplines="0.34 0.46 0.64 0.94" path={routeCurvePath(travelCue.fromDest, travelCue.toDest, 0)} />
                    </circle>
                  </g>
                )}
              </svg>
              <div className="tour-world-pins">
                {destinations.map((destination, index) => {
                  const isTravelFrom = travelCue && destination.id === travelCue.fromDest?.id
                  const isTravelTo = travelCue && destination.id === travelCue.toDest?.id
                  return (
                    <button
                      key={destination.id}
                      className={`tour-pin${destination.id === selectedDestination?.id ? ' active' : ''}${destination.id === topDestination?.id ? ' hot' : ''}${isTravelFrom ? ' travel-from' : ''}${isTravelTo ? ' travel-to' : ''}`}
                      style={{ left:`${destination.pin.x}%`, top:`${destination.pin.y}%`, '--pin-order': index } as CSSProperties}
                      onClick={() => selectDestination(destination)}
                      title={`${destination.name}, ${destination.country}`}
                    >
                      <span>{destination.rank}</span>
                      <small>{destination.name}</small>
                    </button>
                  )
                })}
              </div>
              <div className="tour-plane" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              <div className="tour-scan-card"><strong>Connected routes</strong><span>Follow the arrows between pinned destinations</span></div>
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
                  <button type="button" className={mapMode === 'street' ? 'active' : ''} onClick={() => selectedDestination?.hasStreetView ? setMapMode('street') : setMapMode('map')} disabled={!selectedDestination?.hasStreetView}>Street</button>
                </div>
                {mapMode === 'map' && activeMapUrl && selectedDestination?.hasStreetView && (
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
          <div className="tour-panel-sticky">
              <div className="tour-panel-head">
                <div className="tour-title-block"><div className="tour-kicker">{stage === 'world' ? 'Clip route finder' : 'Clips in this spot'}</div><h2>{displayedDestination?.name || 'Live destinations'}</h2><p>{displayedDestination ? `${displayedDestination.city}, ${displayedDestination.country}` : 'Loading Tourista vlogs'}</p></div>
            {stage !== 'world' && (
              <div className="tour-next-controls">
                <button type="button" onClick={() => moveDestination(-1)} aria-label="Previous destination">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" onClick={() => moveDestination(1)} aria-label="Next destination">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}
            <button className="tour-close" onClick={onClose} aria-label="Close tour me">×</button>
          </div>
          <p className="tour-destination-summary">{displayedDescription}</p>
          </div>
          {/* TikTok-style vertical scrolling clips */}
          {stage === 'place' && displayedAreaClips.length > 0 ? (
            <div ref={clipsContainerRef} className="tour-tiktok-container">
              {displayedAreaClips.map((clip, index) => {
                const embedUrl = getEmbedUrl(clip.url)
                return (
                  <div
                    key={clip.id}
                    className="tour-tiktok-clip"
                    data-clip-id={clip.id}
                    ref={(el) => {
                      if (el && observerRef.current) {
                        observerRef.current.observe(el)
                      }
                    }}
                  >
                    <div className="tour-tiktok-video">
                      {isDirectVideoUrl(clip.url) ? (
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current.set(clip.id, el)
                          }}
                          src={clip.url}
                          playsInline
                          muted={false}
                          autoPlay={index === currentClipIndex}
                          className="tour-tiktok-video-element"
                        />
                      ) : embedUrl ? (
                        <iframe
                          src={`${embedUrl}&autoplay=${index === currentClipIndex ? '1' : '0'}&mute=0&loop=0&controls=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={clip.title}
                          className="tour-tiktok-video-element"
                        />
                      ) : null}
                    </div>

                    {/* Overlay info */}
                    <div className="tour-tiktok-overlay">
                      <div className="tour-tiktok-info">
                        <div className="tour-tiktok-author">
                          <div className="tour-tiktok-avatar" style={{ background: `var(--${clip.author.avatarColor})` }}>
                            {clip.author.initials}
                          </div>
                          <span className="tour-tiktok-handle">@{clip.author.handle}</span>
                          {clip.author.verified && <span className="tour-tiktok-verified">✓</span>}
                        </div>
                        <h3 className="tour-tiktok-title">{clip.title}</h3>
                        <p className="tour-tiktok-description">{clip.description}</p>
                        <div className="tour-tiktok-location">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {clip.location}
                        </div>
                      </div>

                      {/* Side actions */}
                      <div className="tour-tiktok-actions">
                        <button className="tour-tiktok-action-btn">
                          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span>{shortCount(clip.likes)}</span>
                        </button>
                        <button className="tour-tiktok-action-btn">
                          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/>
                          </svg>
                          <span>{shortCount(clip.views)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Clip counter */}
                    <div className="tour-tiktok-counter">
                      {index + 1} / {displayedAreaClips.length}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : stage === 'world' ? (
            <div className="tour-destination-list" aria-label="Tour route destinations">
              {destinations.map(destination => (
                <button
                  key={destination.id}
                  type="button"
                  className={`tour-destination-row${destination.id === selectedDestination?.id ? ' active' : ''}`}
                  onClick={() => selectDestination(destination)}
                >
                  <span className="tour-destination-rank">{destination.rank}</span>
                  <span className="tour-destination-copy">
                    <strong>{destination.name}</strong>
                    <small>{destination.country}</small>
                    <em>{conciseDestinationCopy(destination)}</em>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="tour-empty-clips">No short clips available for this destination yet.</div>
          )}
        </aside>
      </div>
    </div>
  )
}
