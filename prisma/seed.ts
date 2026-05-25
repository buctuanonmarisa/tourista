import { PrismaClient } from '@prisma/client'
import { FALLBACK_BUDGETS, FALLBACK_COUNTRIES, FALLBACK_VIBES, TRAVEL_OPTION_SEEDS } from '../src/lib/travel-options'

const prisma = new PrismaClient()

const AVATAR_COLORS = ['ag', 'ac', 'ab', 'ap', 'ar', 'as', 'at', 'au', 'av', 'aw']
const THUMBNAIL_COLORS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']

type VlogLinkSeed = {
  title: string
  location: string
  country: string
  vibe: string
}

const slugifyTag = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')
const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
const travelQuery = (vlog: VlogLinkSeed) => `${vlog.location} ${vlog.country} ${vlog.vibe} travel vlog tour`
const encodedTravelQuery = (vlog: VlogLinkSeed) => encodeURIComponent(travelQuery(vlog))
const coverPhotoUrl = (vlog: VlogLinkSeed) =>
  `https://loremflickr.com/1200/800/${encodeURIComponent(vlog.location)},${encodeURIComponent(vlog.country)},travel/all?lock=${stableImageLock(vlog.title)}`
const YOUTUBE_VIDEO_IDS: Record<string, string> = {
  'Siargao Island Paradise: 5 Days of Surfing & Island Hopping': 'oM43NeULJwo',
  'Tokyo on a Budget: 4 Days of Street Food & Hidden Gems': 'RY1CAaGslyc',
  'Phuket Paradise: Beaches, Parties & Island Adventures': 'GqeiO6rHPZE',
  'Hanoi Street Food Adventure: 3 Days Eating Like a Local': 'u9VswvjJtfI',
  'Ubud Wellness Retreat: 7 Days of Yoga, Temples & Rice Terraces': 'TRw-JEZuKPY',
  'El Nido Island Hopping: 4 Days in Paradise': 'QYxzYrCNf4Q',
  'Cebu City & Oslob: Whale Sharks & Canyoneering': 'y70z3C6nlEI',
  'Kyoto Temple Hopping: 5 Days of Zen & Cherry Blossoms': '3gX-umzVl9s',
}
const youtubeTravelUrl = (vlog: VlogLinkSeed) =>
  `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_IDS[vlog.title] || 'sWEBl9A4lNY'}`
const instagramTravelUrl = (vlog: VlogLinkSeed) =>
  `https://www.instagram.com/explore/tags/${slugifyTag(`${vlog.location} ${vlog.country} travel`)}/`
const tiktokTravelUrl = (vlog: VlogLinkSeed) =>
  `https://www.tiktok.com/search?q=${encodedTravelQuery(vlog)}`
const facebookTravelUrl = (vlog: VlogLinkSeed) =>
  `https://www.facebook.com/search/videos/?q=${encodedTravelQuery(vlog)}`

// Realistic user data with actual social media URLs
const USERS = [
  {
    handle: 'MarisolRoams',
    name: 'Marisol Santos',
    initials: 'MS',
    country: 'Philippines',
    bio: 'Filipino travel creator sharing budget-friendly adventures across Southeast Asia. 🌴✈️',
    tagline: 'Making travel accessible for everyone',
    travelStyle: 'Budget backpacking',
    youtubeUrl: 'https://www.youtube.com/@drewbinsky',
    instagramUrl: 'https://www.instagram.com/drewbinsky',
    tiktokUrl: 'https://www.tiktok.com/@drewbinsky',
  },
  {
    handle: 'TravelWithKai',
    name: 'Kai Nakamura',
    initials: 'KN',
    country: 'Japan',
    bio: 'Tokyo-based creator exploring hidden gems in Japan and beyond. 🗾🎌',
    tagline: 'Discover Japan like a local',
    travelStyle: 'Cultural immersion',
    youtubeUrl: 'https://www.youtube.com/@abroadinjapan',
    instagramUrl: 'https://www.instagram.com/abroadinjapan',
    tiktokUrl: 'https://www.tiktok.com/@abroadinjapan',
  },
  {
    handle: 'EloiseVoyage',
    name: 'Eloise Cruz',
    initials: 'EC',
    country: 'Philippines',
    bio: 'Island hopping enthusiast documenting paradise destinations. 🏝️🌊',
    tagline: 'Chasing sunsets and island vibes',
    travelStyle: 'Beach & islands',
    youtubeUrl: 'https://www.youtube.com/@KaraAndNate',
    instagramUrl: 'https://www.instagram.com/karaandnate',
    tiktokUrl: 'https://www.tiktok.com/@karaandnate',
  },
  {
    handle: 'SoloLensTrails',
    name: 'Alex Chen',
    initials: 'AC',
    country: 'Vietnam',
    bio: 'Solo traveler and photographer capturing authentic moments across Asia. 📸🎒',
    tagline: 'One camera, endless stories',
    travelStyle: 'Solo photography',
    youtubeUrl: 'https://www.youtube.com/@PeterMcKinnon',
    instagramUrl: 'https://www.instagram.com/petermckinnon',
    tiktokUrl: 'https://www.tiktok.com/@petermckinnon',
  },
  {
    handle: 'AdventureAlex',
    name: 'Alex Rivera',
    initials: 'AR',
    country: 'USA',
    bio: 'Adrenaline junkie seeking thrills from mountains to oceans. 🏔️🌊',
    tagline: 'Life is either a daring adventure or nothing',
    travelStyle: 'Adventure sports',
    youtubeUrl: 'https://www.youtube.com/@YesTheory',
    instagramUrl: 'https://www.instagram.com/yestheory',
    tiktokUrl: 'https://www.tiktok.com/@yestheory',
  },
  {
    handle: 'WanderlustWill',
    name: 'Will Thompson',
    initials: 'WT',
    country: 'Australia',
    bio: 'Aussie exploring the world one country at a time. 🌏🦘',
    tagline: 'Collecting passport stamps and memories',
    travelStyle: 'Backpacking',
    youtubeUrl: 'https://www.youtube.com/@c90adventures',
    instagramUrl: 'https://www.instagram.com/c90adventures',
    tiktokUrl: 'https://www.tiktok.com/@c90adventures',
  },
  {
    handle: 'NomadNina',
    name: 'Nina Dubois',
    initials: 'ND',
    country: 'France',
    bio: 'French nomad sharing luxury travel on a budget. 🥐✨',
    tagline: 'Elegance meets adventure',
    travelStyle: 'Luxury budget travel',
    youtubeUrl: 'https://www.youtube.com/@EvaZuBeck',
    instagramUrl: 'https://www.instagram.com/evazubeck',
    tiktokUrl: 'https://www.tiktok.com/@evazubeck',
  },
  {
    handle: 'ExploreEthan',
    name: 'Ethan Park',
    initials: 'EP',
    country: 'Thailand',
    bio: 'Food lover exploring Southeast Asia through street food and local cuisine. 🍜🥘',
    tagline: 'Eating my way around the world',
    travelStyle: 'Food & culture',
    youtubeUrl: 'https://www.youtube.com/@MarkWiens',
    instagramUrl: 'https://www.instagram.com/migrationology',
    tiktokUrl: 'https://www.tiktok.com/@migrationology',
  },
  {
    handle: 'JourneyJess',
    name: 'Jessica Wong',
    initials: 'JW',
    country: 'Indonesia',
    bio: 'Wellness traveler finding peace in paradise. 🧘‍♀️🌺',
    tagline: 'Travel to transform',
    travelStyle: 'Wellness & yoga',
    youtubeUrl: 'https://www.youtube.com/@psychetruth',
    instagramUrl: 'https://www.instagram.com/psychetruth',
    tiktokUrl: 'https://www.tiktok.com/@psychetruth',
  },
  {
    handle: 'RoamRyan',
    name: 'Ryan Martinez',
    initials: 'RM',
    country: 'Spain',
    bio: 'History buff exploring ancient cities and cultural heritage sites. 🏛️📚',
    tagline: 'Every place has a story',
    travelStyle: 'Historical & cultural',
    youtubeUrl: 'https://www.youtube.com/@RickSteves',
    instagramUrl: 'https://www.instagram.com/ricksteves',
    tiktokUrl: 'https://www.tiktok.com/@ricksteves',
  },
]

// Realistic vlog templates with location-specific content
const VLOG_TEMPLATES = [
  // Philippines - Siargao
  {
    title: 'Siargao Island Paradise: 5 Days of Surfing & Island Hopping',
    location: 'Siargao',
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Beach & islands',
    cost: 12000,
    duration: 5,
    description: 'Complete guide to Siargao covering Cloud 9, island hopping tours, secret beaches, and the best local food spots. Includes budget breakdown and insider tips!',
    itinerary: [
      { day: 1, activity: 'Arrival & Cloud 9 Sunset', cost: 1500, locked: false, description: 'Arrive in Siargao, check into hostel, rent a motorbike, and catch the famous Cloud 9 sunset. Grab dinner at Shaka Cafe.', highlights: 'Cloud 9 boardwalk sunset, first taste of Filipino hospitality', foodTips: 'Try Shaka Bowl (₱250) and fresh buko juice (₱40)', gettingThere: 'Van from airport to General Luna (₱150), motorbike rental (₱350/day)', tips: 'Book accommodation in General Luna for easy access to everything' },
      { day: 2, activity: 'Surf Lessons at Cloud 9', cost: 2500, locked: false, description: 'Morning surf lesson at Cloud 9, afternoon exploring General Luna town, evening at Jungle Bar.', highlights: 'Catching your first wave, meeting fellow travelers', foodTips: 'Breakfast at Kermit (₱300), dinner at Harana Surf Resort (₱400)', gettingThere: 'Walk or motorbike to Cloud 9 (5 mins from town)', tips: 'Book surf lessons early (₱1,500 for 2 hours). Bring reef shoes!' },
      { day: 3, activity: 'Island Hopping Tour: Naked, Daku & Guyam', cost: 2800, locked: true, description: 'Full-day island hopping tour visiting three stunning islands. Snorkeling, swimming, and beach picnic included.', highlights: 'Crystal clear waters, fresh grilled seafood lunch, palm tree swings', foodTips: 'Lunch included in tour (grilled fish, rice, tropical fruits)', gettingThere: 'Tour pickup from accommodation (₱1,500 per person)', tips: 'Bring waterproof phone case, sunscreen, and cash for island fees (₱200)' },
      { day: 4, activity: 'Magpupungko Rock Pools & Maasin River', cost: 2200, locked: true, description: 'Explore the famous tidal rock pools and swim in the enchanting Maasin River palm forest.', highlights: 'Natural infinity pools, palm tree river, secret waterfalls', foodTips: 'Pack snacks from town. Try local kakanin (rice cakes) at roadside stalls', gettingThere: 'Motorbike ride north (1 hour). Entrance: ₱50 per site', tips: 'Visit Magpupungko at low tide (check tide schedule). Maasin River best in morning light' },
      { day: 5, activity: 'Sugba Lagoon & Departure', cost: 3000, locked: true, description: 'Morning trip to the stunning Sugba Lagoon for paddleboarding and cliff jumping before heading to the airport.', highlights: 'Emerald lagoon, cliff jumping, paddleboard yoga', foodTips: 'Early breakfast at accommodation, snacks provided on tour', gettingThere: 'Tour includes boat transfer (₱1,800). Airport van (₱150)', tips: 'Book early morning tour to catch flight. Store luggage at tour office' },
    ],
  },
  // Japan - Tokyo
  {
    title: 'Tokyo on a Budget: 4 Days of Street Food & Hidden Gems',
    location: 'Tokyo',
    country: 'Japan',
    region: 'Japan',
    vibe: 'Food & culture',
    cost: 25000,
    duration: 4,
    description: 'Explore Tokyo without breaking the bank! This guide covers the best street food, free attractions, budget accommodations, and local experiences in Shibuya, Harajuku, Asakusa, and more.',
    itinerary: [
      { day: 1, activity: 'Shibuya & Harajuku Street Culture', cost: 4500, locked: false, description: 'Experience the iconic Shibuya Crossing, explore Harajuku fashion streets, and visit Meiji Shrine.', highlights: 'Shibuya Crossing at night, Takeshita Street crepes, peaceful Meiji Shrine', foodTips: 'Conveyor belt sushi (¥100/plate = ₱40), Harajuku crepes (¥500 = ₱200)', gettingThere: 'JR Yamanote Line to Shibuya, walk to Harajuku (15 mins)', tips: 'Get Suica card for trains (¥2,000 = ₱800). Visit Shibuya Sky for sunset (¥2,000)' },
      { day: 2, activity: 'Asakusa Temple & Traditional Tokyo', cost: 5500, locked: false, description: 'Explore ancient Senso-ji Temple, Nakamise shopping street, and traditional Asakusa district.', highlights: 'Senso-ji Temple at sunrise, traditional snacks, kimono rentals', foodTips: 'Melon pan (¥200), ningyo-yaki (¥500), tempura lunch (¥800)', gettingThere: 'Ginza Line to Asakusa Station (¥170 = ₱70)', tips: 'Arrive early to avoid crowds. Rent kimono for photos (¥3,000 = ₱1,200)' },
      { day: 3, activity: 'Akihabara Anime & Tsukiji Outer Market', cost: 7000, locked: true, description: 'Dive into otaku culture in Akihabara, then feast at Tsukiji Outer Market for the freshest sushi.', highlights: 'Multi-story anime shops, retro gaming arcades, fresh sushi breakfast', foodTips: 'Tsukiji sushi breakfast (¥2,000), street food snacks (¥500), ramen dinner (¥900)', gettingThere: 'JR to Akihabara, walk to Tsukiji (or Hibiya Line)', tips: 'Tsukiji best before 10am. Bring cash - many vendors don\'t take cards' },
      { day: 4, activity: 'TeamLab Borderless & Odaiba', cost: 8000, locked: true, description: 'Immersive digital art at TeamLab, then explore futuristic Odaiba with Rainbow Bridge views.', highlights: 'Mind-bending digital art, giant Gundam statue, Tokyo Bay sunset', foodTips: 'Conveyor belt sushi in Odaiba (¥1,500), takoyaki (¥400)', gettingThere: 'Yurikamome Line to Odaiba (¥320 = ₱130)', tips: 'Book TeamLab tickets online in advance (¥3,200 = ₱1,300). Wear comfortable shoes' },
    ],
  },
  // Thailand - Phuket
  {
    title: 'Phuket Paradise: Beaches, Parties & Island Adventures',
    location: 'Phuket',
    country: 'Thailand',
    region: 'Southeast Asia',
    vibe: 'Beach & islands',
    cost: 18000,
    duration: 6,
    description: 'The ultimate Phuket guide covering Patong nightlife, Phi Phi Islands day trip, hidden beaches, Thai cooking class, and the best beach clubs. Perfect mix of party and paradise!',
    itinerary: [
      { day: 1, activity: 'Arrival & Patong Beach Sunset', cost: 2000, locked: false, description: 'Settle into Patong, explore the beach, and experience the famous Bangla Road nightlife.', highlights: 'Patong Beach sunset, Bangla Road neon lights, fire shows', foodTips: 'Pad Thai (฿60 = ₱100), fresh coconut (฿40), seafood BBQ (฿300)', gettingThere: 'Airport taxi to Patong (฿800 = ₱1,300)', tips: 'Stay near Bangla Road for nightlife or Karon Beach for quieter vibes' },
      { day: 2, activity: 'Phi Phi Islands Day Trip', cost: 4500, locked: false, description: 'Full-day speedboat tour to Maya Bay, snorkeling at Bamboo Island, and monkey beach visit.', highlights: 'Maya Bay (The Beach movie location), crystal clear snorkeling, cliff jumping', foodTips: 'Lunch included in tour (Thai buffet on boat)', gettingThere: 'Hotel pickup included (฿1,800 = ₱3,000 per person)', tips: 'Book tour with small group (max 15 people). Bring seasickness pills!' },
      { day: 3, activity: 'Thai Cooking Class & Old Phuket Town', cost: 2500, locked: true, description: 'Morning cooking class learning 5 Thai dishes, afternoon exploring colorful Sino-Portuguese architecture.', highlights: 'Cooking Pad Thai & Green Curry, Instagram-worthy streets, local coffee shops', foodTips: 'Eat what you cook! Try local Hokkien noodles (฿50) in Old Town', gettingThere: 'Cooking school pickup, Grab to Old Town (฿150)', tips: 'Book cooking class with market tour included (฿1,200 = ₱2,000)' },
      { day: 4, activity: 'Freedom Beach & Beach Club Hopping', cost: 3000, locked: true, description: 'Secret Freedom Beach in the morning, then beach club hopping at Catch, Cafe del Mar, and Bimi.', highlights: 'Hidden paradise beach, infinity pool clubs, sunset cocktails', foodTips: 'Beach club food (฿400-800), sunset cocktails (฿300)', gettingThere: 'Longtail boat to Freedom Beach (฿800 return), Grab between clubs', tips: 'Freedom Beach best before 11am. Beach clubs have minimum spend (฿500)' },
      { day: 5, activity: 'Big Buddha & Kata Viewpoint', cost: 2000, locked: true, description: 'Visit the iconic Big Buddha statue, explore Kata Beach, and catch sunset at Karon Viewpoint.', highlights: 'Panoramic island views, peaceful Buddha temple, three-bay viewpoint', foodTips: 'Lunch at Kata Beach (฿200), mango sticky rice (฿80)', gettingThere: 'Rent scooter (฿250/day) or Grab (฿300 round trip)', tips: 'Dress modestly for Big Buddha (cover shoulders/knees). Free entrance!' },
      { day: 6, activity: 'Snorkeling at Racha Islands', cost: 4000, locked: true, description: 'Day trip to pristine Racha Yai and Racha Noi islands for world-class snorkeling and diving.', highlights: 'Sea turtles, coral reefs, white sand beaches', foodTips: 'Lunch included on boat (Thai & Western options)', gettingThere: 'Hotel pickup included (฿2,500 = ₱4,200 per person)', tips: 'Bring underwater camera. Less crowded than Phi Phi!' },
    ],
  },
]

// More vlog templates to reach 50+ vlogs
const MORE_VLOG_TEMPLATES = [
  // Vietnam - Hanoi
  {
    title: 'Hanoi Street Food Adventure: 3 Days Eating Like a Local',
    location: 'Hanoi',
    country: 'Vietnam',
    region: 'Southeast Asia',
    vibe: 'Food & culture',
    cost: 8000,
    duration: 3,
    description: 'Ultimate Hanoi food guide covering 20+ must-try dishes, best street food spots, coffee culture, and Old Quarter exploration. Budget-friendly and delicious!',
    itinerary: [
      { day: 1, activity: 'Old Quarter Food Tour', cost: 2000, locked: false, description: 'Explore the bustling Old Quarter and try iconic dishes like pho, bun cha, and egg coffee.', highlights: 'Pho Gia Truyen, Bun Cha Huong Lien (Obama\'s spot), egg coffee at Giang Cafe', foodTips: 'Pho (₫40k = ₱80), Bun Cha (₫50k = ₱100), Egg Coffee (₫30k = ₱60)', gettingThere: 'Walk around Old Quarter, everything is within 1km', tips: 'Go early morning for pho (7-9am). Bring small bills!' },
      { day: 2, activity: 'Train Street & Night Market', cost: 3000, locked: false, description: 'Visit the famous Train Street, explore Dong Xuan Market, and experience the weekend night market.', highlights: 'Train passing inches away, night market shopping, street food galore', foodTips: 'Banh mi (₫20k), fresh spring rolls (₫30k), bia hoi (₫5k)', gettingThere: 'Grab bike to Train Street (₫30k = ₱60), walk to night market', tips: 'Train times: 3:30pm, 7:30pm, 8:30pm. Night market Fri-Sun only' },
      { day: 3, activity: 'Cooking Class & Coffee Culture', cost: 3000, locked: true, description: 'Take a Vietnamese cooking class and explore Hanoi\'s unique coffee culture.', highlights: 'Making pho from scratch, coconut coffee, hidden rooftop cafes', foodTips: 'Cooking class includes lunch. Try ca phe trung, ca phe cot dua', gettingThere: 'Cooking school pickup included (₫600k = ₱1,200 class fee)', tips: 'Book cooking class with market tour. Best cafes: The Note, Loading T' },
    ],
  },
  // Bali - Ubud
  {
    title: 'Ubud Wellness Retreat: 7 Days of Yoga, Temples & Rice Terraces',
    location: 'Ubud',
    country: 'Indonesia',
    region: 'Southeast Asia',
    vibe: 'Wellness & spa',
    cost: 22000,
    duration: 7,
    description: 'Transform your mind and body in Ubud. Daily yoga, meditation, healthy cafes, temple visits, and the famous Tegalalang rice terraces. Complete wellness guide!',
    itinerary: [
      { day: 1, activity: 'Arrival & Yoga Shala Orientation', cost: 2500, locked: false, description: 'Check into wellness resort, evening yoga session, and healthy welcome dinner.', highlights: 'First yoga class, meeting wellness community, organic dinner', foodTips: 'Smoothie bowls at resort (Rp 65k = ₱250), vegan dinner included', gettingThere: 'Airport transfer to Ubud (Rp 350k = ₱1,400)', tips: 'Book accommodation with yoga shala. Bring yoga mat or rent (Rp 50k/day)' },
      { day: 2, activity: 'Morning Yoga & Tegalalang Rice Terraces', cost: 3000, locked: false, description: 'Sunrise yoga, breakfast, then explore the iconic Tegalalang rice terraces and jungle swing.', highlights: 'Sunrise vinyasa flow, rice terrace photos, jungle swing', foodTips: 'Breakfast at Sari Organik (Rp 80k), fresh coconut (Rp 25k)', gettingThere: 'Scooter rental (Rp 70k/day), 20 min ride to Tegalalang', tips: 'Arrive at rice terraces before 9am. Entrance Rp 20k, swing Rp 150k' },
      { day: 3, activity: 'Spa Day & Meditation Workshop', cost: 4000, locked: true, description: 'Full-day spa experience with traditional Balinese massage, body scrub, and flower bath.', highlights: '2-hour massage, flower bath, meditation session', foodTips: 'Lunch at spa (included), dinner at Alchemy raw vegan (Rp 120k)', gettingThere: 'Spa pickup included (Karsa Spa package Rp 850k = ₱3,400)', tips: 'Book spa package in advance. Bring swimsuit for flower bath' },
      { day: 4, activity: 'Tirta Empul Temple & Water Purification', cost: 3000, locked: true, description: 'Visit sacred Tirta Empul temple for traditional water purification ceremony.', highlights: 'Holy spring water ritual, temple architecture, spiritual cleansing', foodTips: 'Pack snacks, lunch at local warung (Rp 40k)', gettingThere: 'Scooter or driver (Rp 300k round trip), 30 min from Ubud', tips: 'Wear sarong (rent at temple Rp 20k). Go early (7am) to avoid crowds' },
      { day: 5, activity: 'Yoga Retreat & Sound Healing', cost: 3500, locked: true, description: 'Deep yoga practice, sound healing session with Tibetan bowls, and pranayama workshop.', highlights: 'Yin yoga, crystal bowl meditation, breathwork', foodTips: 'All meals at retreat center (included in package)', gettingThere: 'At resort all day', tips: 'Bring journal for reflection. Stay hydrated. Wear comfortable layers' },
      { day: 6, activity: 'Campuhan Ridge Walk & Healthy Cooking Class', cost: 3000, locked: true, description: 'Sunrise walk along Campuhan Ridge, then learn to cook healthy Balinese cuisine.', highlights: 'Golden hour ridge walk, cooking 5 dishes, market tour', foodTips: 'Eat what you cook! Try jamu (herbal tonic) at market', gettingThere: 'Walk to ridge (10 min), cooking class pickup (Rp 450k = ₱1,800)', tips: 'Start ridge walk at 6am for best light. Bring water and hat' },
      { day: 7, activity: 'Final Yoga & Departure', cost: 3000, locked: true, description: 'Morning yoga class, wellness consultation, and relaxing departure.', highlights: 'Closing ceremony, wellness plan for home, goodbye brunch', foodTips: 'Farewell brunch at Clear Cafe (Rp 100k)', gettingThere: 'Airport transfer (Rp 350k)', tips: 'Book follow-up online yoga classes. Buy natural products at Bali Buda' },
    ],
  },
  // Philippines - Palawan
  {
    title: 'El Nido Island Hopping: 4 Days in Paradise',
    location: 'El Nido',
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Island hopping',
    cost: 15000,
    duration: 4,
    description: 'Complete El Nido guide covering Tours A, B, C & D, best beaches, budget tips, and where to stay. Limestone cliffs, lagoons, and crystal waters!',
    itinerary: [
      { day: 1, activity: 'Arrival & Nacpan Beach Sunset', cost: 2500, locked: false, description: 'Arrive in El Nido, check into hostel, and catch sunset at the stunning Nacpan Beach.', highlights: '4km white sand beach, golden hour, beachfront dinner', foodTips: 'Fresh seafood at Nacpan Beach (₱400), San Miguel beer (₱60)', gettingThere: 'Van from Puerto Princesa (₱500, 5 hours), tricycle to Nacpan (₱300)', tips: 'Book van in advance. Stay in El Nido town for easy tour access' },
      { day: 2, activity: 'Tour A: Lagoons & Beaches', cost: 3500, locked: false, description: 'Most popular tour visiting Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu Island, and 7 Commando Beach.', highlights: 'Kayaking in Big Lagoon, swimming through Secret Lagoon entrance, snorkeling', foodTips: 'Lunch included (grilled fish, chicken, rice, fruits)', gettingThere: 'Tour pickup from accommodation (₱1,200 per person)', tips: 'Bring waterproof bag. Rent kayak at Big Lagoon (₱300). Eco tax ₱200' },
      { day: 3, activity: 'Tour C: Hidden Beaches & Shrines', cost: 4500, locked: true, description: 'Visit Hidden Beach, Secret Beach, Matinloc Shrine, Helicopter Island, and Talisay Beach.', highlights: 'Hidden Beach through rock crevice, shrine with panoramic views, pristine beaches', foodTips: 'Lunch on boat (included), bring extra snacks', gettingThere: 'Tour pickup (₱1,400 per person, longer boat ride)', tips: 'Tour C is less crowded than A. Best for photography. Bring drone!' },
      { day: 4, activity: 'Tour B: Caves & Snorkeling', cost: 4500, locked: true, description: 'Explore Cudugnon Cave, Pinagbuyutan Island, Cathedral Cave, and Snake Island sandbar.', highlights: 'Cathedral Cave acoustics, Snake Island sandbar, best snorkeling spots', foodTips: 'Lunch included, dinner at Art Cafe El Nido (₱500)', gettingThere: 'Tour pickup (₱1,300 per person)', tips: 'Bring flashlight for caves. Snake Island best at low tide. Check schedule!' },
    ],
  },
]

// Review templates
const REVIEW_TEMPLATES = [
  { rating: 5, text: 'This guide saved me so much time and money! Every recommendation was spot on. The cost breakdown was incredibly accurate.' },
  { rating: 5, text: 'Best travel vlog I\'ve watched! The itinerary was perfect and the insider tips were gold. Already planning my trip!' },
  { rating: 5, text: 'Amazing content! Loved the detailed day-by-day breakdown. The food recommendations alone were worth it 🔥' },
  { rating: 4, text: 'Really helpful guide with great tips. Would have loved more info on transportation but overall excellent!' },
  { rating: 5, text: 'Exactly what I needed for trip planning. The budget estimates were realistic and the hidden gems were incredible.' },
  { rating: 5, text: 'This creator really knows their stuff! Authentic experiences, no tourist traps. Highly recommend!' },
  { rating: 4, text: 'Great vlog with beautiful cinematography. The itinerary was well-paced and easy to follow.' },
  { rating: 5, text: 'Worth every credit! The locked content had all the details I needed. Already booked my flights!' },
  { rating: 5, text: 'As a solo traveler, this guide gave me confidence to explore. Safety tips were super helpful!' },
  { rating: 4, text: 'Loved the local perspective. Some spots were crowded but that\'s expected. Overall fantastic guide!' },
]

async function main() {
  // Clear all data
  console.log('🗑️  Clearing database...')
  await prisma.unlock.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.itineraryDay.deleteMany({})
  await prisma.vlog.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.travelOption.deleteMany({})

  console.log('Creating travel filter options...')
  await prisma.travelOption.createMany({
    data: Object.entries(TRAVEL_OPTION_SEEDS).flatMap(([category, labels]) =>
      labels.map((label, index) => ({
        category,
        label,
        value: label,
        sortOrder: index,
        active: true,
      })),
    ),
  })

  // Create 10 users with realistic data
  console.log('👥 Creating 10 users...')
  const users = []

  for (let i = 0; i < USERS.length; i++) {
    const userData = USERS[i]
    const user = await prisma.user.create({
      data: {
        handle: userData.handle,
        name: userData.name,
        bio: userData.bio,
        tagline: userData.tagline,
        initials: userData.initials,
        avatarColor: AVATAR_COLORS[i],
        country: userData.country,
        travelStyle: userData.travelStyle,
        verified: i < 5, // First 5 are verified
        followers: Math.floor(Math.random() * 50000) + 5000,
        vlogCount: 5,
        avgRating: 4.5 + Math.random() * 0.5,
        totalViews: Math.floor(Math.random() * 100000) + 10000,
        credits: Math.floor(Math.random() * 2000) + 500,
        earnings: Math.floor(Math.random() * 50000) + 5000,
        youtubeUrl: userData.youtubeUrl,
        instagramUrl: userData.instagramUrl,
        tiktokUrl: userData.tiktokUrl,
      },
    })
    users.push(user)
  }

  // Create vlogs using templates
  console.log('🎬 Creating vlogs with realistic data...')
  const allTemplates = [...VLOG_TEMPLATES, ...MORE_VLOG_TEMPLATES]

  // Create template-based vlogs (high quality)
  for (let i = 0; i < allTemplates.length; i++) {
    const template = allTemplates[i]
    const user = users[i % users.length]

    const vlog = await prisma.vlog.create({
      data: {
        title: template.title,
        location: template.location,
        country: template.country,
        region: template.region,
        vibe: template.vibe,
        cost: template.cost,
        currency: 'PHP',
        duration: template.duration,
        rating: 4.3 + Math.random() * 0.7,
        ratingCount: Math.floor(Math.random() * 500) + 50,
        views: Math.floor(Math.random() * 20000) + 1000,
        likes: Math.floor(Math.random() * 3000) + 100,
        credits: i % 5 === 0 ? 0 : Math.floor(Math.random() * 3) + 2,
        description: template.description,
        youtubeUrl: youtubeTravelUrl(template),
        facebookUrl: facebookTravelUrl(template),
        instagramUrl: instagramTravelUrl(template),
        tiktokUrl: tiktokTravelUrl(template),
        coverImage: coverPhotoUrl(template),
        thumbnailColor: THUMBNAIL_COLORS[i % THUMBNAIL_COLORS.length],
        trending: Math.random() > 0.75,
        status: 'live',
        authorId: user.id,
        itinerary: template.itinerary ? {
          create: template.itinerary.map((day: any) => ({
            day: day.day,
            activity: day.activity,
            cost: day.cost,
            locked: day.locked,
            description: day.description,
            highlights: day.highlights,
            foodTips: day.foodTips,
            gettingThere: day.gettingThere,
            tips: day.tips,
          })),
        } : undefined,
      },
    })

    // Add 3-5 reviews per vlog
    const reviewCount = Math.floor(Math.random() * 3) + 3
    for (let j = 0; j < reviewCount; j++) {
      const review = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)]
      await prisma.review.create({
        data: {
          vlogId: vlog.id,
          authorName: `${['Sarah', 'Mike', 'Emma', 'John', 'Lisa', 'David', 'Anna', 'Chris', 'Maria', 'Tom'][j % 10]} ${['Chen', 'Smith', 'Garcia', 'Lee', 'Kim', 'Patel', 'Wong', 'Johnson', 'Martinez', 'Brown'][j % 10]}`,
          rating: review.rating,
          text: review.text,
        },
      })
    }
  }

  // Generate additional vlogs to reach 50+ total
  console.log('🎬 Generating additional vlogs for variety...')
  const additionalVlogData = [
    { title: 'Cebu City & Oslob: Whale Sharks & Canyoneering', location: 'Cebu', country: 'Philippines', region: 'Philippines', vibe: 'Adventure sports', cost: 14000, duration: 4 },
    { title: 'Kyoto Temple Hopping: 5 Days of Zen & Cherry Blossoms', location: 'Kyoto', country: 'Japan', region: 'Japan', vibe: 'Cultural immersion', cost: 28000, duration: 5 },
    { title: 'Chiang Mai Digital Nomad Guide: Work & Explore', location: 'Chiang Mai', country: 'Thailand', region: 'Southeast Asia', vibe: 'Solo travel', cost: 16000, duration: 7 },
    { title: 'Bali Surf Camp: 6 Days of Waves & Beach Life', location: 'Bali', country: 'Indonesia', region: 'Southeast Asia', vibe: 'Adventure sports', cost: 19000, duration: 6 },
    { title: 'Boracay Party Weekend: 3 Days of Beach Clubs', location: 'Boracay', country: 'Philippines', region: 'Philippines', vibe: 'Nightlife', cost: 11000, duration: 3 },
    { title: 'Osaka Food Tour: Takoyaki, Okonomiyaki & More', location: 'Osaka', country: 'Japan', region: 'Japan', vibe: 'Food & culture', cost: 20000, duration: 3 },
    { title: 'Sapa Rice Terraces Trek: 4 Days in the Mountains', location: 'Sapa', country: 'Vietnam', region: 'Southeast Asia', vibe: 'Mountain hiking', cost: 9000, duration: 4 },
    { title: 'Bangkok Street Food & Temples: 4 Days in the City', location: 'Bangkok', country: 'Thailand', region: 'Southeast Asia', vibe: 'Food & culture', cost: 12000, duration: 4 },
    { title: 'Coron Island Paradise: Kayangan Lake & Shipwrecks', location: 'Coron', country: 'Philippines', region: 'Philippines', vibe: 'Island hopping', cost: 13000, duration: 4 },
    { title: 'Hokkaido Winter Wonderland: Skiing & Hot Springs', location: 'Sapporo', country: 'Japan', region: 'Japan', vibe: 'Wellness & spa', cost: 35000, duration: 5 },
    { title: 'Hoi An Ancient Town: Lanterns, Tailors & Beaches', location: 'Hoi An', country: 'Vietnam', region: 'Southeast Asia', vibe: 'Cultural immersion', cost: 10000, duration: 4 },
    { title: 'Krabi Rock Climbing & Island Hopping Adventure', location: 'Krabi', country: 'Thailand', region: 'Southeast Asia', vibe: 'Adventure sports', cost: 17000, duration: 5 },
    { title: 'Lombok Gili Islands: 5 Days of Diving & Sunsets', location: 'Lombok', country: 'Indonesia', region: 'Southeast Asia', vibe: 'Beach & islands', cost: 16000, duration: 5 },
    { title: 'Baguio Mountain Escape: Strawberry Farms & Cafes', location: 'Baguio', country: 'Philippines', region: 'Philippines', vibe: 'Mountain hiking', cost: 7000, duration: 3 },
    { title: 'Hiroshima Peace & Miyajima Island Day Trip', location: 'Hiroshima', country: 'Japan', region: 'Japan', vibe: 'Historical sites', cost: 15000, duration: 2 },
    { title: 'Halong Bay Cruise: 2 Days on Emerald Waters', location: 'Halong Bay', country: 'Vietnam', region: 'Southeast Asia', vibe: 'Island hopping', cost: 11000, duration: 2 },
    { title: 'Pattaya Beach & Water Sports Weekend', location: 'Pattaya', country: 'Thailand', region: 'Southeast Asia', vibe: 'Adventure sports', cost: 9000, duration: 3 },
    { title: 'Yogyakarta Temples: Borobudur & Prambanan', location: 'Yogyakarta', country: 'Indonesia', region: 'Southeast Asia', vibe: 'Historical sites', cost: 8000, duration: 3 },
    { title: 'Iloilo City Food Trip: La Paz Batchoy & More', location: 'Iloilo', country: 'Philippines', region: 'Philippines', vibe: 'Food & culture', cost: 6000, duration: 2 },
    { title: 'Nara Deer Park & Traditional Japan Experience', location: 'Nara', country: 'Japan', region: 'Japan', vibe: 'Wildlife & nature', cost: 12000, duration: 2 },
    { title: 'Nha Trang Beach Resort: 5 Days of Relaxation', location: 'Nha Trang', country: 'Vietnam', region: 'Southeast Asia', vibe: 'Beach & islands', cost: 13000, duration: 5 },
    { title: 'Koh Samui Full Moon Party & Beach Vibes', location: 'Koh Samui', country: 'Thailand', region: 'Southeast Asia', vibe: 'Nightlife', cost: 18000, duration: 4 },
    { title: 'Seminyak Bali: Beach Clubs & Sunset Bars', location: 'Seminyak', country: 'Indonesia', region: 'Southeast Asia', vibe: 'Nightlife', cost: 21000, duration: 4 },
    { title: 'Dumaguete Diving & Apo Island Marine Sanctuary', location: 'Dumaguete', country: 'Philippines', region: 'Philippines', vibe: 'Wildlife & nature', cost: 10000, duration: 3 },
    { title: 'Fukuoka Ramen Tour: Best Tonkotsu in Japan', location: 'Fukuoka', country: 'Japan', region: 'Japan', vibe: 'Food & culture', cost: 14000, duration: 2 },
    { title: 'Ho Chi Minh City: War History & Street Food', location: 'Ho Chi Minh City', country: 'Vietnam', region: 'Southeast Asia', vibe: 'Historical sites', cost: 9000, duration: 3 },
    { title: 'Ayutthaya Ancient Ruins: Day Trip from Bangkok', location: 'Ayutthaya', country: 'Thailand', region: 'Southeast Asia', vibe: 'Historical sites', cost: 5000, duration: 1 },
    { title: 'Flores Komodo Dragons: 4 Days with Giants', location: 'Flores', country: 'Indonesia', region: 'Southeast Asia', vibe: 'Wildlife & nature', cost: 24000, duration: 4 },
    { title: 'Vigan Heritage Town: Spanish Colonial Philippines', location: 'Vigan', country: 'Philippines', region: 'Philippines', vibe: 'Historical sites', cost: 8000, duration: 2 },
    { title: 'Kobe Beef & Port City Exploration', location: 'Kobe', country: 'Japan', region: 'Japan', vibe: 'Food & culture', cost: 18000, duration: 2 },
    { title: 'Paris Family First-Timers: Museums, Parks & Easy Food Stops', location: 'Paris', country: 'France', region: 'Europe', vibe: 'Family trip', cost: 42000, duration: 4 },
    { title: 'Barcelona to Costa Brava: 5-Day Mediterranean Road Trip', location: 'Barcelona', country: 'Spain', region: 'Europe', vibe: 'Road trip', cost: 38000, duration: 5 },
    { title: 'Lisbon Backpacking Guide: Hills, Hostels & Day Trips', location: 'Lisbon', country: 'Portugal', region: 'Europe', vibe: 'Backpacking', cost: 26000, duration: 4 },
    { title: 'New York Photo Walk: 3 Days of Skyline & Street Shots', location: 'New York City', country: 'USA', region: 'Americas', vibe: 'Photography spots', cost: 52000, duration: 3 },
    { title: 'Banff National Park: Lakes, Wildlife & Mountain Views', location: 'Banff', country: 'Canada', region: 'Americas', vibe: 'Wildlife & nature', cost: 48000, duration: 4 },
    { title: 'Singapore City Break: Hawkers, Gardens & Skyline Views', location: 'Singapore', country: 'Singapore', region: 'Southeast Asia', vibe: 'City break', cost: 30000, duration: 3 },
    { title: 'Rome Ancient Streets: Colosseum, Trastevere & Pasta Nights', location: 'Rome', country: 'Italy', region: 'Europe', vibe: 'Historical sites', cost: 36000, duration: 4 },
    { title: 'Santorini Island Sunsets: Villages, Beaches & Caldera Views', location: 'Santorini', country: 'Greece', region: 'Europe', vibe: 'Beach & islands', cost: 40000, duration: 4 },
    { title: 'Sydney Coastal Weekend: Opera House, Bondi & Harbor Walks', location: 'Sydney', country: 'Australia', region: 'Oceania', vibe: 'City break', cost: 46000, duration: 3 },
    { title: 'London First-Timer Route: Markets, Museums & Thames Views', location: 'London', country: 'United Kingdom', region: 'Europe', vibe: 'Cultural immersion', cost: 45000, duration: 4 },
    { title: 'Mexico City Food & Culture: Tacos, Museums & Historic Plazas', location: 'Mexico City', country: 'Mexico', region: 'Americas', vibe: 'Food & culture', cost: 30000, duration: 4 },
    { title: 'Rio de Janeiro Highlights: Beaches, Viewpoints & Samba Nights', location: 'Rio de Janeiro', country: 'Brazil', region: 'Americas', vibe: 'Nightlife', cost: 34000, duration: 4 },
    { title: 'Cape Town Nature Loop: Table Mountain, Penguins & Winelands', location: 'Cape Town', country: 'South Africa', region: 'Africa', vibe: 'Wildlife & nature', cost: 38000, duration: 5 },
    { title: 'Istanbul Crossroads: Bazaars, Mosques & Bosphorus Ferries', location: 'Istanbul', country: 'Turkey', region: 'Europe', vibe: 'Cultural immersion', cost: 28000, duration: 4 },
  ]

  const locationGuides: Record<string, {
    description: string
    days: Array<{
      activity: string
      description: string
      highlights: string
      foodTips: string
      gettingThere: string
      tips: string
    }>
  }> = {
    Cebu: {
      description: 'Four-day Cebu adventure based around Moalboal sardine runs, Kawasan canyoneering, and an early Oslob whale shark morning, with realistic transfers from Cebu City.',
      days: [
        { activity: 'Cebu City heritage walk and lechon crawl', description: 'Arrive in Cebu City, visit Magellan\'s Cross, Basilica Minore del Santo Nino, Fort San Pedro, and end with a lechon dinner before the southbound trip.', highlights: 'Spanish-era landmarks, Carbon Market, Cebu lechon', foodTips: 'Try Rico\'s or House of Lechon, puso rice, and dried mangoes from Taboan Market.', gettingThere: 'Use Grab between city stops; stay near South Bus Terminal for the next morning.', tips: 'Start early because downtown traffic builds after lunch.' },
        { activity: 'Moalboal sardine run and Panagsama sunset', description: 'Take the bus to Moalboal, snorkel the sardine run just offshore, then settle into Panagsama Beach for sunset.', highlights: 'Millions of sardines, sea turtles, reef drop-off', foodTips: 'Lunch at a Panagsama grill; dinner at Ven\'z Kitchen or a beachfront BBQ stall.', gettingThere: 'Ceres bus from Cebu South Bus Terminal to Moalboal, then tricycle to Panagsama.', tips: 'You can snorkel from shore, so skip overpriced boat offers.' },
        { activity: 'Kawasan Falls canyoneering', description: 'Full-day Badian canyoneering route with river jumps, slides, and the turquoise pools of Kawasan Falls.', highlights: 'Canyon jumps, blue river pools, Kawasan Falls', foodTips: 'Most licensed guides include a simple Filipino lunch after the route.', gettingThere: 'Book a licensed Badian operator with Moalboal hotel pickup.', tips: 'Wear strapped sandals or water shoes and keep valuables in a dry bag.' },
        { activity: 'Oslob whale shark morning and Sumilon sandbar', description: 'Leave before sunrise for Oslob, join the whale shark briefing, then add Sumilon Island if weather and energy allow.', highlights: 'Whale shark viewing, Sumilon sandbar, coastal drive', foodTips: 'Breakfast carinderia near Tan-awan; grilled seafood near Oslob town after the activity.', gettingThere: 'Private van is easiest from Moalboal; buses require an early transfer through Bato.', tips: 'Follow no-touch rules and keep sunscreen reef-safe.' },
      ],
    },
    Kyoto: {
      description: 'A five-day Kyoto culture route focused on temple districts, seasonal gardens, old shopping lanes, and slower neighborhood walks instead of random Japan stops.',
      days: [
        { activity: 'Fushimi Inari and southern Kyoto shrines', description: 'Start with the torii gates at Fushimi Inari, continue to Tofuku-ji, and spend the evening along the Kamo River.', highlights: 'Torii tunnel, Tofuku-ji gardens, riverside sunset', foodTips: 'Inari sushi near the shrine and casual izakaya around Kyoto Station.', gettingThere: 'JR Nara Line to Inari Station; use buses or Keihan trains after.', tips: 'Go before 8am to avoid the heaviest crowds.' },
        { activity: 'Higashiyama, Kiyomizu-dera, and Gion', description: 'Walk Ninenzaka and Sannenzaka lanes, visit Kiyomizu-dera, then look for lantern-lit streets in Gion.', highlights: 'Kiyomizu stage, preserved lanes, Yasaka Pagoda', foodTips: 'Matcha sweets, yudofu tofu lunch, and wagashi from a tea shop.', gettingThere: 'Bus to Gojozaka, then walk downhill toward Gion.', tips: 'Do not photograph geiko or maiko without consent.' },
        { activity: 'Arashiyama bamboo, Tenryu-ji, and river views', description: 'Spend the day in western Kyoto with the bamboo grove, Tenryu-ji garden, Togetsukyo Bridge, and optional monkey park.', highlights: 'Bamboo path, Zen garden, Katsura River', foodTips: 'Soba near Arashiyama Station and soft serve on the main street.', gettingThere: 'JR Sagano Line or Randen tram to Arashiyama.', tips: 'The bamboo grove is best at sunrise or just before closing.' },
        { activity: 'Kinkaku-ji, Ryoan-ji, and Nishiki Market', description: 'Visit Kyoto\'s northwestern temples, then graze through Nishiki Market for small bites and souvenirs.', highlights: 'Golden Pavilion, rock garden, market snacks', foodTips: 'Tamagoyaki, soy milk doughnuts, pickles, and Kyoto-style grilled mochi.', gettingThere: 'Use Kyoto city buses between Kinkaku-ji, Ryoan-ji, and downtown.', tips: 'Carry coins for bus fares and temple entry.' },
        { activity: 'Philosopher\'s Path and tea ceremony', description: 'Walk from Ginkaku-ji along the Philosopher\'s Path, visit small temples, and finish with a formal tea ceremony.', highlights: 'Canal walk, Ginkaku-ji, quiet sub-temples', foodTips: 'Kaiseki lunch if budget allows; otherwise try local curry udon.', gettingThere: 'Bus to Ginkakuji-michi, then walk south along the canal.', tips: 'This day shines in cherry blossom and autumn color seasons.' },
      ],
    },
    'Chiang Mai': {
      description: 'A seven-day Chiang Mai base for solo travelers and remote workers, balancing Nimman cafes, old city temples, Doi Suthep, markets, and ethical nature day trips.',
      days: [
        { activity: 'Old City temples and coworking setup', description: 'Check into Nimman or Old City, buy a SIM, test a coworking space, and visit Wat Chedi Luang at golden hour.', highlights: 'Wat Chedi Luang, moat walk, first coworking session', foodTips: 'Khao soi at Khao Soi Khun Yai and mango sticky rice from a night stall.', gettingThere: 'Use Grab from the airport; Old City and Nimman are 15-20 minutes away.', tips: 'Nimman is better for cafes; Old City is better for walking.' },
        { activity: 'Cafe workday in Nimman and One Nimman', description: 'Work from two reliable cafes, explore One Nimman, and keep the evening open for local food.', highlights: 'Laptop-friendly cafes, design shops, Maya area', foodTips: 'Try Graph Cafe, Roast8ry, or local northern Thai lunch sets.', gettingThere: 'Walk around Nimman or use red songthaews for short hops.', tips: 'Buy something every few hours if you work from a cafe.' },
        { activity: 'Doi Suthep sunrise and forest temple stop', description: 'Ride up early to Wat Phra That Doi Suthep, then stop at Wat Pha Lat on the way down.', highlights: 'Mountain sunrise, golden chedi, jungle temple', foodTips: 'Breakfast near the temple stairs; sai ua sausage in town after.', gettingThere: 'Shared red truck from Chiang Mai University or private Grab.', tips: 'Cover shoulders and knees for temple visits.' },
        { activity: 'Thai cooking class and Saturday market', description: 'Join a market-to-table cooking class, then spend the evening at Wua Lai Saturday Walking Street if timing matches.', highlights: 'Market lesson, curry paste, handmade silver street', foodTips: 'Cooking class meal plus kanom krok and grilled skewers at the market.', gettingThere: 'Most cooking schools include pickup; Wua Lai is south of the Old City.', tips: 'Book a half-day class if you still need work hours.' },
        { activity: 'Sticky Waterfalls and countryside scooter loop', description: 'Take a day trip to Bua Tong Sticky Waterfalls and stop at rural cafes north of the city.', highlights: 'Climbable limestone falls, quiet countryside, mountain roads', foodTips: 'Pack snacks or eat at simple roadside restaurants near the falls.', gettingThere: 'Private driver, tour van, or confident scooter ride of about 1.5 hours.', tips: 'Use grippy sandals and keep electronics away from spray.' },
        { activity: 'Ethical elephant sanctuary day', description: 'Visit a reputable no-riding elephant sanctuary focused on feeding, walking, and learning about rescue work.', highlights: 'Elephant feeding, river walk, conservation talk', foodTips: 'Vegetarian Thai lunch is usually included.', gettingThere: 'Sanctuary pickup from hotel or coworking accommodation.', tips: 'Check reviews carefully and avoid any program offering riding.' },
        { activity: 'Sunday Walking Street and final cafe edits', description: 'Use the morning for work or video editing, then spend the evening at the Sunday Walking Street market.', highlights: 'Handmade crafts, street musicians, temple courtyards', foodTips: 'Northern Thai sampler plates, coconut pancakes, fresh fruit shakes.', gettingThere: 'Market runs through Ratchadamnoen Road in the Old City.', tips: 'Go around 5pm before it becomes shoulder-to-shoulder crowded.' },
      ],
    },
    Bali: {
      description: 'Six-day Bali surf route centered on Canggu, Uluwatu, and beginner-friendly beach breaks, with realistic notes on lessons, traffic, and recovery days.',
      days: [
        { activity: 'Canggu arrival and Batu Bolong sunset', description: 'Settle into Canggu, check board rental shops, and watch surfers at Batu Bolong before your first lesson.', highlights: 'Batu Bolong, surf schools, sunset beach scene', foodTips: 'Smoothie bowl breakfast and nasi campur from a local warung.', gettingThere: 'Airport transfer to Canggu can take 1-2 hours depending on traffic.', tips: 'Book accommodation close to the beach to avoid constant scooter rides.' },
        { activity: 'Beginner surf lesson at Batu Bolong', description: 'Take a morning lesson on softer waves, review footage, and practice pop-ups again before sunset.', highlights: 'First Bali waves, surf coach feedback, beach recovery', foodTips: 'Post-surf brunch at a Canggu cafe; dinner at a warung to save money.', gettingThere: 'Walk to the beach or short scooter ride.', tips: 'Use zinc sunscreen and a rash guard.' },
        { activity: 'Echo Beach progression session', description: 'Move to Echo Beach for a more challenging session if conditions are safe, then recover with a massage.', highlights: 'Echo Beach waves, black sand, surf photography', foodTips: 'Seafood BBQ near Echo Beach and fresh coconut after the session.', gettingThere: 'Scooter or local ride from central Canggu.', tips: 'Ask instructors about tides; Echo can be too heavy for beginners.' },
        { activity: 'Uluwatu cliffs and Padang Padang', description: 'Transfer south to Uluwatu, visit Padang Padang, and watch expert surfers from the cliff bars.', highlights: 'Limestone cliffs, Padang Padang, Uluwatu surf viewpoint', foodTips: 'Fish tacos or nasi goreng near Bingin; sunset drink at Single Fin.', gettingThere: 'Private transfer from Canggu to Uluwatu, about 1.5-2 hours.', tips: 'Do not leave valuables in scooters around beach parking areas.' },
        { activity: 'Balangan or Dreamland surf morning', description: 'Choose Balangan for mellow longboard conditions or Dreamland for a beach day depending on swell.', highlights: 'Balangan viewpoint, reef waves, sunset photos', foodTips: 'Simple warung lunch on Balangan cliff.', gettingThere: 'Scooter between Uluwatu beaches or hire a local driver.', tips: 'Reef booties help at low tide.' },
        { activity: 'Recovery yoga and Jimbaran seafood dinner', description: 'Take a light yoga class, shop for last-minute surf gear, and close the trip with Jimbaran seafood.', highlights: 'Recovery stretch, beach dinner, final sunset', foodTips: 'Choose seafood by weight at Jimbaran and confirm prices before ordering.', gettingThere: 'Driver from Uluwatu to Jimbaran and onward to airport.', tips: 'Leave extra time for evening airport traffic.' },
      ],
    },
  }

  const buildItinerary = (data: typeof additionalVlogData[number]) => {
    const addGuide = (
      location: string,
      description: string,
      days: string[],
      food = 'Use local markets, family-run restaurants, and neighborhood stalls near each stop.',
      transit = 'Use the standard local route for the day and budget extra time during peak hours.',
      tip = 'Check opening hours and weather the night before so the route stays realistic.'
    ) => {
      if (locationGuides[location]) return
      locationGuides[location] = {
        description,
        days: days.map((activity) => ({
          activity,
          description: `${activity} with a practical route through ${location}, paced for filming, meals, and transfers.`,
          highlights: activity,
          foodTips: food,
          gettingThere: transit,
          tips: tip,
        })),
      }
    }

    addGuide('Boracay', 'Three-day Boracay nightlife trip centered on White Beach, sunset sailing, Station 2 beach clubs, and a quieter final morning on the island.', ['Station 2 check-in and White Beach sunset', 'Puka Beach morning and paraw sunset sail', 'Bulabog Beach coffee, beach clubs, and late-night Station 2'], 'Chori burger, calamansi muffins, grilled seafood, and beachfront happy-hour snacks.', 'Tricycle between stations; walk along White Beach when the sand path is faster.', 'Book activities early in the day so nights can stay flexible.')
    addGuide('Osaka', 'Three-day Osaka food route through Dotonbori, Kuromon Market, Shinsekai, and Osaka Castle neighborhoods.', ['Dotonbori takoyaki and canal night walk', 'Kuromon Market breakfast and Osaka Castle afternoon', 'Shinsekai kushikatsu and Umeda city views'], 'Takoyaki, okonomiyaki, kushikatsu, melon pan, and standing sushi counters.', 'Use the Osaka Metro day pass; Namba is the easiest base for food stops.', 'Eat small portions at each stop so the crawl stays fun.')
    addGuide('Sapa', 'Four-day northern Vietnam mountain route based on Sapa town, Muong Hoa valley treks, ethnic villages, and Fansipan views.', ['Sapa town arrival and Ham Rong viewpoint', 'Lao Chai and Ta Van rice terrace trek', 'Fansipan cable car and Silver Waterfall', 'Cat Cat village morning and return transfer'], 'Hotpot, grilled skewers, sticky rice, and homestay family meals.', 'Sleeper bus or train from Hanoi, then local taxis or guided trekking transfers.', 'Bring layers; fog and rain can change the route quickly.')
    addGuide('Bangkok', 'Four-day Bangkok food and temple route through the Old City, Chinatown, canals, and modern market neighborhoods.', ['Grand Palace, Wat Pho, and riverside dinner', 'Chinatown street food crawl on Yaowarat Road', 'Thonburi canal boat and Wat Arun sunset', 'Chatuchak or Or Tor Kor market and Ari cafe stops'], 'Boat noodles, pad kra pao, mango sticky rice, Thai milk tea, and Chinatown seafood.', 'Use BTS/MRT where possible, then river boats for Old City and temple days.', 'Dress modestly for temples and carry cash for street stalls.')
    addGuide('Coron', 'Four-day Coron island-hopping itinerary focused on Kayangan Lake, Twin Lagoon, reef snorkeling, and a relaxed town base.', ['Coron town arrival and Mt. Tapyas sunset', 'Ultimate island tour with Kayangan Lake and Twin Lagoon', 'Reef and wreck snorkeling around Lusong', 'Maquinit Hot Spring recovery and town food crawl'], 'Grilled fish, kinilaw, cashew snacks, and simple boat-tour lunches.', 'Fly to Busuanga, van to Coron town, then join boat tours from the pier.', 'Dry bags are essential because boat transfers can get splashy.')
    addGuide('Sapporo', 'Five-day Hokkaido winter trip based around Sapporo food, ski slopes, Otaru canal, and onsen recovery.', ['Sapporo arrival, Odori Park, and ramen alley', 'Teine or Kokusai ski day', 'Otaru canal, glass shops, and seafood bowls', 'Jozankei onsen day trip', 'Nijo Market breakfast and final snow festival spots'], 'Miso ramen, soup curry, jingisukan lamb, seafood bowls, and soft-serve milk ice cream.', 'Use JR trains for Otaru, ski buses for resorts, and local subway in Sapporo.', 'Winter boots matter more than style on icy sidewalks.')
    addGuide('Hoi An', 'Four-day Hoi An culture route through the Ancient Town, tailoring appointments, cooking class, and An Bang Beach.', ['Ancient Town lantern walk and Japanese Bridge', 'Tailor fitting and basket boat village', 'Tra Que cooking class and An Bang Beach', 'My Son Sanctuary sunrise and final lantern night'], 'Cao lau, white rose dumplings, banh mi Phuong, and market cooking class dishes.', 'Walk or cycle in town; use a driver for My Son and beach transfers.', 'Buy the Ancient Town ticket and save the stubs for heritage houses.')
    addGuide('Krabi', 'Five-day Krabi adventure itinerary around Railay climbing, Ao Nang island hopping, emerald pools, and Hong Islands.', ['Ao Nang arrival and sunset beach walk', 'Railay rock climbing beginner session', 'Four Islands longtail boat tour', 'Emerald Pool, Hot Springs, and Tiger Cave viewpoint', 'Hong Islands kayaking and snorkeling'], 'Thai pancakes, seafood BBQ, boat-tour lunches, and night-market curries.', 'Base in Ao Nang; use longtail boats to Railay and tours for outer islands.', 'Check tide and weather before booking climbing or kayaking.')
    addGuide('Lombok', 'Five-day Lombok and Gili Islands beach route with snorkeling, sunsets, waterfalls, and slower island days.', ['Senggigi or Kuta Lombok arrival and beach sunset', 'Transfer to Gili Trawangan and sunset cycling', 'Gili snorkeling with turtles and underwater statues', 'North Lombok waterfalls at Sendang Gile and Tiu Kelep', 'Kuta Lombok beaches and Merese Hill sunset'], 'Grilled fish, nasi campur, smoothie bowls, and Lombok-style ayam taliwang.', 'Use fast boats for Gilis, private driver for waterfalls, and scooters on quieter roads.', 'Respect local customs outside resort areas and dress modestly in villages.')
    addGuide('Baguio', 'Three-day Baguio mountain escape with parks, strawberry farms, cafes, and Cordillera food stops.', ['Burnham Park, Session Road, and night market', 'La Trinidad strawberry farm and BenCab Museum', 'Mines View, Wright Park, and cafe hopping'], 'Strawberry taho, Good Taste meals, ube jam, craft coffee, and Cordillera dishes.', 'Victory Liner bus from Manila; taxis are affordable around Baguio.', 'Bring a jacket and expect traffic on weekends.')
    addGuide('Hiroshima', 'Two-day Hiroshima history route with Peace Memorial Park, okonomiyaki, and a Miyajima island day.', ['Peace Memorial Park, museum, and Hiroshima okonomiyaki', 'Miyajima ferry, Itsukushima Shrine, and Mt. Misen views'], 'Hiroshima-style okonomiyaki, oysters on Miyajima, momiji manju sweets.', 'Streetcar around Hiroshima; JR train and ferry to Miyajima.', 'Give the museum enough quiet time; it is emotionally heavy.')
    addGuide('Halong Bay', 'Two-day Halong Bay cruise itinerary with limestone karsts, kayaking, cave visits, and sunrise on deck.', ['Hanoi transfer, cruise boarding, kayaking, and sunset deck views', 'Tai chi sunrise, cave visit, brunch cruise, and return to Hanoi'], 'Cruise meals are usually included; bring snacks and water for the bus transfer.', 'Book a cruise with Hanoi pickup or transfer through Tuan Chau Harbor.', 'Choose Lan Ha Bay if you want fewer boats.')
    addGuide('Pattaya', 'Three-day Pattaya water-sports weekend with Koh Larn beaches, parasailing options, and a city viewpoint.', ['Pattaya Beach arrival and viewpoint sunset', 'Koh Larn island beaches and snorkeling', 'Jomtien water sports and seafood dinner'], 'Beach seafood, Thai omelets, grilled squid, and fresh fruit shakes.', 'Bus or van from Bangkok, songthaews around Pattaya, ferry to Koh Larn.', 'Agree on water-sports prices before starting.')
    addGuide('Yogyakarta', 'Three-day Yogyakarta heritage route focused on Borobudur sunrise, Prambanan sunset, and the Kraton area.', ['Malioboro, Kraton, and Taman Sari water castle', 'Borobudur sunrise and village cycling', 'Prambanan temple sunset and Ramayana ballet'], 'Gudeg, bakpia, kopi joss, and local market snacks.', 'Hire a driver for Borobudur and Prambanan; use becak for short city hops.', 'Book Borobudur climb slots ahead because access can be limited.')
    addGuide('Iloilo', 'Two-day Iloilo food trip through La Paz, heritage mansions, river esplanade, and batchoy landmarks.', ['La Paz batchoy crawl and Iloilo River Esplanade', 'Jaro Cathedral, Molo Mansion, and seafood dinner'], 'La Paz batchoy, pancit molo, biscocho, Roberto\'s siopao, and fresh seafood.', 'Use taxis or jeepneys between districts; the esplanade is best walked.', 'Go hungry because portions are generous.')
    addGuide('Nara', 'Two-day Nara nature and tradition route with deer park, Todai-ji, Kasuga Taisha, and old merchant streets.', ['Nara Park, Todai-ji, and deer encounters', 'Kasuga Taisha, Isuien Garden, and Naramachi lanes'], 'Kakinoha sushi, mochi pounding at Nakatanidou, and local tea sweets.', 'JR or Kintetsu train from Osaka/Kyoto; walk most major sights.', 'Feed deer only official crackers and bow before offering them.')
    addGuide('Nha Trang', 'Five-day Nha Trang beach-resort route with island snorkeling, mud baths, Cham towers, and seafood nights.', ['Beach arrival and Tran Phu sunset walk', 'Hon Mun snorkeling island tour', 'Po Nagar Cham Towers and mud bath spa', 'VinWonders or Hon Tre island day', 'Local market breakfast and seafood finale'], 'Seafood hotpot, nem nuong, banh can, and fresh lobster if budget allows.', 'Airport bus or taxi into town; tours include boat transfers.', 'Choose a central hotel if you want easy beach and food access.')
    addGuide('Koh Samui', 'Four-day Koh Samui nightlife and beach route with Chaweng, Ang Thong marine park, and island viewpoints.', ['Chaweng Beach arrival and night market', 'Ang Thong Marine Park snorkeling and viewpoints', 'Fisherman\'s Village, Big Buddha, and beach bars', 'Lamai viewpoints and final sunset party'], 'Night-market seafood, coconut ice cream, Thai curries, and beach-bar snacks.', 'Fly or ferry to Samui; use songthaews, scooters, or private drivers.', 'Full Moon Party is on Koh Phangan, so plan ferry timing if adding it.')
    addGuide('Seminyak', 'Four-day Seminyak nightlife route around beach clubs, sunset bars, boutiques, and nearby Canggu.', ['Seminyak check-in, Petitenget Beach, and sunset bar', 'Boutique shopping and Potato Head beach club', 'Canggu brunch, Batu Bolong, and La Brisa evening', 'Spa recovery and Jimbaran-style seafood dinner'], 'Nasi campur, brunch cafes, seafood grills, and late-night satay.', 'Use Grab/Gojek where allowed and expect traffic between Seminyak and Canggu.', 'Reserve popular beach clubs before sunset.')
    addGuide('Dumaguete', 'Three-day Dumaguete nature route with Apo Island turtles, Dauin diving, and city food stops.', ['Dumaguete boulevard arrival and silvanas crawl', 'Apo Island snorkeling with sea turtles', 'Dauin dive morning and Twin Lakes viewpoint'], 'Silvanas, budbud kabog, chicken inato, and grilled seafood.', 'Fly or ferry to Dumaguete; boat tours leave from Malatapay for Apo.', 'Use reef-safe sunscreen and keep distance from turtles.')
    addGuide('Fukuoka', 'Two-day Fukuoka ramen route through Hakata, yatai stalls, Canal City, and seaside views.', ['Hakata ramen shops and Nakasu yatai night', 'Ohori Park, teamLab Forest area, and final tonkotsu bowl'], 'Hakata tonkotsu ramen, mentaiko, motsunabe, and yatai skewers.', 'Use subway from airport to Hakata/Tenjin; most stops are close.', 'Yatai stalls are small, so avoid lingering after eating.')
    addGuide('Ho Chi Minh City', 'Three-day Ho Chi Minh City history and food itinerary covering war landmarks, French-era streets, markets, and scooter food culture.', ['War Remnants Museum, Independence Palace, and Notre-Dame area', 'Cu Chi Tunnels half-day and Ben Thanh evening food', 'Cafe apartment, Chinatown markets, and scooter street-food tour'], 'Banh mi, com tam, pho, egg coffee, and late-night seafood snails.', 'Use Grab bikes for short hops; book a tour for Cu Chi Tunnels.', 'Museum content is intense, so avoid overpacking that day.')
    addGuide('Ayutthaya', 'One-day Ayutthaya temple loop from Bangkok with ruins, river views, and sunset over the old capital.', ['Wat Mahathat, Wat Chaiwatthanaram, and riverside ruins loop'], 'Boat noodles, roti sai mai, grilled river prawns, and iced Thai tea.', 'Train or van from Bangkok, then bicycle, tuk-tuk, or hired driver around ruins.', 'Start early and carry water because shade is limited.')
    addGuide('Flores', 'Four-day Flores and Komodo route with Labuan Bajo, Komodo dragons, Padar Island, and snorkeling stops.', ['Labuan Bajo arrival and harbor sunset', 'Padar Island sunrise and Pink Beach snorkeling', 'Komodo or Rinca dragon ranger walk', 'Kelor Island, Kanawa snorkeling, and departure'], 'Boat meals, grilled fish in Labuan Bajo, nasi goreng, and fresh fruit.', 'Fly to Labuan Bajo; join a liveaboard or day boat from the harbor.', 'Use licensed rangers and never approach Komodo dragons for photos.')
    addGuide('Vigan', 'Two-day Vigan heritage route through Calle Crisologo, museums, pottery, and Ilocano food.', ['Calle Crisologo, Syquia Mansion, and kalesa ride', 'Pagburnayan pottery, Bantay Bell Tower, and Ilocano food crawl'], 'Vigan longganisa, empanada, bagnet, poqui-poqui, and royal bibingka.', 'Bus from Manila or Laoag, then walk or take kalesa inside the heritage core.', 'Calle Crisologo is best early morning before souvenir crowds.')
    addGuide('Kobe', 'Two-day Kobe food route with beef tasting, port views, Kitano houses, and sake breweries.', ['Kobe beef lunch, Kitano-cho houses, and Harborland night view', 'Nada sake brewery walk and Nunobiki Herb Garden'], 'Kobe beef set lunch, croquettes, sake tastings, and bakery sweets.', 'Use JR/Sanyo lines from Osaka; local trains and ropeway in Kobe.', 'Lunch sets are cheaper than dinner for Kobe beef.')
    addGuide('Paris', 'Four-day Paris family itinerary with low-stress museum timing, parks, river views, and food stops that work for first-time visitors with kids.', ['Eiffel Tower picnic and Seine river cruise', 'Louvre highlights and Tuileries Garden break', 'Montmartre, carousel stops, and Sacre-Coeur sunset', 'Jardin du Luxembourg, crepes, and family museum time'], 'Crepes, bakery sandwiches, hot chocolate, picnic groceries, and casual brasseries.', 'Use Metro lines for longer hops, but keep each day clustered to avoid tired transfers.', 'Pre-book timed museum entries and build in playground breaks.')
    addGuide('Barcelona', 'Five-day Barcelona and Costa Brava road trip from Gaudi landmarks to Girona lanes, seaside coves, and cliffside Mediterranean viewpoints.', ['Barcelona Gothic Quarter and tapas night', 'Sagrada Familia, Park Guell, and Gracia', 'Montserrat mountain drive and monastery stop', 'Girona old town and Costa Brava base', 'Calella de Palafrugell coves and coastal road back'], 'Tapas, paella away from tourist strips, market fruit, crema catalana, and seafood by the coast.', 'Use public transit inside Barcelona, then rent a car for Montserrat and Costa Brava days.', 'Reserve parking near old towns and avoid driving inside central Barcelona.')
    addGuide('Lisbon', 'Four-day Lisbon backpacking guide built around hostels, viewpoints, trams, Sintra, and cheap local food.', ['Alfama walk, miradouros, and hostel dinner', 'Belem monuments and LX Factory afternoon', 'Sintra day trip to Pena Palace and Moorish Castle', 'Cascais coast, Time Out Market, and final tram ride'], 'Pastel de nata, bifana sandwiches, bacalhau plates, hostel dinners, and market snacks.', 'Use Viva Viagem transit cards, trains for Sintra/Cascais, and walking shoes for hills.', 'Stay near Baixa, Rossio, or Cais do Sodre for easy late arrivals.')
    addGuide('New York City', 'Three-day New York photography route covering skyline views, classic streets, bridges, and golden-hour spots without scattering across too many boroughs.', ['DUMBO, Brooklyn Bridge, and Chinatown night shots', 'Central Park, Top of the Rock, and Midtown street scenes', 'West Village, High Line, and Staten Island Ferry skyline'], 'Bagels, pizza slices, halal cart platters, Chinatown dumplings, and deli coffee.', 'Use subway tap-to-pay; group shoots by borough to reduce train backtracking.', 'Carry a small setup because tripods are restricted in many places.')
    addGuide('Banff', 'Four-day Banff National Park route for lake views, wildlife-safe stops, gondola viewpoints, and scenic mountain driving.', ['Banff town arrival, Bow Falls, and Vermilion Lakes sunset', 'Lake Louise, Moraine Lake shuttle, and easy lakeshore walks', 'Icefields Parkway viewpoints and Peyto Lake', 'Banff Gondola, Johnston Canyon, and wildlife-safe evening drive'], 'Pack picnic lunches, try Alberta beef, and book casual dinners in Banff town early.', 'Use Parks Canada shuttles for Moraine Lake and a rental car for Icefields Parkway.', 'Keep distance from wildlife and check seasonal road closures before driving.')
    addGuide('Singapore', 'Three-day Singapore city break with hawker centers, Gardens by the Bay, heritage neighborhoods, and skyline viewpoints grouped by MRT-friendly routes.', ['Marina Bay, Gardens by the Bay, and Spectra light show', 'Chinatown, Maxwell Food Centre, and Kampong Glam', 'Jewel Changi, Orchard, and rooftop skyline finale'], 'Chicken rice, laksa, kaya toast, satay, kopi, and hawker-center desserts.', 'Use MRT and contactless payment; taxis are useful late at night or with luggage.', 'Book paid attractions ahead and leave time for airport Jewel before departure.')
    addGuide('Rome', 'Four-day Rome history route with ancient landmarks, neighborhood walks, and realistic food stops grouped to avoid crossing the city too often.', ['Colosseum, Roman Forum, and Monti dinner', 'Vatican Museums, St. Peter\'s, and Prati gelato', 'Pantheon, Piazza Navona, and Campo de\' Fiori', 'Trastevere lanes, Janiculum views, and pasta night'], 'Carbonara, supplì, maritozzi, gelato, espresso bars, and trattoria pasta.', 'Use Metro for Colosseum/Vatican days and walk the historic center in clusters.', 'Book Colosseum and Vatican tickets ahead, especially from spring to autumn.')
    addGuide('Santorini', 'Four-day Santorini island route focused on caldera viewpoints, village walks, beaches, boat time, and sunset pacing.', ['Fira arrival, caldera walk, and sunset dinner', 'Oia lanes, Ammoudi Bay, and blue-domed photo stops', 'Red Beach, Perissa Beach, and winery sunset', 'Caldera boat trip and final village stroll'], 'Greek salad, souvlaki, tomatokeftedes, fresh seafood, and local wine.', 'Use buses between main villages or rent a car/ATV for beach days.', 'Reserve sunset restaurants early and avoid midday walks in peak summer heat.')
    addGuide('Sydney', 'Three-day Sydney city and coast route with harbor landmarks, beaches, ferries, and walkable neighborhoods.', ['Opera House, Circular Quay, and The Rocks', 'Bondi to Coogee coastal walk and beach afternoon', 'Manly ferry, harbor views, and Surry Hills dinner'], 'Meat pies, flat whites, fish and chips, Thai food, and brunch cafes.', 'Use Opal/contactless payments on trains, buses, light rail, and ferries.', 'Start coastal walks early for better light and fewer crowds.')
    addGuide('London', 'Four-day London first-timer itinerary balancing museums, markets, river views, and classic neighborhoods.', ['Westminster, South Bank, and Thames evening walk', 'British Museum, Covent Garden, and Soho food stops', 'Tower of London, Borough Market, and Tower Bridge', 'Notting Hill, Hyde Park, and Kensington museums'], 'Market lunches, fish and chips, curries, afternoon tea, and bakery stops.', 'Use the Tube with contactless payment and cluster stops by zone.', 'Many museums are free, but timed slots and paid exhibits should be booked early.')
    addGuide('Mexico City', 'Four-day Mexico City culture and food route through historic plazas, museums, neighborhoods, and taco stops.', ['Zocalo, Templo Mayor, and Centro Historico food crawl', 'Chapultepec, Anthropology Museum, and Condesa evening', 'Coyoacan, Frida Kahlo Museum, and market lunch', 'Roma Norte cafes, murals, and late taco route'], 'Tacos al pastor, churros, tamales, pozole, tostadas, and cafe de olla.', 'Use Uber/Didi for late evenings and Metro/Metrobus for simple daytime routes.', 'Book Frida Kahlo Museum tickets ahead and watch altitude fatigue on day one.')
    addGuide('Rio de Janeiro', 'Four-day Rio route with beaches, viewpoints, samba energy, and safer transport choices.', ['Copacabana and Ipanema beach orientation', 'Christ the Redeemer, Botanical Garden, and lagoon sunset', 'Sugarloaf Mountain and Urca evening', 'Santa Teresa, Selaron Steps, and samba night'], 'Acai bowls, feijoada, pão de queijo, grilled seafood, and brigadeiros.', 'Use rideshare at night and official vans/tours for major viewpoints.', 'Keep beach days simple and avoid carrying valuables on the sand.')
    addGuide('Cape Town', 'Five-day Cape Town nature loop with mountain views, coast roads, penguins, wine country, and city food.', ['V&A Waterfront, Bo-Kaap, and Signal Hill sunset', 'Table Mountain and Camps Bay coast', 'Cape Peninsula drive, Cape Point, and Boulders penguins', 'Kirstenbosch Gardens and Constantia wine route', 'Robben Island or Woodstock market finale'], 'Cape Malay curry, seafood, bobotie, braai, and wine farm lunches.', 'Rent a car or book day tours for peninsula and wine routes; use rideshare in the city.', 'Check Table Mountain wind closures before committing to cableway tickets.')
    addGuide('Istanbul', 'Four-day Istanbul cultural route linking historic mosques, bazaars, ferry rides, and food neighborhoods across two continents.', ['Sultanahmet: Hagia Sophia, Blue Mosque, and Basilica Cistern', 'Grand Bazaar, Spice Bazaar, and Eminonu street food', 'Bosphorus ferry, Galata, and Karakoy cafes', 'Kadikoy market, Moda waterfront, and final hammam'], 'Simit, kebabs, meze, baklava, Turkish coffee, fish sandwiches, and menemen.', 'Use Istanbulkart for trams, metro, ferries, and buses.', 'Dress modestly for mosques and visit bazaars earlier for calmer browsing.')

    const guide = locationGuides[data.location]
    if (!guide) {
      return Array.from({ length: data.duration }, (_, dayIdx) => ({
        day: dayIdx + 1,
        activity: `${data.location} essential route day ${dayIdx + 1}`,
        cost: Math.floor(data.cost / data.duration),
        locked: dayIdx >= 2,
        description: `A focused day in ${data.location} built around the ${data.vibe.toLowerCase()} theme, with realistic pacing and local transit.`,
        highlights: `${data.location} landmarks and neighborhood stops that match ${data.vibe.toLowerCase()}.`,
        foodTips: `Try local restaurants near the day ${dayIdx + 1} route instead of tourist-only chains.`,
        gettingThere: `Use the most common local transport around ${data.location}; budget extra time at peak hours.`,
        tips: `Keep this day flexible for weather, queues, and local opening hours.`,
      }))
    }

    return guide.days.map((day, dayIdx) => ({
      day: dayIdx + 1,
      activity: day.activity,
      cost: Math.floor(data.cost / data.duration),
      locked: dayIdx >= 2,
      description: day.description,
      highlights: day.highlights,
      foodTips: day.foodTips,
      gettingThere: day.gettingThere,
      tips: day.tips,
    }))
  }

  for (let i = 0; i < additionalVlogData.length; i++) {
    const data = additionalVlogData[i]
    const user = users[i % users.length]
    const itinerary = buildItinerary(data)
    const guide = locationGuides[data.location]

    const vlog = await prisma.vlog.create({
      data: {
        title: data.title,
        location: data.location,
        country: data.country,
        region: data.region,
        vibe: data.vibe,
        cost: data.cost,
        currency: 'PHP',
        duration: data.duration,
        rating: 4.0 + Math.random() * 1.0,
        ratingCount: Math.floor(Math.random() * 300) + 20,
        views: Math.floor(Math.random() * 15000) + 500,
        likes: Math.floor(Math.random() * 2000) + 50,
        credits: i % 6 === 0 ? 0 : Math.floor(Math.random() * 4) + 1,
        description: guide?.description || `Complete ${data.location} travel guide covering the best experiences, local tips, and budget breakdown. Perfect for ${data.vibe.toLowerCase()} enthusiasts!`,
        youtubeUrl: youtubeTravelUrl(data),
        facebookUrl: facebookTravelUrl(data),
        instagramUrl: instagramTravelUrl(data),
        tiktokUrl: tiktokTravelUrl(data),
        coverImage: coverPhotoUrl(data),
        thumbnailColor: THUMBNAIL_COLORS[i % THUMBNAIL_COLORS.length],
        trending: Math.random() > 0.8,
        status: 'live',
        authorId: user.id,
        itinerary: {
          create: itinerary,
        },
      },
    })

    // Add 2-4 reviews
    const reviewCount = Math.floor(Math.random() * 3) + 2
    for (let j = 0; j < reviewCount; j++) {
      const review = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)]
      await prisma.review.create({
        data: {
          vlogId: vlog.id,
          authorName: `Traveler${Math.floor(Math.random() * 9999)}`,
          rating: review.rating,
          text: review.text,
        },
      })
    }
  }

  // Create some unlocks (users unlocking premium content)
  console.log('🔓 Creating unlocks...')
  const vlogs = await prisma.vlog.findMany({ take: 30 })
  for (const vlog of vlogs) {
    const randomUser = users[Math.floor(Math.random() * users.length)]
    try {
      await prisma.unlock.create({
        data: {
          vlogId: vlog.id,
          userId: randomUser.id,
        },
      })
    } catch {
      // Ignore duplicate unlocks
    }
  }

  const totalVlogs = await prisma.vlog.count()
  const totalReviews = await prisma.review.count()
  const seededVlogInputs = [
    ...VLOG_TEMPLATES,
    ...MORE_VLOG_TEMPLATES,
    ...additionalVlogData,
  ]
  const seededVibes = new Set([
    ...seededVlogInputs.map(v => v.vibe),
  ])
  const seededCountries = new Set([
    ...seededVlogInputs.map(v => v.country),
  ])
  const seededBudgets = new Set([
    ...seededVlogInputs.map(v => {
      if (v.cost < 10000) return 'Under PHP 10k'
      if (v.cost <= 30000) return 'PHP 10k - PHP 30k'
      return 'Above PHP 30k'
    }),
    'Free vlogs only',
  ])

  console.log('✅ Seed complete!')
  console.log(`📊 Created:`)
  console.log(`   • ${USERS.length} users with social media links`)
  console.log(`   • ${totalVlogs} vlogs with realistic data`)
  console.log(`   • ${totalReviews} authentic reviews`)
  console.log(`   • Coverage across ${seededVibes.size}/${FALLBACK_VIBES.length} frontend vibes`)
  console.log(`   • Coverage across ${seededCountries.size}/${FALLBACK_COUNTRIES.length} frontend countries`)
  console.log(`   • Coverage across ${seededBudgets.size}/4 frontend budget filters`)
  console.log(`   • ${FALLBACK_COUNTRIES.length + FALLBACK_VIBES.length + FALLBACK_BUDGETS.length} travel filter options saved to the database`)
  console.log(`   • Unlocks and engagement data`)
  console.log(`   • Accessible social media URLs (YouTube, Instagram, TikTok, Facebook)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
