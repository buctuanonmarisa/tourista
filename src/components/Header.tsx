'use client';

import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 transition-transform">
            ✈️
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Tourista
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/browse" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Explore
          </a>
          <a href="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Dashboard
          </a>
          <a href="/profile" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Profile
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:px-6 sm:py-2 sm:rounded-full sm:bg-gradient-to-r sm:from-orange-500 sm:to-amber-500 sm:text-white sm:font-semibold sm:hover:shadow-lg sm:hover:shadow-orange-500/30 sm:transition-all sm:inline-block">
            Post Vlog
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <a href="/browse" className="block text-gray-700 hover:text-orange-600 font-medium py-2">
            Explore
          </a>
          <a href="/dashboard" className="block text-gray-700 hover:text-orange-600 font-medium py-2">
            Dashboard
          </a>
          <a href="/profile" className="block text-gray-700 hover:text-orange-600 font-medium py-2">
            Profile
          </a>
          <button className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all">
            Post Vlog
          </button>
        </div>
      )}
    </header>
  );
}
