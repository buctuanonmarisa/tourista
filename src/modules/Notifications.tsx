'use client'

import { useState, useCallback, useEffect } from 'react'

/**
 * NOTIFICATIONS MODULE
 *
 * Handles:
 * - Notification center
 * - Notification types (likes, reviews, unlocks, follows, earnings)
 * - Mark as read/unread
 * - Delete notifications
 * - Real-time notification updates
 * - Notification filtering
 */

interface Notification {
  id: string
  type: 'like' | 'review' | 'unlock' | 'follow' | 'earnings'
  title: string
  message: string
  relatedId?: string
  relatedType?: 'vlog' | 'user'
  read: boolean
  createdAt: string
  avatar?: string
  avatarColor?: string
}

interface NotificationsProps {
  onNotificationClick?: (notification: Notification) => void
}

const NOTIFICATION_ICONS: Record<string, string> = {
  like: '❤️',
  review: '💬',
  unlock: '🔓',
  follow: '👤',
  earnings: '💰',
}

export default function Notifications({ onNotificationClick }: NotificationsProps) {
  // ─── State ───
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'reviews' | 'unlocks' | 'follows' | 'earnings'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ─── API Calls ───
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.set('unread', 'true')
        } else {
          params.set('type', filter)
        }
      }
      const res = await fetch(`/api/notifications?${params}`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data: Notification[] = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications')
    } finally {
      setLoading(false)
    }
  }, [filter])

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark all as read')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete notification')
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notification')
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete all notifications')
      setNotifications([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notifications')
    }
  }

  // ─── Effects ───
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ─── Filtering ───
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Notifications {unreadCount > 0 && <span style={{ fontSize: '14px', background: '#f44336', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px' }}>{unreadCount}</span>}</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe0e0', borderRadius: '8px' }}>{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        {(['all', 'unread', 'likes', 'reviews', 'unlocks', 'follows', 'earnings'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              background: filter === f ? '#4CAF50' : '#f0f0f0',
              color: filter === f ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '12px',
              fontWeight: filter === f ? 'bold' : 'normal',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) markAsRead(notification.id)
                onNotificationClick?.(notification)
              }}
              style={{
                padding: '15px',
                background: notification.read ? '#f9f9f9' : '#f0f8ff',
                borderLeft: notification.read ? '4px solid #ddd' : '4px solid #4CAF50',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = notification.read ? '#f5f5f5' : '#e8f5e9'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = notification.read ? '#f9f9f9' : '#f0f8ff'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Avatar */}
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt="Avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: notification.avatarColor || '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {NOTIFICATION_ICONS[notification.type]}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <strong style={{ color: notification.read ? '#666' : '#000' }}>{notification.title}</strong>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>{notification.message}</p>
                  <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                    {formatTime(new Date(notification.createdAt))}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#4CAF50',
                      marginTop: '6px',
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={deleteAllNotifications}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Utilities ───
function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
