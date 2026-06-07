import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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
  placeName?: string | null
  placeQuery?: string | null
  highlights?: string | null
  foodTips?: string | null
  gettingThere?: string | null
  tips?: string | null
}

interface VlogDetail {
  title: string
  location: string
  country: string
  description?: string | null
  itinerary: ItineraryDay[]
}

interface ItineraryTourModalProps {
  detail: VlogDetail
  activeDayIndex: number
  unlocked: boolean
  onClose: () => void
  onUnlock: () => void
  onActiveDayIndexChange: (index: number | ((current: number) => number)) => void
  mediaForDay: (day: ItineraryDay) => MediaItem[]
  openMediaModal: (title: string, items: MediaItem[], index?: number) => void
  renderMediaPreview: (item: MediaItem, title: string, autoplay?: boolean, onVideoEnded?: () => void) => ReactNode
}

const isEmbeddableVideo = (url: string) =>
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url)

const normalizePlaceKey = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const STREET_VIEW_COORDS: Record<string, { lat: number; lng: number }> = {
  'el nido': { lat: 11.1797, lng: 119.3908 },
  siargao: { lat: 9.8482, lng: 126.0458 },
  palawan: { lat: 9.8349, lng: 118.7384 },
  coron: { lat: 12.0016, lng: 120.2009 },
  cebu: { lat: 10.3157, lng: 123.8854 },
  boracay: { lat: 11.9674, lng: 121.9248 },
  baguio: { lat: 16.4023, lng: 120.596 },
  vigan: { lat: 17.5747, lng: 120.3869 },
  iloilo: { lat: 10.7202, lng: 122.5621 },
  dumaguete: { lat: 9.3068, lng: 123.3054 },
  kyoto: { lat: 34.9674, lng: 135.7727 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  bangkok: { lat: 13.7525, lng: 100.4941 },
  bali: { lat: -8.5069, lng: 115.2625 },
  paris: { lat: 48.8584, lng: 2.2945 },
  rome: { lat: 41.8902, lng: 12.4922 },
  santorini: { lat: 36.4618, lng: 25.3753 },
  'new york': { lat: 40.758, lng: -73.9855 },
  'new york city': { lat: 40.758, lng: -73.9855 },
  banff: { lat: 51.1784, lng: -115.5708 },
  'cape town': { lat: -33.9258, lng: 18.4232 },
}

const streetCoordsFor = (...values: Array<string | null | undefined>) => {
  const text = normalizePlaceKey(values.filter(Boolean).join(' '))
  return Object.entries(STREET_VIEW_COORDS).find(([key]) => text.includes(key))?.[1] || null
}

export default function ItineraryTourModal({
  detail,
  activeDayIndex,
  unlocked,
  onClose,
  onUnlock,
  onActiveDayIndexChange,
  mediaForDay,
  openMediaModal,
  renderMediaPreview,
}: ItineraryTourModalProps) {
  const reelRef = useRef<HTMLDivElement | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const visibleDays = detail.itinerary.filter(day => !day.locked || unlocked)
  const lockedCount = detail.itinerary.length - visibleDays.length
  const boundedActiveDayIndex = detail.itinerary.length
    ? Math.min(Math.max(activeDayIndex, 0), detail.itinerary.length - 1)
    : 0
  const activeDay = detail.itinerary[boundedActiveDayIndex]
  const lockedActiveDay = Boolean(activeDay?.locked && !unlocked)
  const activeDayMedia = useMemo(
    () => activeDay && !lockedActiveDay ? mediaForDay(activeDay) : [],
    [activeDay, lockedActiveDay, mediaForDay],
  )
  const activePlace = activeDay
    ? activeDay.placeQuery || activeDay.placeName || `${activeDay.activity}, ${detail.location || detail.country}`
    : `${detail.location || detail.country} itinerary`
  const activePlaceLabel = activeDay?.placeName || activeDay?.placeQuery || detail.location || detail.country
  const mapPlaceQuery = activeDay
    ? activePlace
    : `${detail.location || detail.country} itinerary`
  const mapQuery = encodeURIComponent(mapPlaceQuery)
  const streetCoords = streetCoordsFor(activePlace, activePlaceLabel, detail.location, detail.country)
  const mapUrl = streetCoords
    ? `https://maps.google.com/maps?layer=c&cbll=${streetCoords.lat},${streetCoords.lng}&cbp=12,0,0,0,0&output=svembed`
    : `https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`
  const openMapUrl = streetCoords
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetCoords.lat},${streetCoords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const activeDayNotes = activeDay && !lockedActiveDay
    ? [
        activeDay.cost ? `Estimated cost: PHP ${activeDay.cost.toLocaleString()}` : '',
        activeDay.highlights,
        activeDay.foodTips,
        activeDay.gettingThere,
        activeDay.tips,
      ].filter(Boolean)
    : []
  const panelSummary = lockedActiveDay
    ? 'Unlock this itinerary day to see the route notes and creator media.'
    : activeDay?.highlights || activeDay?.tips || detail.description || 'Follow this creator stop with map context and day-specific media.'
  const moveDay = (delta: -1 | 1) => {
    if (!detail.itinerary.length) return
    onActiveDayIndexChange(current => (current + delta + detail.itinerary.length) % detail.itinerary.length)
  }
  const scrollToMediaIndex = useCallback((index: number) => {
    const container = reelRef.current
    if (!container || !activeDayMedia.length) return

    const boundedIndex = (index + activeDayMedia.length) % activeDayMedia.length
    const nextClip = container.querySelectorAll('.itinerary-tour-media-clip')[boundedIndex] as HTMLElement | undefined
    if (nextClip) {
      container.scrollTo({ top: nextClip.offsetTop - container.offsetTop, behavior: 'smooth' })
      setActiveMediaIndex(boundedIndex)
    }
  }, [activeDayMedia.length])

  useEffect(() => {
    setActiveMediaIndex(0)
    reelRef.current?.scrollTo({ top: 0 })
  }, [boundedActiveDayIndex, activeDayMedia.length])

  useEffect(() => {
    const container = reelRef.current
    if (!container || activeDayMedia.length <= 1) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.75) return
        const index = Number((entry.target as HTMLElement).dataset.mediaIndex)
        if (Number.isFinite(index)) setActiveMediaIndex(index)
      })
    }, { root: container, threshold: 0.75 })

    container.querySelectorAll('.itinerary-tour-media-clip').forEach(clip => observer.observe(clip))
    return () => observer.disconnect()
  }, [activeDayMedia.length, boundedActiveDayIndex])

  useEffect(() => {
    if (activeDayMedia.length <= 1) return
    const activeItem = activeDayMedia[activeMediaIndex]
    if (!activeItem || activeItem.type !== 'image') return

    const timer = window.setTimeout(() => scrollToMediaIndex(activeMediaIndex + 1), 5000)
    return () => window.clearTimeout(timer)
  }, [activeDayMedia, activeMediaIndex, scrollToMediaIndex])

  useEffect(() => {
    if (activeDayMedia.length <= 1) return
    const activeItem = activeDayMedia[activeMediaIndex]
    if (!activeItem || activeItem.type !== 'video' || !isEmbeddableVideo(activeItem.url)) return

    const handleYoutubeMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes('youtube.com')) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data.event === 'onStateChange' && data.info === 0) {
          scrollToMediaIndex(activeMediaIndex + 1)
        }
      } catch {
        /* Ignore unrelated player messages. */
      }
    }

    window.addEventListener('message', handleYoutubeMessage)
    return () => window.removeEventListener('message', handleYoutubeMessage)
  }, [activeDayMedia, activeMediaIndex, scrollToMediaIndex])

  return (
    <div className="tour-modal itinerary-tour-modal" role="dialog" aria-modal="true" aria-label="Tour me itinerary">
      <div className="tour-shell itinerary-tour-shell">
        <div className="tour-map is-place">
          <div className="tour-google-stage" role="img" aria-label={`Map for ${detail.location}`}>
            <iframe className="tour-google-map" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${detail.location} itinerary map`} />
            <div className="tour-map-search">
              <span>{activePlaceLabel}</span>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </div>
            <a className="tour-map-share" href={openMapUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.8 15.4 6.2M8.6 13.2l6.8 4.6"/></svg>
              {streetCoords ? 'Street' : 'Open'}
            </a>
            <div className="itinerary-tour-route" aria-hidden="true">
              {detail.itinerary.map((day, index) => (
                <button
                  type="button"
                  key={day.id}
                  className={`itinerary-tour-pin${index === boundedActiveDayIndex ? ' active' : ''}${day.locked && !unlocked ? ' locked' : ''}`}
                  style={{ '--pin-index': index } as CSSProperties}
                  onClick={() => onActiveDayIndexChange(index)}
                  title={`${day.activity}, ${detail.location}`}
                >
                  <span>Day {day.day}</span>
                </button>
              ))}
            </div>
            {activeDay && (
              <details className="itinerary-tour-map-card" open={!lockedActiveDay}>
                <summary>
                  <span>Day {activeDay.day}</span>
                  <strong>{activeDay.activity}</strong>
                  <small>{activePlaceLabel}</small>
                </summary>
                {lockedActiveDay ? (
                  <div className="itinerary-tour-map-details">
                    <p>Unlock to see this day&apos;s full route, costs, notes, and media.</p>
                    <button type="button" onClick={onUnlock}>Unlock</button>
                  </div>
                ) : (
                  <div className="itinerary-tour-map-details">
                    {activeDayNotes.length > 0 ? (
                      activeDayNotes.map((note, index) => <p key={index}>{note}</p>)
                    ) : (
                      <p>{detail.description || 'Follow this stop with creator media and map context.'}</p>
                    )}
                  </div>
                )}
              </details>
            )}
          </div>
        </div>
        <aside className="tour-panel">
          <div className="tour-panel-sticky">
            <div className="tour-panel-head">
              <div className="tour-title-block">
                <div className="tour-kicker">TourMe Itinerary</div>
                <h2>{activeDay ? activeDay.activity : 'Day-by-day itinerary'}</h2>
                <p>{activePlaceLabel}</p>
              </div>
              <div className="tour-next-controls itinerary-tour-controls">
                <button type="button" onClick={() => moveDay(-1)} aria-label="Previous day">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" onClick={() => moveDay(1)} aria-label="Next day">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <button className="tour-close" onClick={onClose} aria-label="Close itinerary tour">x</button>
            </div>
            <p className="tour-destination-summary">{panelSummary}</p>
          </div>
          <div ref={reelRef} className="tour-tiktok-container itinerary-tour-media-reel" aria-label={activeDay ? `Day ${activeDay.day} media` : 'Itinerary media'}>
            {activeDay && lockedActiveDay ? (
              <div className="tour-empty-clips itinerary-tour-empty">
                <strong>{lockedCount} locked day{lockedCount > 1 ? 's' : ''}</strong>
                <span>Unlock the itinerary to tour every stop.</span>
                <button type="button" onClick={onUnlock}>Unlock</button>
              </div>
            ) : activeDayMedia.length > 0 ? (
              activeDayMedia.map((item, index) => (
                <div key={`${item.url}-${index}`} className="tour-tiktok-clip itinerary-tour-media-clip" data-media-index={index}>
                  <button
                    type="button"
                    className="itinerary-tour-open-media"
                    onClick={() => openMediaModal(`Day ${activeDay?.day || boundedActiveDayIndex + 1} photos & videos`, activeDayMedia, index)}
                    aria-label={`Open media ${index + 1} of ${activeDayMedia.length}`}
                  />
                  <div className="tour-tiktok-video">
                    {renderMediaPreview(
                      item,
                      `Day ${activeDay?.day || boundedActiveDayIndex + 1} itinerary media`,
                      index === activeMediaIndex,
                      () => scrollToMediaIndex(index + 1),
                    )}
                  </div>
                  <div className="tour-tiktok-overlay">
                    <div className="tour-tiktok-info">
                      <div className="tour-tiktok-author">
                        <div className="tour-tiktok-avatar" style={{ background: 'var(--g)' }}>D{activeDay?.day}</div>
                        <span className="tour-tiktok-handle">Day {activeDay?.day} of {detail.itinerary.length}</span>
                        <span className="tour-tiktok-verified">✓</span>
                      </div>
                      <h3 className="tour-tiktok-title">{activeDay?.activity}</h3>
                      <p className="tour-tiktok-description">{activePlaceLabel}</p>
                      <div className="tour-tiktok-location">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {item.type === 'video' ? 'Video clip' : 'Photo'}
                      </div>
                    </div>
                  </div>
                  <div className="tour-tiktok-counter">
                    {index + 1} / {activeDayMedia.length}
                  </div>
                </div>
              ))
            ) : (
              <div className="tour-empty-clips itinerary-tour-empty">No photos or videos for this day yet.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
