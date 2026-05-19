'use client';

import VlogCard from './VlogCard';

const trendingVlogs = [
  {
    id: 1,
    title: 'Tokyo Adventure: 7 Days in Japan',
    location: 'Tokyo',
    country: 'Japan',
    views: 8500,
    rating: 4.8,
    creator: 'Alex',
    followers: 12500,
  },
  {
    id: 2,
    title: 'Bali Paradise: Hidden Beaches',
    location: 'Bali',
    country: 'Indonesia',
    views: 7200,
    rating: 4.9,
    creator: 'Maya',
    followers: 18900,
  },
  {
    id: 3,
    title: 'Iceland Magic: Northern Lights',
    location: 'Reykjavik',
    country: 'Iceland',
    views: 9100,
    rating: 4.7,
    creator: 'Chris',
    followers: 22300,
  },
  {
    id: 4,
    title: 'Peru Trek: Machu Picchu',
    location: 'Cusco',
    country: 'Peru',
    views: 6800,
    rating: 4.6,
    creator: 'Jordan',
    followers: 15600,
  },
  {
    id: 5,
    title: 'Greece Escape: Island Hopping',
    location: 'Athens',
    country: 'Greece',
    views: 7900,
    rating: 4.8,
    creator: 'Sofia',
    followers: 19200,
  },
  {
    id: 6,
    title: 'Thailand Vibes: Street Food Tour',
    location: 'Bangkok',
    country: 'Thailand',
    views: 8300,
    rating: 4.9,
    creator: 'Sam',
    followers: 21400,
  },
];

export default function TrendingSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-display font-black mb-4 text-gray-900">
            Trending <span className="text-primary-600">Now</span>
          </h2>
          <p className="text-xl text-gray-600 font-body">Most-watched travel vlogs this week</p>
        </div>

        {/* Vlog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trendingVlogs.map((vlog) => (
            <VlogCard
              key={vlog.id}
              title={vlog.title}
              location={vlog.location}
              country={vlog.country}
              views={vlog.views}
              rating={vlog.rating}
              creator={vlog.creator}
              followers={vlog.followers}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors font-display">
            View All Vlogs →
          </button>
        </div>
      </div>
    </section>
  );
}
