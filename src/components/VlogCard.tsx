'use client';

interface VlogCardProps {
  title: string;
  location: string;
  country: string;
  views: number;
  rating: number;
  creator: string;
  followers: number;
  thumbnail?: string;
}

export default function VlogCard({
  title,
  location,
  country,
  views,
  rating,
  creator,
  followers,
}: VlogCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-primary-200 hover:border-primary-400 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 transform hover:-translate-y-2">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-warm-500 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-20">🌍</div>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary-600">
          Featured
        </div>
        <div className="absolute top-4 right-4 bg-warm-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          ⭐ {rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          📍 {location}, {country}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-primary-100">
          <span>👁️ {(views / 1000).toFixed(1)}K views</span>
          <span>💬 {Math.floor(Math.random() * 100)} reviews</span>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-warm-500 flex items-center justify-center text-white font-bold text-xs">
            {creator.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{creator}</div>
            <div className="text-xs text-gray-500">{(followers / 1000).toFixed(0)}K followers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
