'use client'

import { useState, useCallback } from 'react'

/**
 * PROFILE MODULE
 *
 * Handles:
 * - User profile display and editing
 * - Avatar customization (initials, color)
 * - Social links management
 * - Bio and tagline editing
 * - Follower/following tracking
 * - Earnings and credits display
 * - Verification status
 */

interface UserProfile {
  id: string
  handle: string
  name: string
  bio?: string | null
  tagline?: string | null
  initials: string
  avatarColor: string
  country?: string | null
  travelStyle?: string | null
  verified: boolean
  followers: number
  vlogCount: number
  avgRating: number
  totalViews: number
  credits: number
  earnings: number
  youtubeUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
}

interface ProfileProps {
  onEditStart: () => void
  onEditEnd: () => void
}

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
]

export default function Profile({ onEditStart, onEditEnd }: ProfileProps) {
  // ─── State ───
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ─── API Calls ───
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data: UserProfile = await res.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      const data: UserProfile = await res.json()
      setProfile(data)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      onEditEnd()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = () => {
    if (profile) {
      setEditForm(profile)
      setIsEditing(true)
      onEditStart()
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({})
    onEditEnd()
  }

  if (!profile && !loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button onClick={fetchProfile} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Load Profile
        </button>
      </div>
    )
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading profile...</div>
  }

  if (!profile) {
    return <div style={{ padding: '20px', color: 'red' }}>Failed to load profile</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>My Profile</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe0e0', borderRadius: '8px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e0ffe0', borderRadius: '8px' }}>{success}</div>}

      {!isEditing ? (
        <>
          {/* Profile Header */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '12px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: profile.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
              }}
            >
              {profile.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <h3 style={{ margin: 0 }}>{profile.name}</h3>
                {profile.verified && <span style={{ fontSize: '18px' }}>✓</span>}
              </div>
              <div style={{ color: '#666', marginBottom: '8px' }}>@{profile.handle}</div>
              {profile.tagline && <div style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>{profile.tagline}</div>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '15px', background: '#f0f8ff', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{profile.followers}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
            </div>
            <div style={{ padding: '15px', background: '#f0fff0', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{profile.vlogCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Vlogs</div>
            </div>
            <div style={{ padding: '15px', background: '#fff0f5', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF69B4' }}>₱{profile.earnings.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Earnings</div>
            </div>
            <div style={{ padding: '15px', background: '#fffacd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFA500' }}>{profile.credits}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Credits</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <strong>Bio</strong>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>{profile.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {(profile.youtubeUrl || profile.instagramUrl || profile.tiktokUrl) && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <strong>Social Links</strong>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                {profile.youtubeUrl && (
                  <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FF0000', textDecoration: 'none' }}>
                    YouTube
                  </a>
                )}
                {profile.instagramUrl && (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', textDecoration: 'none' }}>
                    Instagram
                  </a>
                )}
                {profile.tiktokUrl && (
                  <a href={profile.tiktokUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'none' }}>
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Edit Button */}
          <button
            onClick={startEditing}
            style={{
              width: '100%',
              padding: '12px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <>
          {/* Edit Form */}
          <div style={{ marginBottom: '15px' }}>
            <label>Name</label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Handle</label>
            <input
              type="text"
              value={editForm.handle || ''}
              onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Tagline</label>
            <input
              type="text"
              value={editForm.tagline || ''}
              onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
              placeholder="e.g., Travel photographer & storyteller"
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Bio</label>
            <textarea
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Avatar Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setEditForm({ ...editForm, avatarColor: color })}
                  style={{
                    width: '100%',
                    height: '50px',
                    background: color,
                    border: editForm.avatarColor === color ? '3px solid #000' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>YouTube URL</label>
            <input
              type="url"
              value={editForm.youtubeUrl || ''}
              onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/@yourhandle"
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Instagram URL</label>
            <input
              type="url"
              value={editForm.instagramUrl || ''}
              onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>TikTok URL</label>
            <input
              type="url"
              value={editForm.tiktokUrl || ''}
              onChange={(e) => setEditForm({ ...editForm, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@yourhandle"
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={updateProfile}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={cancelEditing}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#ddd',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
