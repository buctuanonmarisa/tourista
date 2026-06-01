/**
 * VLOG HELPER UTILITIES
 *
 * Common functions for vlog operations:
 * - Cost formatting
 * - Video URL detection
 * - Credits calculation
 * - Embed URL generation
 * - Date formatting
 */

/**
 * Format cost with currency symbol
 */
export function formatCost(cost: number | null | undefined, currency: string = 'PHP'): string {
  if (!cost) return 'Free'

  const symbols: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }

  const symbol = symbols[currency] || currency
  return `${symbol}${cost.toLocaleString()}`
}

/**
 * Detect video platform from URL
 */
export function detectVideoSource(url: string): 'youtube' | 'facebook' | 'tiktok' | 'instagram' | null {
  if (!url) return null

  const lower = url.toLowerCase()
  if (lower.includes('youtube') || lower.includes('youtu.be') || lower.includes('youtube-nocookie.com')) return 'youtube'
  if (lower.includes('facebook') || lower.includes('fb.com')) return 'facebook'
  if (lower.includes('tiktok')) return 'tiktok'
  if (lower.includes('instagram')) return 'instagram'

  return null
}

/**
 * Get embed URL for video platforms
 */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null

  const source = detectVideoSource(url)

  if (source === 'youtube') {
    // Extract video ID from various YouTube URL formats
    let videoId = ''
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || ''
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || ''
    } else if (url.includes('youtube-nocookie.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || ''
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0] || ''
    } else if (url.includes('youtube.com/live/')) {
      videoId = url.split('live/')[1]?.split('?')[0] || ''
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  if (source === 'facebook') {
    // Facebook embed requires specific format
    return url.includes('facebook.com') ? url : null
  }

  if (source === 'tiktok') {
    // TikTok embed
    return url.includes('tiktok.com') ? url : null
  }

  if (source === 'instagram') {
    // Instagram embed
    return url.includes('instagram.com') ? url : null
  }

  return null
}

/**
 * Calculate credits from itinerary costs
 */
const CREDIT_PESO_RATE = 5
const RECOMMENDED_CREDIT_RATE = 0.01

export function calculateCredits(costs: string[]): number {
  const total = costs.reduce((sum, cost) => {
    if (!cost.trim()) return sum
    const cleaned = cost.replace(/[₱$,\s]/g, '')
    const num = parseInt(cleaned) || 0
    return sum + num
  }, 0)

  return total > 0 ? Math.ceil((total * RECOMMENDED_CREDIT_RATE) / CREDIT_PESO_RATE) : 0
}

/**
 * Calculate estimated earnings
 */
export function calculateEarnings(credits: number, unlocks: number = 50): number {
  // 1 credit is PHP 5; creator receives 80%.
  return credits * CREDIT_PESO_RATE * 0.8 * unlocks
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time relative to now (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Parse currency from string
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[₱$€£,\s]/g, '')
  return parseInt(cleaned) || 0
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate random color
 */
export function getRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
