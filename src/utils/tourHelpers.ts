/**
 * Tour Helper Functions
 * Utilities for managing the onboarding tour
 */

export const TOUR_STORAGE_KEY = 'tourista_tour_completed'

/**
 * Check if user has completed the tour
 */
export function hasTourCompleted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  } catch {
    // Ignore storage errors
  }
}

/**
 * Reset tour (allows user to see it again)
 */
export function resetTour(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    // Reload page to restart tour
    window.location.reload()
  } catch {
    // Ignore storage errors
  }
}
