import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const lockFor = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoUrl = (location: string, country: string, theme = 'travel guide') =>
  `https://loremflickr.com/1600/1000/${encodeURIComponent(`${location} ${country} ${theme}`)},travel/all?lock=${lockFor(`${location}-${country}-${theme}`)}`

const youtubeIdFromUrl = (url?: string | null) => {
  if (!url) return ''
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/)
  return match?.[1] || ''
}

const highResYoutubeThumb = (url?: string | null) => {
  const id = youtubeIdFromUrl(url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : ''
}

const isLowResolutionCover = (url?: string | null) => {
  if (!url) return true
  return (
    /\/(?:default|mqdefault|hqdefault|sddefault)\.jpg(?:\?|$)/i.test(url) ||
    /loremflickr\.com\/(?:640|800|1024|1200)\//i.test(url) ||
    /loremflickr\.com\/\d+\/(?:480|600|720|800)\//i.test(url)
  )
}

const bestCoverFor = (vlog: { coverImage?: string | null; youtubeUrl?: string | null; location: string; country: string; vibe: string }) => {
  if (!isLowResolutionCover(vlog.coverImage)) return vlog.coverImage || ''
  const location = vlog.location.split(',')[0]?.trim() || vlog.location || vlog.country
  return highResYoutubeThumb(vlog.youtubeUrl) || coverPhotoUrl(location, vlog.country, vlog.vibe)
}

const clipVloggers = [
  { handle: 'MarisolRoams', name: 'Marisol Santos', initials: 'MS', country: 'Philippines', avatarColor: 'ag', travelStyle: 'Beach & islands' },
  { handle: 'TravelWithKai', name: 'Kai Nakamura', initials: 'KN', country: 'Japan', avatarColor: 'ac', travelStyle: 'Cultural immersion' },
  { handle: 'ExploreEthan', name: 'Ethan Park', initials: 'EP', country: 'Thailand', avatarColor: 'at', travelStyle: 'Food & culture' },
  { handle: 'EloiseVoyage', name: 'Eloise Cruz', initials: 'EC', country: 'Indonesia', avatarColor: 'ab', travelStyle: 'Beach & islands' },
  { handle: 'NomadNina', name: 'Nina Dubois', initials: 'ND', country: 'France', avatarColor: 'ap', travelStyle: 'City breaks' },
]

const tourMeStops = [
  {
    spot: 'El Nido',
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Beach & islands',
    reason: 'Island lagoons, limestone cliffs, and clear water',
    clips: [
      { title: 'Big Lagoon kayak adventure', url: 'https://www.youtube.com/shorts/LdKdP6hl6IE', description: 'Kayak through clear water and limestone walls in Big Lagoon.' },
      { title: 'Secret Beach exploration', url: 'https://www.youtube.com/shorts/eD5gTYRoK1Q', description: 'Find hidden coves and quiet sand pockets around El Nido.' },
      { title: 'Island hopping highlights', url: 'https://www.youtube.com/shorts/1hrEtHyC-WM', description: 'Preview the classic island-hopping route and lunch stops.' },
      { title: 'Nacpan Beach sunset', url: 'https://www.youtube.com/shorts/luRbeAmlLQc', description: 'End the day on a long golden beach north of town.' },
      { title: 'El Nido town food walk', url: 'https://www.youtube.com/shorts/KoW6dO14M8k', description: 'Walk the town center for casual food, cafes, and boat-tour planning.' },
    ],
  },
  {
    spot: 'Kyoto',
    country: 'Japan',
    region: 'Japan',
    vibe: 'Cultural immersion',
    reason: 'Temples, old streets, gardens, and seasonal beauty',
    clips: [
      { title: 'Fushimi Inari shrine walk', url: 'https://www.youtube.com/shorts/53r0juQgcs4', description: 'Walk the torii gate trail early before the crowds arrive.' },
      { title: 'Arashiyama bamboo forest', url: 'https://www.youtube.com/shorts/I6UPbnCDEOY', description: 'Move through bamboo paths and nearby temple lanes.' },
      { title: 'Gion geisha district', url: 'https://www.youtube.com/shorts/J_dGX9pPh6o', description: 'Explore old Kyoto streets, teahouses, and evening lanterns.' },
      { title: 'Kiyomizu-dera temple', url: 'https://www.youtube.com/shorts/cIWTSQa-r9Q', description: 'Visit the hillside temple and surrounding lanes.' },
      { title: 'Nishiki Market food tour', url: 'https://www.youtube.com/shorts/qqU9AgS7qZ0', description: 'Taste snacks and small bites through Kyoto’s kitchen market.' },
    ],
  },
  {
    spot: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    vibe: 'Food & culture',
    reason: 'Street food, temples, markets, and nightlife',
    clips: [
      { title: 'Yaowarat street food heaven', url: 'https://www.youtube.com/shorts/RYwzrKxCv1k', description: 'Taste Chinatown classics on Bangkok’s brightest food street.' },
      { title: 'Wat Arun temple route', url: 'https://www.youtube.com/shorts/a4bXSTSwhKE', description: 'Cross the river for temple views and sunset color.' },
      { title: 'Chatuchak weekend market', url: 'https://www.youtube.com/shorts/HtbeuimTI6U', description: 'Browse market lanes for snacks, clothes, and souvenirs.' },
      { title: 'Floating market experience', url: 'https://www.youtube.com/shorts/ro0cSvGoLUQ', description: 'Ride the canals and sample boat-side food.' },
      { title: 'Bangkok rooftop night', url: 'https://www.youtube.com/shorts/JjV0jPCWj9A', description: 'Finish with skyline views above the city.' },
    ],
  },
  {
    spot: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    vibe: 'Beach & islands',
    reason: 'Beaches, rice terraces, temples, and surf culture',
    clips: [
      { title: 'Tegalalang rice terraces', url: 'https://www.youtube.com/shorts/vYbKn1uE3zo', description: 'Walk green terraces and viewpoints near Ubud.' },
      { title: 'Uluwatu temple sunset', url: 'https://www.youtube.com/shorts/GdlfFIsjwn4', description: 'Catch ocean cliffs, temple paths, and sunset light.' },
      { title: 'Bali waterfall chasing', url: 'https://www.youtube.com/shorts/8FUc7MAXv4s', description: 'Preview jungle waterfalls and swim stops.' },
      { title: 'Canggu beach life', url: 'https://www.youtube.com/shorts/PJDvoQGcNE0', description: 'See surf breaks, cafes, and sunset beach energy.' },
      { title: 'Tanah Lot temple walk', url: 'https://www.youtube.com/shorts/q1NrZ2_FKpE', description: 'Visit the sea temple at golden hour.' },
    ],
  },
  {
    spot: 'Paris',
    country: 'France',
    region: 'Europe',
    vibe: 'City break',
    reason: 'Museums, cafes, architecture, and classic city walks',
    clips: [
      { title: 'Eiffel Tower sunrise', url: 'https://www.youtube.com/shorts/VLpo8wz2vAU', description: 'Start with quiet tower views before the crowds.' },
      { title: 'Louvre courtyard walk', url: 'https://www.youtube.com/shorts/8o3M2YtB7H8', description: 'Move through the Louvre approach and museum exterior.' },
      { title: 'Montmartre cafe lane', url: 'https://www.youtube.com/shorts/hFafNlpnIWo', description: 'Climb toward Sacre-Coeur through old cafe streets.' },
      { title: 'Seine river walk', url: 'https://www.youtube.com/shorts/_gIljISgm_k', description: 'Follow bridges, bookstalls, and riverside views.' },
      { title: 'Paris cafe culture', url: 'https://www.youtube.com/shorts/zoGW4H2IHEs', description: 'Slow down with pastries, espresso, and people watching.' },
    ],
  },
  {
    spot: 'Rome',
    country: 'Italy',
    region: 'Europe',
    vibe: 'Historical sites',
    reason: 'Ancient landmarks, piazzas, and food neighborhoods',
    clips: [
      { title: 'Colosseum exterior loop', url: 'https://www.youtube.com/shorts/xVAvjSiXdhM', description: 'Walk around Rome’s most iconic ancient landmark.' },
      { title: 'Trastevere pasta night', url: 'https://www.youtube.com/shorts/28_DXf9HVmY', description: 'Preview evening lanes and classic Roman food.' },
      { title: 'Trevi Fountain early walk', url: 'https://www.youtube.com/shorts/e8qMtyhWIig', description: 'Visit the fountain before peak crowds.' },
      { title: 'Pantheon piazza route', url: 'https://www.youtube.com/shorts/WtDHWAXYrQU', description: 'Walk the ancient dome and surrounding piazzas.' },
      { title: 'Vatican City morning', url: 'https://www.youtube.com/shorts/K4ecTRKOF4c', description: 'Plan the Vatican area before lines build.' },
    ],
  },
  {
    spot: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    vibe: 'Beach & islands',
    reason: 'Caldera views, white villages, and sunset viewpoints',
    clips: [
      { title: 'Oia sunset steps', url: 'https://www.youtube.com/shorts/xl5mrBDK6Vs', description: 'Preview the classic village sunset route.' },
      { title: 'Fira caldera walk', url: 'https://www.youtube.com/shorts/sUGIgLiID4w', description: 'Follow cliffside paths and blue sea views.' },
      { title: 'Red Beach viewpoint', url: 'https://www.youtube.com/shorts/UgPvVSvQJfw', description: 'See volcanic color and beach access points.' },
      { title: 'Pyrgos village lane', url: 'https://www.youtube.com/shorts/7mchsrnDaDY', description: 'Walk a quieter hill village with wide views.' },
      { title: 'Ammoudi Bay seafood stop', url: 'https://www.youtube.com/shorts/Rx0wOpcJVig', description: 'End with water-level seafood spots below Oia.' },
    ],
  },
  {
    spot: 'New York City',
    country: 'USA',
    region: 'Americas',
    vibe: 'City break',
    reason: 'Skyline walks, food, museums, and city energy',
    clips: [
      { title: 'Times Square night walk', url: 'https://www.youtube.com/shorts/UTLrEKGu9Vo', description: 'Feel the lights and motion of Midtown.' },
      { title: 'Central Park escape', url: 'https://www.youtube.com/shorts/KQCd8cHCByE', description: 'Take a slower green route through Manhattan.' },
      { title: 'Brooklyn Bridge sunrise', url: 'https://www.youtube.com/shorts/oe7W3sNRdIY', description: 'Cross the bridge with skyline views.' },
      { title: 'SoHo street style', url: 'https://www.youtube.com/shorts/QQMA6TIWZWg', description: 'Walk cast-iron streets, shops, and quick food stops.' },
      { title: 'NYC rooftop views', url: 'https://www.youtube.com/shorts/4U4icWov6Wo', description: 'Finish with a high skyline viewpoint.' },
    ],
  },
  {
    spot: 'Banff',
    country: 'Canada',
    region: 'Americas',
    vibe: 'Wildlife & nature',
    reason: 'Turquoise lakes, mountain trails, and wildlife views',
    clips: [
      { title: 'Lake Louise lakeshore', url: 'https://www.youtube.com/shorts/KzO5yMHLOhc', description: 'Walk the turquoise lake edge below mountain peaks.' },
      { title: 'Moraine Lake sunrise', url: 'https://www.youtube.com/shorts/qz3RohA22wg', description: 'Preview the Valley of Ten Peaks at golden hour.' },
      { title: 'Banff Avenue walk', url: 'https://www.youtube.com/shorts/2a3NkW4Se-s', description: 'See the mountain-town main street and food stops.' },
      { title: 'Johnston Canyon hike', url: 'https://www.youtube.com/shorts/IXQhMi3Z_js', description: 'Follow canyon walkways to waterfalls.' },
      { title: 'Icefields Parkway drive', url: 'https://www.youtube.com/shorts/bZwNZCjznxY', description: 'Preview roadside viewpoints and mountain pullouts.' },
    ],
  },
  {
    spot: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    vibe: 'Wildlife & nature',
    reason: 'Table Mountain, coast roads, penguins, and wine country',
    clips: [
      { title: 'Table Mountain cableway', url: 'https://www.youtube.com/shorts/qZlUwzE1imE', description: 'Start with panoramic city and ocean views.' },
      { title: 'Boulders Beach penguins', url: 'https://www.youtube.com/shorts/JLBUG7J2pII', description: 'See the protected penguin beach boardwalk.' },
      { title: 'Chapmans Peak drive', url: 'https://www.youtube.com/shorts/eipWNT5b21s', description: 'Preview the dramatic coastal road.' },
      { title: 'Bo-Kaap color walk', url: 'https://www.youtube.com/shorts/dfBSF8dQBig', description: 'Walk bright streets and Cape Malay heritage.' },
      { title: 'V&A Waterfront food market', url: 'https://www.youtube.com/shorts/jgy-CzjrNGI', description: 'Finish with harbor food, shops, and music.' },
    ],
  },
]

async function upsertClipVloggers() {
  return Promise.all(clipVloggers.map(vlogger =>
    prisma.user.upsert({
      where: { handle: vlogger.handle },
      update: {
        name: vlogger.name,
        initials: vlogger.initials,
        avatarColor: vlogger.avatarColor,
        country: vlogger.country,
        travelStyle: vlogger.travelStyle,
        verified: true,
      },
      create: {
        ...vlogger,
        bio: `${vlogger.name} shares short, practical travel clips for Tourista explorers.`,
        tagline: 'Short clips, real routes',
        verified: true,
        followers: 3600,
        vlogCount: 18,
        credits: 120,
      },
    }),
  ))
}

async function upsertTourMeGuides() {
  const authors = await upsertClipVloggers()
  let repaired = 0

  for (const [stopIndex, stop] of tourMeStops.entries()) {
    const author = authors[stopIndex % authors.length]
    const title = `Tour Me: ${stop.spot} essential short clips`
    const existing = await prisma.vlog.findFirst({
      where: { title, country: stop.country },
      include: { itinerary: true },
    })
    const firstClip = stop.clips[0]
    const coverImage = highResYoutubeThumb(firstClip.url) || coverPhotoUrl(stop.spot, stop.country, firstClip.title)
    const data = {
      title,
      location: `${stop.spot}, ${stop.country}`,
      country: stop.country,
      region: stop.region,
      vibe: stop.vibe,
      duration: stop.clips.length,
      credits: 0,
      views: 12000 - stopIndex * 420,
      likes: 1800 - stopIndex * 65,
      trending: stopIndex < 4,
      description: stop.reason,
      youtubeUrl: firstClip.url,
      coverImage,
      thumbnailColor: `t${(stopIndex % 5) + 1}`,
      status: 'live',
      authorId: author.id,
    }
    const vlog = existing
      ? await prisma.vlog.update({ where: { id: existing.id }, data, include: { itinerary: true } })
      : await prisma.vlog.create({ data, include: { itinerary: true } })

    await prisma.itineraryDay.deleteMany({ where: { vlogId: vlog.id } })
    await prisma.itineraryDay.createMany({
      data: stop.clips.map((clip, index) => ({
        vlogId: vlog.id,
        day: index + 1,
        activity: clip.title,
        locked: false,
        description: clip.description,
        clipDuration: 'Short',
        clipDescription: JSON.stringify({ media: [{ url: clip.url, type: 'video' }] }),
        highlights: clip.description,
        foodTips: `Save a food stop near ${stop.spot} after this clip if it fits your route.`,
        gettingThere: `Use this clip as the preview stop for day ${index + 1} around ${stop.spot}.`,
        tips: `Autoplay this short with sound before deciding whether to add ${clip.title.toLowerCase()} to your trip.`,
        mediaUrl: clip.url,
        mediaType: 'video',
      })),
    })
    repaired += 1
  }

  return repaired
}

async function repairAllLiveVlogs() {
  const vlogs = await prisma.vlog.findMany({
    where: { status: 'live' },
    include: { itinerary: { orderBy: { day: 'asc' } } },
  })
  let repaired = 0

  for (const vlog of vlogs) {
    const location = vlog.location.split(',')[0]?.trim() || vlog.location || vlog.country
    const minDuration = Math.max(vlog.duration || 0, vlog.itinerary.length, 3)
    const coverImage = bestCoverFor(vlog)

    await prisma.vlog.update({
      where: { id: vlog.id },
      data: {
        duration: minDuration,
        coverImage,
        description: vlog.description || `${location} travel guide with practical stops, local context, and a complete itinerary.`,
      },
    })

    const existingDays = new Set(vlog.itinerary.map(day => day.day))
    for (let day = 1; day <= minDuration; day += 1) {
      if (existingDays.has(day)) continue
      await prisma.itineraryDay.create({
        data: {
          vlogId: vlog.id,
          day,
          activity: `${location} route stop ${day}`,
          locked: day > 2,
          description: `A realistic day ${day} route around ${location}.`,
          highlights: `Key sights and neighborhoods around ${location}.`,
          foodTips: `Choose a local restaurant near the day ${day} route.`,
          gettingThere: `Use local transport or a short taxi ride depending on weather and timing.`,
          tips: `Keep time flexible for queues, traffic, and photo stops.`,
        },
      })
    }
    repaired += 1
  }

  return repaired
}

async function main() {
  const tourMeGuides = await upsertTourMeGuides()
  const liveVlogs = await repairAllLiveVlogs()
  console.log(`Repaired ${tourMeGuides} Tour Me destination guides and checked ${liveVlogs} live vlogs.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
