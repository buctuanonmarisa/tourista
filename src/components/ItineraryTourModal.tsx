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
  renderMediaPreview: (item: MediaItem, title: string, autoplay?: boolean) => ReactNode
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
  const visibleDays = detail.itinerary.filter(day => !day.locked || unlocked)
  const lockedCount = detail.itinerary.length - visibleDays.length
  const boundedActiveDayIndex = detail.itinerary.length
    ? Math.min(Math.max(activeDayIndex, 0), detail.itinerary.length - 1)
    : 0
  const activeDay = detail.itinerary[boundedActiveDayIndex]
  const lockedActiveDay = Boolean(activeDay?.locked && !unlocked)
  const activeDayMedia = activeDay && !lockedActiveDay ? mediaForDay(activeDay) : []
  const mapPlaceQuery = activeDay
    ? `${activeDay.activity}, ${detail.location || detail.country}`
    : `${detail.location || detail.country} itinerary`
  const mapQuery = encodeURIComponent(mapPlaceQuery)
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&layer=c&z=16&output=svembed`
  const openMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
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

  return (
    <div className="tour-modal itinerary-tour-modal" role="dialog" aria-modal="true" aria-label="Tour me itinerary">
      <div className="tour-shell itinerary-tour-shell">
        <div className="tour-map is-place">
          <div className="tour-google-stage" role="img" aria-label={`Map for ${detail.location}`}>
            <iframe className="tour-google-map" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${detail.location} itinerary map`} />
            <div className="tour-map-search">
              <span>{detail.location}</span>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </div>
            <a className="tour-map-share" href={openMapUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.8 15.4 6.2M8.6 13.2l6.8 4.6"/></svg>
              Open
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
                  <small>{detail.location}</small>
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
                <p>{detail.location}</p>
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
          <div className="tour-tiktok-container itinerary-tour-media-reel" aria-label={activeDay ? `Day ${activeDay.day} media` : 'Itinerary media'}>
            {activeDay && lockedActiveDay ? (
              <div className="tour-empty-clips itinerary-tour-empty">
                <strong>{lockedCount} locked day{lockedCount > 1 ? 's' : ''}</strong>
                <span>Unlock the itinerary to tour every stop.</span>
                <button type="button" onClick={onUnlock}>Unlock</button>
              </div>
            ) : activeDayMedia.length > 0 ? (
              activeDayMedia.map((item, index) => (
                <div key={`${item.url}-${index}`} className="tour-tiktok-clip itinerary-tour-media-clip">
                  <button
                    type="button"
                    className="itinerary-tour-open-media"
                    onClick={() => openMediaModal(`Day ${activeDay?.day || boundedActiveDayIndex + 1} photos & videos`, activeDayMedia, index)}
                    aria-label={`Open media ${index + 1} of ${activeDayMedia.length}`}
                  />
                  <div className="tour-tiktok-video">
                    {renderMediaPreview(item, `Day ${activeDay?.day || boundedActiveDayIndex + 1} itinerary media`, index === 0)}
                  </div>
                  <div className="tour-tiktok-overlay">
                    <div className="tour-tiktok-info">
                      <div className="tour-tiktok-author">
                        <div className="tour-tiktok-avatar" style={{ background: 'var(--g)' }}>D{activeDay?.day}</div>
                        <span className="tour-tiktok-handle">Day {activeDay?.day} of {detail.itinerary.length}</span>
                        <span className="tour-tiktok-verified">✓</span>
                      </div>
                      <h3 className="tour-tiktok-title">{activeDay?.activity}</h3>
                      <p className="tour-tiktok-description">{detail.location}</p>
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
