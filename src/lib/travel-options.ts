export const DEFAULT_COUNTRY = 'Philippines'

export const FALLBACK_VIBES = [
  'Beach & islands',
  'Mountain hiking',
  'City break',
  'Adventure sports',
  'Food & culture',
  'Solo travel',
  'Family trip',
  'Road trip',
  'Backpacking',
  'Island hopping',
  'Cultural immersion',
  'Wildlife & nature',
  'Photography spots',
  'Nightlife',
  'Wellness & spa',
  'Historical sites',
]

export const FALLBACK_COUNTRIES = [
  'Philippines',
  'Japan',
  'Thailand',
  'Vietnam',
  'Indonesia',
  'France',
  'Spain',
  'Portugal',
  'USA',
  'Canada',
  'Singapore',
  'Italy',
  'Greece',
  'Australia',
  'United Kingdom',
  'Mexico',
  'Brazil',
  'South Africa',
  'Turkey',
]

export const FALLBACK_BUDGETS = [
  'Under ₱10k',
  '₱10k – ₱30k',
  'Above ₱30k',
  'Free vlogs only',
]

export type TravelOptionCategory = 'country' | 'vibe' | 'budget'

export const TRAVEL_OPTION_SEEDS: Record<TravelOptionCategory, string[]> = {
  country: FALLBACK_COUNTRIES,
  vibe: FALLBACK_VIBES,
  budget: FALLBACK_BUDGETS,
}
