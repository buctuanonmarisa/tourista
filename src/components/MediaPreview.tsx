interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface MediaPreviewProps {
  item: MediaItem
  title: string
  autoplay?: boolean
  fallbackImageUrl?: string
  onImageFallback?: (image: HTMLImageElement) => void
  onVideoEnded?: () => void
}

export const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?controls=1&rel=0`
  const ytShort = url.match(/youtube\.com\/shorts\/([^&\s?]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?controls=1&rel=0`
  const ytSearch = url.match(/youtube\.com\/results\?search_query=([^&]+)/)
  if (ytSearch) return `https://www.youtube.com/embed?listType=search&list=${ytSearch[1]}&controls=1&rel=0`
  return null
}

export const withAutoplay = (url: string, muted = true) =>
  `${url}${url.includes('?') ? '&' : '?'}autoplay=1&mute=${muted ? '1' : '0'}&playsinline=1`

export const withManualPlayback = (url: string, muted = false) =>
  `${url}${url.includes('?') ? '&' : '?'}autoplay=0&mute=${muted ? '1' : '0'}&playsinline=1`

const withPlayerApi = (url: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${url}${url.includes('?') ? '&' : '?'}enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`
}

export const directVideoUrl = (url: string) =>
  url.startsWith('blob:') ||
  url.startsWith('/api/uploads/') ||
  /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url)

export const clipPreviewUrl = (url: string, autoplay = false) => {
  const embed = getEmbedUrl(url)
  if (!embed) return null
  return withPlayerApi(autoplay ? withAutoplay(embed, false) : withManualPlayback(embed))
}

export default function MediaPreview({ item, title, autoplay = false, fallbackImageUrl, onImageFallback, onVideoEnded }: MediaPreviewProps) {
  if (item.type !== 'video') {
    return (
      <img
        src={item.url}
        alt={title}
        onError={event => {
          if (onImageFallback) {
            onImageFallback(event.currentTarget)
            return
          }
          if (fallbackImageUrl && event.currentTarget.src !== fallbackImageUrl) {
            event.currentTarget.src = fallbackImageUrl
          }
        }}
      />
    )
  }

  const previewUrl = clipPreviewUrl(item.url, autoplay)
  if (previewUrl) {
    return <iframe src={previewUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
  }

  if (directVideoUrl(item.url)) {
    return <video src={item.url} preload={autoplay ? 'auto' : 'metadata'} playsInline controls autoPlay={autoplay} muted={false} onEnded={onVideoEnded} />
  }

  return (
    <div className="clip-link-preview">
      <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span>Preview link</span>
    </div>
  )
}
