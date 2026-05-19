'use client';

const features = [
  {
    icon: '🔍',
    title: 'Discover',
    description: 'Browse vlogs by destination, vibe, and budget. Filter by region to find your next adventure.',
  },
  {
    icon: '💎',
    title: 'Unlock',
    description: 'Use credits to unlock detailed day-by-day itineraries, insider tips, and hidden gems.',
  },
  {
    icon: '⭐',
    title: 'Share & Earn',
    description: 'Create vlogs, build your audience, and earn credits from viewers who unlock your content.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-5xl font-display font-black text-center mb-16 text-gray-900">
          How <span className="text-primary-600">Tourista</span> Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-warm-50 border border-primary-200 hover:border-primary-400 transition-all transform hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed font-body">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
