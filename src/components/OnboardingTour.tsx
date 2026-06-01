'use client'

import { useState, useEffect } from 'react'
import { hasTourCompleted, markTourCompleted } from '@/utils/tourHelpers'

interface TourStep {
  id: string
  target: string
  kicker: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    target: '[data-tour="search-filter"]',
    kicker: 'Find your vibe',
    title: 'Filter and search',
    content: 'Start with a destination, creator, vibe, country, or budget. The chips help narrow the feed without leaving Explore.',
    position: 'bottom',
  },
  {
    id: 'step-2',
    target: '[data-tour="dark-mode"]',
    kicker: 'Set the mood',
    title: 'Switch dark mode any time',
    content: 'Use this toggle whenever you want a darker, softer interface for browsing maps, clips, dashboards, and creator tools.',
    position: 'bottom',
  },
  {
    id: 'step-3',
    target: '[data-tour="video-card"]',
    kicker: 'Open the story',
    title: 'Click a video card',
    content: 'Open any card to watch the vlog, read trip details, check costs, and browse the day-by-day itinerary clips.',
    position: 'right',
  },
  {
    id: 'step-4',
    target: '[data-tour="tourme"]',
    kicker: 'Personal guide',
    title: 'Try TourMe',
    content: 'TourMe turns the vlog library into a guided trip finder so you can compare places and move from inspiration to a route.',
    position: 'bottom',
  },
  {
    id: 'step-5',
    target: '[data-tour="post-vlog"]',
    kicker: 'Creator mode',
    title: 'Create a vlog with AI',
    content: 'Post a vlog can auto-fill your title, description, route, and itinerary from a video link before you polish and publish.',
    position: 'left',
  },
  {
    id: 'step-6',
    target: '[data-tour="dashboard"]',
    kicker: 'See performance',
    title: 'Dashboard and earnings',
    content: 'Track views, likes, unlocks, and estimated earnings, then manage your published vlogs from one focused workspace.',
    position: 'bottom',
  },
]

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!hasTourCompleted()) {
      const timer = window.setTimeout(() => setIsActive(true), 1500)
      return () => window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isActive || currentStep >= TOUR_STEPS.length) return

    const step = TOUR_STEPS[currentStep]
    const element = document.querySelector(step.target)

    if (!element) {
      const timer = window.setTimeout(() => setCurrentStep(prev => prev + 1), 100)
      return () => window.clearTimeout(timer)
    }

    const updatePosition = () => {
      const rect = element.getBoundingClientRect()
      const tooltipWidth = 360
      const tooltipHeight = 230

      let top = 0
      let left = 0

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + 18
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'top':
          top = rect.top - tooltipHeight - 18
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + 18
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - 18
          break
      }

      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))

      setPosition({ top, left })
    }

    updatePosition()
    element.classList.add('tour-highlight')

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      element.classList.remove('tour-highlight')
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [currentStep, isActive])

  const completeTour = () => {
    markTourCompleted()
    setIsActive(false)
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  if (!isActive || currentStep >= TOUR_STEPS.length) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <>
      <div className="tour-overlay" onClick={completeTour} />

      <div
        className="tour-tooltip"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 10001,
        }}
      >
        <div className="tour-step-pill">Step {currentStep + 1} of {TOUR_STEPS.length}</div>
        <div className="tour-tooltip-header">
          <div className="tour-tooltip-titleblock">
            <div className="tour-tooltip-kicker">{step.kicker}</div>
            <h3>{step.title}</h3>
          </div>
          <button onClick={completeTour} className="tour-close" aria-label="Close tour">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <p className="tour-tooltip-content">{step.content}</p>
        <div className="tour-tooltip-footer">
          <div className="tour-progress" aria-label="Tour progress">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`tour-dot ${idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <div className="tour-tooltip-actions">
            {currentStep > 0 && (
              <button onClick={prevStep} className="tour-btn-skip">Back</button>
            )}
            <button onClick={completeTour} className="tour-btn-skip">Skip</button>
            <button onClick={nextStep} className="tour-btn-next">
              {currentStep === TOUR_STEPS.length - 1 ? 'Start exploring' : 'Next tip'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
