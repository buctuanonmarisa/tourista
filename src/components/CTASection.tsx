'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-warm-500 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-display font-black mb-6">Ready to Share Your Story?</h2>
        <p className="text-xl mb-8 opacity-90 font-body">
          Join thousands of creators earning from their travel experiences.
        </p>
        <Link
          href="/post"
          className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105 text-lg font-display"
        >
          Start Creating Now
        </Link>
      </div>
    </section>
  );
}
