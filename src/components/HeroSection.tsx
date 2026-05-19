'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-warm-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Main Headline */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-display font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-600 via-warm-500 to-primary-600 bg-clip-text text-transparent">
              Travel Stories
            </span>
            <br />
            <span className="text-gray-900">That Inspire</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-body">
            Discover authentic travel vlogs from creators around the world. Unlock detailed itineraries and insider tips with credits.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/browse"
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-warm-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-primary-500/40 transition-all transform hover:scale-105 text-lg font-display"
          >
            Explore Vlogs
          </Link>
          <Link
            href="/post"
            className="px-8 py-4 border-2 border-primary-500 text-primary-600 font-bold rounded-full hover:bg-primary-50 transition-all text-lg font-display"
          >
            Become a Creator
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-br from-primary-100 to-warm-100 rounded-2xl p-6 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-display font-black text-primary-600">2.5K+</div>
            <div className="text-sm text-gray-600 mt-2 font-body">Travel Vlogs</div>
          </div>
          <div className="bg-gradient-to-br from-accent-100 to-blue-100 rounded-2xl p-6 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-display font-black text-accent-600">50K+</div>
            <div className="text-sm text-gray-600 mt-2 font-body">Travelers</div>
          </div>
          <div className="bg-gradient-to-br from-warm-100 to-primary-100 rounded-2xl p-6 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-display font-black text-warm-600">180+</div>
            <div className="text-sm text-gray-600 mt-2 font-body">Countries</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
