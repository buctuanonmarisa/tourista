import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const youtubeIdFromUrl = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/)?.[1] || url.split('/').pop() || ''

const highResYoutubeThumb = (url: string) =>
  `https://img.youtube.com/vi/${youtubeIdFromUrl(url)}/maxresdefault.jpg`

const clipVloggers = [
  {
    handle: 'MarisolRoams',
    name: 'Marisol Santos',
    initials: 'MS',
    country: 'Philippines',
    avatarColor: 'ag',
    travelStyle: 'Beach & islands',
  },
  {
    handle: 'TravelWithKai',
    name: 'Kai Nakamura',
    initials: 'KN',
    country: 'Japan',
    avatarColor: 'ac',
    travelStyle: 'Cultural immersion',
  },
  {
    handle: 'ExploreEthan',
    name: 'Ethan Park',
    initials: 'EP',
    country: 'Thailand',
    avatarColor: 'at',
    travelStyle: 'Food & culture',
  },
  {
    handle: 'EloiseVoyage',
    name: 'Eloise Cruz',
    initials: 'EC',
    country: 'Indonesia',
    avatarColor: 'ab',
    travelStyle: 'Beach & islands',
  },
  {
    handle: 'NomadNina',
    name: 'Nina Dubois',
    initials: 'ND',
    country: 'France',
    avatarColor: 'ap',
    travelStyle: 'City breaks',
  },
  {
    handle: 'MarcoWanders',
    name: 'Marco Rossi',
    initials: 'MR',
    country: 'Italy',
    avatarColor: 'ar',
    travelStyle: 'Historical sites',
  },
  {
    handle: 'HelenaExplores',
    name: 'Helena Papadopoulos',
    initials: 'HP',
    country: 'Greece',
    avatarColor: 'ab',
    travelStyle: 'Beach & islands',
  },
  {
    handle: 'JakeNYC',
    name: 'Jake Morrison',
    initials: 'JM',
    country: 'USA',
    avatarColor: 'ay',
    travelStyle: 'City breaks',
  },
  {
    handle: 'OutdoorOlivia',
    name: 'Olivia Chen',
    initials: 'OC',
    country: 'Canada',
    avatarColor: 'ag',
    travelStyle: 'Wildlife & nature',
  },
  {
    handle: 'AfricaWithAlex',
    name: 'Alex Nkosi',
    initials: 'AN',
    country: 'South Africa',
    avatarColor: 'ao',
    travelStyle: 'Wildlife & nature',
  },
]

const tourMeRealClips = [
  {
    spot: 'El Nido',
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Beach & islands',
    clips: [
      { title: 'Big Lagoon kayak adventure', url: 'https://www.youtube.com/shorts/LdKdP6hl6IE', description: 'Kayaking through the stunning Big Lagoon with crystal clear waters' },
      { title: 'Secret Beach exploration', url: 'https://www.youtube.com/shorts/eD5gTYRoK1Q', description: 'Discovering hidden beaches and limestone cliffs' },
      { title: 'Island hopping highlights', url: 'https://www.youtube.com/shorts/1hrEtHyC-WM', description: 'Best spots from island hopping Tour A' },
      { title: 'Nacpan Beach sunset', url: 'https://www.youtube.com/shorts/luRbeAmlLQc', description: 'Golden hour at one of El Nido\'s most beautiful beaches' },
      { title: 'El Nido town vibes', url: 'https://www.youtube.com/shorts/KoW6dO14M8k', description: 'Exploring the charming streets and local food scene' },
    ],
  },
  {
    spot: 'Kyoto',
    country: 'Japan',
    region: 'Japan',
    vibe: 'Cultural immersion',
    clips: [
      { title: 'Fushimi Inari shrine walk', url: 'https://www.youtube.com/shorts/53r0juQgcs4', description: 'Walking through thousands of red torii gates' },
      { title: 'Arashiyama bamboo forest', url: 'https://www.youtube.com/shorts/I6UPbnCDEOY', description: 'Peaceful stroll through towering bamboo groves' },
      { title: 'Gion geisha district', url: 'https://www.youtube.com/shorts/J_dGX9pPh6o', description: 'Traditional streets and tea houses of old Kyoto' },
      { title: 'Kiyomizu-dera temple', url: 'https://www.youtube.com/shorts/cIWTSQa-r9Q', description: 'Iconic wooden temple with city views' },
      { title: 'Nishiki Market food tour', url: 'https://www.youtube.com/shorts/qqU9AgS7qZ0', description: 'Tasting traditional Japanese street food' },
    ],
  },
  {
    spot: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    vibe: 'Food & culture',
    clips: [
      { title: 'Yaowarat street food heaven', url: 'https://www.youtube.com/shorts/RYwzrKxCv1k', description: 'Best street food in Bangkok\'s Chinatown' },
      { title: 'Wat Arun temple tour', url: 'https://www.youtube.com/shorts/a4bXSTSwhKE', description: 'Stunning riverside temple at sunset' },
      { title: 'Chatuchak weekend market', url: 'https://www.youtube.com/shorts/HtbeuimTI6U', description: 'Shopping and snacking at the world\'s largest market' },
      { title: 'Floating market experience', url: 'https://www.youtube.com/shorts/ro0cSvGoLUQ', description: 'Traditional canal market boat tour' },
      { title: 'Bangkok rooftop bars', url: 'https://www.youtube.com/shorts/JjV0jPCWj9A', description: 'Sky-high views and cocktails' },
    ],
  },
  {
    spot: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    vibe: 'Beach & islands',
    clips: [
      { title: 'Tegalalang rice terraces', url: 'https://www.youtube.com/shorts/vYbKn1uE3zo', description: 'Iconic green rice paddies of Ubud' },
      { title: 'Uluwatu temple sunset', url: 'https://www.youtube.com/shorts/GdlfFIsjwn4', description: 'Clifftop temple with ocean views' },
      { title: 'Bali waterfall chasing', url: 'https://www.youtube.com/shorts/8FUc7MAXv4s', description: 'Hidden waterfalls in the jungle' },
      { title: 'Canggu beach life', url: 'https://www.youtube.com/shorts/PJDvoQGcNE0', description: 'Surf, cafes, and sunset vibes' },
      { title: 'Tanah Lot temple', url: 'https://www.youtube.com/shorts/q1NrZ2_FKpE', description: 'Sacred sea temple at golden hour' },
    ],
  },
  {
    spot: 'Paris',
    country: 'France',
    region: 'Europe',
    vibe: 'City break',
    clips: [
      { title: 'Eiffel Tower magic', url: 'https://www.youtube.com/shorts/VLpo8wz2vAU', description: 'Iconic tower from every angle' },
      { title: 'Louvre Museum highlights', url: 'https://www.youtube.com/shorts/8o3M2YtB7H8', description: 'Must-see masterpieces and architecture' },
      { title: 'Montmartre charm', url: 'https://www.youtube.com/shorts/hFafNlpnIWo', description: 'Artistic streets and Sacré-Cœur views' },
      { title: 'Seine River walk', url: 'https://www.youtube.com/shorts/_gIljISgm_k', description: 'Romantic riverside stroll and bridges' },
      { title: 'Paris cafe culture', url: 'https://www.youtube.com/shorts/zoGW4H2IHEs', description: 'Croissants, coffee, and people watching' },
    ],
  },
  {
    spot: 'Rome',
    country: 'Italy',
    region: 'Europe',
    vibe: 'Historical sites',
    clips: [
      { title: 'Colosseum tour', url: 'https://www.youtube.com/shorts/xVAvjSiXdhM', description: 'Ancient amphitheater and gladiator history' },
      { title: 'Trastevere food tour', url: 'https://www.youtube.com/shorts/28_DXf9HVmY', description: 'Authentic Roman pasta and pizza' },
      { title: 'Trevi Fountain visit', url: 'https://www.youtube.com/shorts/e8qMtyhWIig', description: 'Baroque fountain and coin toss tradition' },
      { title: 'Pantheon exploration', url: 'https://www.youtube.com/shorts/WtDHWAXYrQU', description: 'Ancient temple with perfect dome' },
      { title: 'Vatican City tour', url: 'https://www.youtube.com/shorts/K4ecTRKOF4c', description: 'St. Peter\'s Basilica and Sistine Chapel' },
    ],
  },
  {
    spot: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    vibe: 'Beach & islands',
    clips: [
      { title: 'Oia sunset views', url: 'https://www.youtube.com/shorts/xl5mrBDK6Vs', description: 'World-famous sunset from white cliffs' },
      { title: 'Fira caldera walk', url: 'https://www.youtube.com/shorts/sUGIgLiID4w', description: 'Stunning clifftop path with blue domes' },
      { title: 'Red Beach adventure', url: 'https://www.youtube.com/shorts/UgPvVSvQJfw', description: 'Unique volcanic red sand beach' },
      { title: 'Pyrgos village tour', url: 'https://www.youtube.com/shorts/7mchsrnDaDY', description: 'Traditional hilltop village charm' },
      { title: 'Ammoudi Bay seafood', url: 'https://www.youtube.com/shorts/Rx0wOpcJVig', description: 'Fresh seafood by the Aegean Sea' },
    ],
  },
  {
    spot: 'New York City',
    country: 'USA',
    region: 'Americas',
    vibe: 'City break',
    clips: [
      { title: 'Times Square energy', url: 'https://www.youtube.com/shorts/UTLrEKGu9Vo', description: 'Bright lights and bustling crowds' },
      { title: 'Central Park escape', url: 'https://www.youtube.com/shorts/KQCd8cHCByE', description: 'Green oasis in the concrete jungle' },
      { title: 'Brooklyn Bridge walk', url: 'https://www.youtube.com/shorts/oe7W3sNRdIY', description: 'Iconic bridge with skyline views' },
      { title: 'SoHo street style', url: 'https://www.youtube.com/shorts/QQMA6TIWZWg', description: 'Trendy shops and cast-iron architecture' },
      { title: 'NYC rooftop views', url: 'https://www.youtube.com/shorts/4U4icWov6Wo', description: 'Top of the Rock observation deck' },
    ],
  },
  {
    spot: 'Banff',
    country: 'Canada',
    region: 'Americas',
    vibe: 'Wildlife & nature',
    clips: [
      { title: 'Lake Louise beauty', url: 'https://www.youtube.com/shorts/KzO5yMHLOh', description: 'Turquoise glacial lake surrounded by peaks' },
      { title: 'Moraine Lake sunrise', url: 'https://www.youtube.com/shorts/qz3RohA22wg', description: 'Valley of Ten Peaks at golden hour' },
      { title: 'Banff town exploration', url: 'https://www.youtube.com/shorts/2a3NkW4Se-s', description: 'Mountain town charm and local shops' },
      { title: 'Johnston Canyon hike', url: 'https://www.youtube.com/shorts/IXQhMi3Z_js', description: 'Waterfalls and canyon walkways' },
      { title: 'Icefields Parkway drive', url: 'https://www.youtube.com/shorts/bZwNZCjznxY', description: 'Most scenic highway in the world' },
    ],
  },
  {
    spot: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    vibe: 'Wildlife & nature',
    clips: [
      { title: 'Table Mountain cable car', url: 'https://www.youtube.com/shorts/qZlUwzE1imE', description: 'Panoramic views from the flat-top mountain' },
      { title: 'Boulders Beach penguins', url: 'https://www.youtube.com/shorts/JLBUG7J2pII', description: 'Swimming with African penguins' },
      { title: 'Chapman\'s Peak Drive', url: 'https://www.youtube.com/shorts/eipWNT5b21s', description: 'Coastal road with dramatic cliffs' },
      { title: 'Bo-Kaap colorful streets', url: 'https://www.youtube.com/shorts/dfBSF8dQBig', description: 'Rainbow houses and Cape Malay culture' },
      { title: 'V&A Waterfront vibes', url: 'https://www.youtube.com/shorts/jgy-CzjrNGI', description: 'Harbor shopping and dining scene' },
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
        bio: `${vlogger.name} shares authentic travel experiences through short clips.`,
        tagline: 'Real places, real moments',
        verified: true,
        followers: Math.floor(Math.random() * 5000) + 2000,
        vlogCount: 15,
        credits: 150,
      },
    }),
  ))
}

async function main() {
  console.log('🌍 Starting TourMe real clips seeding...')

  const authors = await upsertClipVloggers()
  console.log(`✅ Upserted ${authors.length} vloggers`)

  let upsertedVlogs = 0
  let upsertedDays = 0

  for (const stop of tourMeRealClips) {
    console.log(`\n📍 Processing ${stop.spot}, ${stop.country}...`)

    for (let index = 0; index < stop.clips.length; index += 1) {
      const clip = stop.clips[index]
      const author = authors[index % authors.length]
      const title = `${stop.spot}: ${clip.title}`

      // Check if vlog already exists
      const existing = await prisma.vlog.findFirst({
        where: { title, country: stop.country, authorId: author.id },
        include: { itinerary: true },
      })

      const vlogData = {
        title,
        location: `${stop.spot}, ${stop.country}`,
        country: stop.country,
        region: stop.region,
        vibe: stop.vibe,
        duration: 1,
        credits: 0,
        views: Math.floor(Math.random() * 5000) + 1000,
        likes: Math.floor(Math.random() * 500) + 100,
        trending: index < 2,
        description: clip.description,
        youtubeUrl: clip.url,
        coverImage: highResYoutubeThumb(clip.url),
        thumbnailColor: `t${(index % 5) + 1}`,
        status: 'live',
        authorId: author.id,
      }

      const vlog = existing
        ? await prisma.vlog.update({ where: { id: existing.id }, data: vlogData, include: { itinerary: true } })
        : await prisma.vlog.create({ data: vlogData, include: { itinerary: true } })

      const dayData = {
        day: index + 1,
        activity: clip.title,
        locked: false,
        description: clip.description,
        clipDuration: 'Short',
        clipDescription: JSON.stringify({ media: [{ url: clip.url, type: 'video' }] }),
        highlights: `${clip.title} is a must-see when visiting ${stop.spot}.`,
        tips: `Watch this short clip by @${author.handle} to get a preview of what to expect.`,
        mediaUrl: clip.url,
        mediaType: 'video',
      }

      const existingDay = vlog.itinerary.find(d => d.day === index + 1)
      if (existingDay) {
        await prisma.itineraryDay.update({ where: { id: existingDay.id }, data: dayData })
      } else {
        await prisma.itineraryDay.create({ data: { ...dayData, vlogId: vlog.id } })
      }

      upsertedVlogs += 1
      upsertedDays += 1
      console.log(`  ✓ ${clip.title} by @${author.handle}`)
    }
  }

  console.log(`\n🎉 Seeding complete!`)
  console.log(`📊 Total: ${upsertedVlogs} vlogs and ${upsertedDays} itinerary days`)
}

main()
  .catch(error => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
