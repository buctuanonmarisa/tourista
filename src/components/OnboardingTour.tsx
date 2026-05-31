'use client'

import { useState, useEffect } from 'react'
import { hasTourCompleted, markTourCompleted } from '@/utils/tourHelpers'

interface TourStep {
  id: string
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    target: '.tn-search',
    title: '🔍 Search & Filter',
    content: 'Search for destinations or use filters to find the perfect travel vlog for your next adventure!',
    position: 'bottom',
  },
  {
    id: 'step-2',
    target: '.vlog-card:first-child',
    title: '📹 Watch & Explore',
    content: 'Click any video card to watch the vlog, read details, and explore day-by-day itineraries with clips!',
    position: 'right',
  },
  {
    id: 'step-3',
    target: '.tn-tour',
    title: '🗺️ Tour Me',
    content: 'Get personalized travel recommendations based on your preferences and budget!',
    position: 'bottom',
  },
  {
    id: 'step-4',
    target: 'button:has(svg path[d*="M21 15v4a2"])',
    title: '✨ Create Your Vlog',
    content: 'Share your travel experiences! Use AI to auto-fill details from your YouTube video, then customize your itinerary.',
    position: 'left',
  },
  {
    id: 'step-5',
    target: '.tn-btn:has(svg rect)',
    title: '💰 Dashboard & Earnings',
    content: 'Track your views, earnings, and manage your published vlogs all in one place!',
    position: 'bottom',
  },
]

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!hasTourCompleted()) {
      // Wait for page to load
      setTimeout(() => setIsActive(true), 1500)
    }
  }, [])

  useEffect(() => {
    if (!isActive || currentStep >= TOUR_STEPS.length) return

    const step = TOUR_STEPS[currentStep]
    const element = document.querySelector(step.target)

    if (!element) {
      // Skip to next step if element not found
      setTimeout(() => setCurrentStep(prev => prev + 1), 100)
      return
    }

    const updatePosition = () => {
      const rect = element.getBoundingClientRect()
      const tooltipWidth = 320
      const tooltipHeight = 200

      let top = 0
      let left = 0

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + 16
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          break
        case 'top':
          top = rect.top - tooltipHeight - 16
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          break
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          left = rect.right + 16
          break
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          left = rect.left - tooltipWidth - 16
          break
      }

      // Keep tooltip in viewport
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))

      setPosition({ top, left })
    }

    updatePosition()

    // Highlight element
    element.classList.add('tour-highlight')

    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      element.classList.remove('tour-highlight')
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [currentStep, isActive])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const step = TOUR_STEPS[currentStep]
      step.action?.()
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const completeTour = () => {
    markTourCompleted()
    setIsActive(false)
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
  }

  if (!isActive || currentStep >= TOUR_STEPS.length) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="tour-overlay" onClick={skipTour} />

      {/* Tooltip */}
      <div
        className="tour-tooltip"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 10001,
        }}
      >
        <div className="tour-tooltip-header">
          <h3>{step.title}</h3>
          <button onClick={skipTour} className="tour-close" aria-label="Close tour">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <p className="tour-tooltip-content">{step.content}</p>
        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`tour-dot ${idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <div className="tour-actions">
            {currentStep > 0 && (
              <button onClick={prevStep} className="tour-btn-skip">Back</button>
            )}
            <button onClick={skipTour} className="tour-btn-skip">Skip</button>
            <button onClick={nextStep} className="tour-btn-next">
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
