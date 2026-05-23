'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * DASHBOARD MODULE
 *
 * Handles:
 * - My vlogs list and management
 * - Vlog analytics (views, likes, unlocks)
 * - Vlog details viewing
 * - Vlog editing
 * - Vlog deletion
 * - Draft management
 * - Performance metrics
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

interface DashboardProps {
  onViewDetail: (vlogId: string) => void
}

export default function Dashboard({ onViewDetail }: DashboardProps) {
  // ─── State ───
  const [myVlogs, setMyVlogs] = useState<VlogCard[]>([])
  const [selectedVlogId, setSelectedVlogId] = useState<string | null>(null)
  const [vlog, setVlog] = useState<VlogDetail | null>(null)
  const [mode, setMode] = useState<'list' | 'details' | 'edit'>('list')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  // ─── API Calls ───
  const fetchMyVlogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/vlogs?myVlogs=true')
      if (!res.ok) throw new Error('Failed to fetch vlogs')
      const data: VlogCard[] = await res.json()
      setMyVlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading vlogs')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVlogDetails = useCallback(async (vlogId: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/vlogs/${vlogId}`)
      if (!res.ok) throw new Error('Failed to fetch vlog details')
      const data: VlogDetail = await res.json()
      setVlog(data)
      setLikeCount(data.likes)
      setLiked(false)
      setUnlocked(false)
      setReviewText('')
      setMode('details')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading vlog')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteVlog = async () => {
    if (!selectedVlogId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/vlogs/${selectedVlogId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete vlog')
      setMyVlogs((prev) => prev.filter((v) => v.id !== selectedVlogId))
      setSelectedVlogId(null)
      setVlog(null)
      setMode('list')
      setDeleteConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting vlog')
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async () => {
    if (!selectedVlogId) return
    try {
      const res = await fetch(`/api/vlogs/${selectedVlogId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle like')
      const data = await res.json()
      setLikeCount(data.likes)
      setLiked(!liked)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling like')
    }
  }

  const submitReview = async () => {
    if (!selectedVlogId || !reviewText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/vlogs/${selectedVlogId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, text: reviewText }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      setReviewText('')
      setReviewRating(5)
      // Refresh vlog details to show new review
      await fetchVlogDetails(selectedVlogId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting review')
    } finally {
      setLoading(false)
    }
  }

  if (!myVlogs.length && !loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>My Vlogs</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>You haven&apos;t posted any vlogs yet.</p>
        <button
          onClick={fetchMyVlogs}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Load My Vlogs
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>My Vlogs Dashboard</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe0e0', borderRadius: '8px' }}>{error}</div>}

      {mode === 'list' ? (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading vlogs...</div>
          ) : myVlogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No vlogs found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {myVlogs.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVlogId(v.id)
                    fetchVlogDetails(v.id)
                  }}
                  style={{
                    padding: '15px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '150px',
                      background: v.thumbnailColor,
                      borderRadius: '8px',
                      marginBottom: '10px',
                    }}
                  />
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{v.title.length > 30 ? v.title.slice(0, 30) + '…' : v.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    {v.views >= 1000 ? `${(v.views / 1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `${v.credits} unlocks` : 'free'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>⭐ {v.rating} · ❤️ {v.likes}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Vlog Details View */}
          {vlog && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <button
                onClick={() => setMode('list')}
                style={{
                  marginBottom: '20px',
                  padding: '8px 16px',
                  background: '#ddd',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ← Back to List
              </button>

              {/* Media */}
              <div
                style={{
                  width: '100%',
                  height: '300px',
                  background: vlog.coverImage ? `url(${vlog.coverImage})` : vlog.thumbnailColor,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              />

              {/* Title & Meta */}
              <h3>{vlog.title}</h3>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#666' }}>
                <span>📍 {vlog.location}</span>
                {vlog.cost && <span>💰 ₱{vlog.cost.toLocaleString()}</span>}
                <span>⭐ {vlog.rating}</span>
                {vlog.duration && <span>📅 {vlog.duration} days</span>}
              </div>

              {/* Description */}
              {vlog.description && <p style={{ marginBottom: '20px', color: '#666' }}>{vlog.description}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={toggleLike}
                  style={{
                    padding: '10px 20px',
                    background: liked ? '#FF69B4' : '#ddd',
                    color: liked ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ❤️ {likeCount}
                </button>
                <button
                  onClick={() => setMode('edit')}
                  style={{
                    padding: '10px 20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm && (
                <div style={{ padding: '15px', background: '#ffe0e0', borderRadius: '8px', marginBottom: '20px' }}>
                  <p>Are you sure you want to delete this vlog? This action cannot be undone.</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={deleteVlog}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      style={{
                        padding: '8px 16px',
                        background: '#ddd',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {vlog.itinerary && vlog.itinerary.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>Itinerary</h4>
                  {vlog.itinerary.map((day) => (
                    <div key={day.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
                      <strong>Day {day.day}</strong>
                      <p style={{ margin: '5px 0', color: '#666' }}>{day.activity}</p>
                      {day.cost && <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>💰 ₱{day.cost.toLocaleString()}</p>}
                      {day.locked && <span style={{ fontSize: '12px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>🔒 Locked</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews */}
              {vlog.reviews && vlog.reviews.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>Reviews ({vlog.reviews.length})</h4>
                  {vlog.reviews.map((review) => (
                    <div key={review.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong>{review.authorName}</strong>
                        <span>⭐ {review.rating}</span>
                      </div>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>{review.text}</p>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review */}
              <div style={{ padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
                <h4>Add a Review</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label>Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {'⭐'.repeat(r)} {r} stars
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this vlog..."
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                  />
                </div>
                <button
                  onClick={submitReview}
                  disabled={loading || !reviewText.trim()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: !reviewText.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
