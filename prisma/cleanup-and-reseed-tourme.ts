import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// EXACT clips as specified by user
const FINAL_CLIPS = {
  'El Nido': {
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Beach & islands',
    lat: 11.17307562502276,
    lng: 119.3950475274839,
    clips: [
      { url: 'https://www.youtube.com/shorts/LdKdP6hl6IE', title: 'Big Lagoon kayak adventure', description: 'Kayaking through the stunning Big Lagoon with crystal clear waters' },
      { url: 'https://www.youtube.com/shorts/eD5gTYRoK1Q', title: 'Secret Beach exploration', description: 'Discovering hidden beaches and limestone cliffs' },
      { url: 'https://www.youtube.com/shorts/1hrEtHyC-WM', title: 'Island hopping highlights', description: 'Best spots from island hopping Tour A' },
      { url: 'https://www.youtube.com/shorts/luRbeAmlLQc', title: 'Nacpan Beach sunset', description: 'Golden hour at one of El Nido\'s most beautiful beaches' },
      { url: 'https://www.youtube.com/shorts/KoW6dO14M8k', title: 'El Nido town vibes', description: 'Exploring the charming streets and local food scene' },
    ],
  },
  'Kyoto': {
    country: 'Japan',
    region: 'Japan',
    vibe: 'Cultural immersion',
    lat: 34.97131910400563,
    lng: 135.77866553169181,
    clips: [
      { url: 'https://www.youtube.com/shorts/53r0juQgcs4', title: 'Fushimi Inari shrine walk', description: 'Walking through thousands of red torii gates' },
      { url: 'https://www.youtube.com/shorts/I6UPbnCDEOY', title: 'Arashiyama bamboo forest', description: 'Peaceful stroll through towering bamboo groves' },
      { url: 'https://www.youtube.com/shorts/J_dGX9pPh6o', title: 'Gion geisha district', description: 'Traditional streets and tea houses of old Kyoto' },
      { url: 'https://www.youtube.com/shorts/cIWTSQa-r9Q', title: 'Kiyomizu-dera temple', description: 'Iconic wooden temple with city views' },
      { url: 'https://www.youtube.com/shorts/qqU9AgS7qZ0', title: 'Nishiki Market food tour', description: 'Tasting traditional Japanese street food' },
    ],
  },
  'Bangkok': {
    country: 'Thailand',
    region: 'Southeast Asia',
    vibe: 'Food & culture',
    lat: 13.753597290416279,
    lng: 100.49182275558415,
    clips: [
      { url: 'https://www.youtube.com/shorts/RYwzrKxCv1k', title: 'Yaowarat street food heaven', description: 'Best street food in Bangkok\'s Chinatown' },
      { url: 'https://www.youtube.com/shorts/a4bXSTSwhKE', title: 'Wat Arun temple tour', description: 'Stunning riverside temple at sunset' },
      { url: 'https://www.youtube.com/shorts/HtbeuimTI6U', title: 'Chatuchak weekend market', description: 'Shopping and snacking at the world\'s largest market' },
      { url: 'https://www.youtube.com/shorts/ro0cSvGoLUQ', title: 'Floating market experience', description: 'Traditional canal market boat tour' },
      { url: 'https://www.youtube.com/shorts/JjV0jPCWj9A', title: 'Bangkok rooftop bars', description: 'Sky-high views and cocktails' },
    ],
  },
  'Bali': {
    country: 'Indonesia',
    region: 'Southeast Asia',
    vibe: 'Beach & islands',
    lat: -8.590959828681374,
    lng: 115.08592107881513,
    clips: [
      { url: 'https://www.youtube.com/shorts/vYbKn1uE3zo', title: 'Tegalalang rice terraces', description: 'Iconic green rice paddies of Ubud' },
      { url: 'https://www.youtube.com/shorts/GdlfFIsjwn4', title: 'Uluwatu temple sunset', description: 'Clifftop temple with ocean views' },
      { url: 'https://www.youtube.com/shorts/8FUc7MAXv4s', title: 'Bali waterfall chasing', description: 'Hidden waterfalls in the jungle' },
      { url: 'https://www.youtube.com/shorts/PJDvoQGcNE0', title: 'Canggu beach life', description: 'Surf, cafes, and sunset vibes' },
      { url: 'https://www.youtube.com/shorts/q1NrZ2_FKpE', title: 'Tanah Lot temple', description: 'Sacred sea temple at golden hour' },
    ],
  },
  'Paris': {
    country: 'France',
    region: 'Europe',
    vibe: 'City break',
    lat: 48.859697126192614,
    lng: 2.2943954674158236,
    clips: [
      { url: 'https://www.youtube.com/shorts/VLpo8wz2vAU', title: 'Eiffel Tower magic', description: 'Iconic tower from every angle' },
      { url: 'https://www.youtube.com/shorts/8o3M2YtB7H8', title: 'Louvre Museum highlights', description: 'Must-see masterpieces and architecture' },
      { url: 'https://www.youtube.com/shorts/hFafNlpnIWo', title: 'Montmartre charm', description: 'Artistic streets and Sacré-Cœur views' },
      { url: 'https://www.youtube.com/shorts/_gIljISgm_k', title: 'Seine River walk', description: 'Romantic riverside stroll and bridges' },
      { url: 'https://www.youtube.com/shorts/zoGW4H2IHEs', title: 'Paris cafe culture', description: 'Croissants, coffee, and people watching' },
    ],
  },
  'Rome': {
    country: 'Italy',
    region: 'Europe',
    vibe: 'Historical sites',
    lat: 41.89930661187925,
    lng: 12.477098843150232,
    clips: [
      { url: 'https://www.youtube.com/shorts/xVAvjSiXdhM', title: 'Colosseum tour', description: 'Ancient amphitheater and gladiator history' },
      { url: 'https://www.youtube.com/shorts/28_DXf9HVmY', title: 'Trastevere food tour', description: 'Authentic Roman pasta and pizza' },
      { url: 'https://www.youtube.com/shorts/e8qMtyhWIig', title: 'Trevi Fountain visit', description: 'Baroque fountain and coin toss tradition' },
      { url: 'https://www.youtube.com/shorts/WtDHWAXYrQU', title: 'Pantheon exploration', description: 'Ancient temple with perfect dome' },
      { url: 'https://www.youtube.com/shorts/K4ecTRKOF4c', title: 'Vatican City tour', description: 'St. Peter\'s Basilica and Sistine Chapel' },
    ],
  },
  'Santorini': {
    country: 'Greece',
    region: 'Europe',
    vibe: 'Beach & islands',
    lat: 36.41909126407468,
    lng: 25.43215848592153,
    clips: [
      { url: 'https://www.youtube.com/shorts/xl5mrBDK6Vs', title: 'Oia sunset views', description: 'World-famous sunset from white cliffs' },
      { url: 'https://www.youtube.com/shorts/sUGIgLiID4w', title: 'Fira caldera walk', description: 'Stunning clifftop path with blue domes' },
      { url: 'https://www.youtube.com/shorts/UgPvVSvQJfw', title: 'Red Beach adventure', description: 'Unique volcanic red sand beach' },
      { url: 'https://www.youtube.com/shorts/7mchsrnDaDY', title: 'Pyrgos village tour', description: 'Traditional hilltop village charm' },
      { url: 'https://www.youtube.com/shorts/Rx0wOpcJVig', title: 'Ammoudi Bay seafood', description: 'Fresh seafood by the Aegean Sea' },
    ],
  },
  'New York City': {
    country: 'USA',
    region: 'Americas',
    vibe: 'City break',
    lat: 40.58698870663118,
    lng: -73.94609869695802,
    clips: [
      { url: 'https://www.youtube.com/shorts/UTLrEKGu9Vo', title: 'Times Square energy', description: 'Bright lights and bustling crowds' },
      { url: 'https://www.youtube.com/shorts/KQCd8cHCByE', title: 'Central Park escape', description: 'Green oasis in the concrete jungle' },
      { url: 'https://www.youtube.com/shorts/oe7W3sNRdIY', title: 'Brooklyn Bridge walk', description: 'Iconic bridge with skyline views' },
      { url: 'https://www.youtube.com/shorts/QQMA6TIWZWg', title: 'SoHo street style', description: 'Trendy shops and cast-iron architecture' },
      { url: 'https://www.youtube.com/shorts/4U4icWov6Wo', title: 'NYC rooftop views', description: 'Top of the Rock observation deck' },
    ],
  },
  'Banff': {
    country: 'Canada',
    region: 'Americas',
    vibe: 'Wildlife & nature',
    lat: 51.50475402823146,
    lng: -115.92736956972638,
    clips: [
      { url: 'https://www.youtube.com/shorts/KzO5yMHLOh', title: 'Lake Louise beauty', description: 'Turquoise glacial lake surrounded by peaks' },
      { url: 'https://www.youtube.com/shorts/qz3RohA22wg', title: 'Moraine Lake sunrise', description: 'Valley of Ten Peaks at golden hour' },
      { url: 'https://www.youtube.com/shorts/2a3NkW4Se-s', title: 'Banff town exploration', description: 'Mountain town charm and local shops' },
      { url: 'https://www.youtube.com/shorts/IXQhMi3Z_js', title: 'Johnston Canyon hike', description: 'Waterfalls and canyon walkways' },
      { url: 'https://www.youtube.com/shorts/bZwNZCjznxY', title: 'Icefields Parkway drive', description: 'Most scenic highway in the world' },
    ],
  },
  'Cape Town': {
    country: 'South Africa',
    region: 'Africa',
    vibe: 'Wildlife & nature',
    lat: -33.891354246580676,
    lng: 18.42668549225774,
    clips: [
      { url: 'https://www.youtube.com/shorts/qZlUwzE1imE', title: 'Table Mountain cable car', description: 'Panoramic views from the flat-top mountain' },
      { url: 'https://www.youtube.com/shorts/JLBUG7J2pII', title: 'Boulders Beach penguins', description: 'Swimming with African penguins' },
      { url: 'https://www.youtube.com/shorts/eipWNT5b21s', title: 'Chapman\'s Peak Drive', description: 'Coastal road with dramatic cliffs' },
      { url: 'https://www.youtube.com/shorts/dfBSF8dQBig', title: 'Bo-Kaap colorful streets', description: 'Rainbow houses and Cape Malay culture' },
      { url: 'https://www.youtube.com/shorts/jgy-CzjrNGI', title: 'V&A Waterfront vibes', description: 'Harbor shopping and dining scene' },
    ],
  },
}

const clipVloggers = [
  { handle: 'MarisolRoams', name: 'Marisol Santos', initials: 'MS', country: 'Philippines', avatarColor: 'ag', travelStyle: 'Beach & islands' },
  { handle: 'TravelWithKai', name: 'Kai Nakamura', initials: 'KN', country: 'Japan', avatarColor: 'ac', travelStyle: 'Cultural immersion' },
  { handle: 'ExploreEthan', name: 'Ethan Park', initials: 'EP', country: 'Thailand', avatarColor: 'at', travelStyle: 'Food & culture' },
  { handle: 'EloiseVoyage', name: 'Eloise Cruz', initials: 'EC', country: 'Indonesia', avatarColor: 'ab', travelStyle: 'Beach & islands' },
  { handle: 'NomadNina', name: 'Nina Dubois', initials: 'ND', country: 'France', avatarColor: 'ap', travelStyle: 'City breaks' },
  { handle: 'MarcoWanders', name: 'Marco Rossi', initials: 'MR', country: 'Italy', avatarColor: 'ar', travelStyle: 'Historical sites' },
  { handle: 'HelenaExplores', name: 'Helena Papadopoulos', initials: 'HP', country: 'Greece', avatarColor: 'ab', travelStyle: 'Beach & islands' },
  { handle: 'JakeNYC', name: 'Jake Morrison', initials: 'JM', country: 'USA', avatarColor: 'ay', travelStyle: 'City breaks' },
  { handle: 'OutdoorOlivia', name: 'Olivia Chen', initials: 'OC', country: 'Canada', avatarColor: 'ag', travelStyle: 'Wildlife & nature' },
  { handle: 'AfricaWithAlex', name: 'Alex Nkosi', initials: 'AN', country: 'South Africa', avatarColor: 'ao', travelStyle: 'Wildlife & nature' },
]

async function main() {
  console.log('🧹 Starting cleanup and re-seed process...\n')

  // STEP 1: Find all existing Tour Me vlogs
  console.log('📋 Step 1: Finding existing Tour Me vlogs...')
  const existingVlogs = await prisma.vlog.findMany({
    where: {
      OR: [
        { location: { contains: 'El Nido' } },
        { location: { contains: 'Kyoto' } },
        { location: { contains: 'Bangkok' } },
        { location: { contains: 'Bali' } },
        { location: { contains: 'Paris' } },
        { location: { contains: 'Rome' } },
        { location: { contains: 'Santorini' } },
        { location: { contains: 'New York' } },
        { location: { contains: 'Banff' } },
        { location: { contains: 'Cape Town' } },
      ],
    },
    include: {
      itinerary: true,
    },
  })

  console.log(`   Found ${existingVlogs.length} existing vlogs`)

  // STEP 2: Delete related data first (unlocks, reviews)
  console.log('\n🗑️  Step 2: Deleting related data...')
  const vlogIds = existingVlogs.map(v => v.id)

  const deletedUnlocks = await prisma.unlock.deleteMany({
    where: { vlogId: { in: vlogIds } },
  })
  console.log(`   Deleted ${deletedUnlocks.count} unlocks`)

  const deletedReviews = await prisma.review.deleteMany({
    where: { vlogId: { in: vlogIds } },
  })
  console.log(`   Deleted ${deletedReviews.count} reviews`)

  // STEP 3: Delete old Tour Me vlogs (this will cascade delete itinerary days)
  console.log('\n🗑️  Step 3: Deleting old Tour Me vlogs...')
  const deleteResult = await prisma.vlog.deleteMany({
    where: {
      id: { in: vlogIds },
    },
  })
  console.log(`   Deleted ${deleteResult.count} vlogs (and their itinerary days)`)

  // STEP 4: Ensure vloggers exist
  console.log('\n👥 Step 4: Ensuring vloggers exist...')
  const authors = await Promise.all(
    clipVloggers.map(vlogger =>
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
          vlogCount: 5,
          credits: 150,
        },
      }),
    ),
  )
  console.log(`   ✅ ${authors.length} vloggers ready`)

  // STEP 5: Create new vlogs with EXACT clips specified
  console.log('\n📹 Step 5: Creating new vlogs with exact clips...')
  let createdVlogs = 0
  let createdDays = 0

  for (const [spotName, spotData] of Object.entries(FINAL_CLIPS)) {
    console.log(`\n   📍 ${spotName}, ${spotData.country}`)

    for (let index = 0; index < spotData.clips.length; index += 1) {
      const clip = spotData.clips[index]
      const author = authors[index % authors.length]
      const title = `${spotName}: ${clip.title}`

      // Create vlog
      const vlog = await prisma.vlog.create({
        data: {
          title,
          location: `${spotName}, ${spotData.country}`,
          country: spotData.country,
          region: spotData.region,
          vibe: spotData.vibe,
          duration: 1,
          credits: 0,
          views: Math.floor(Math.random() * 5000) + 1000,
          likes: Math.floor(Math.random() * 500) + 100,
          trending: index < 2,
          description: clip.description,
          youtubeUrl: clip.url,
          coverImage: `https://img.youtube.com/vi/${clip.url.split('/').pop()}/hqdefault.jpg`,
          thumbnailColor: `t${(index % 5) + 1}`,
          status: 'live',
          authorId: author.id,
        },
      })

      // Create itinerary day
      await prisma.itineraryDay.create({
        data: {
          vlogId: vlog.id,
          day: index + 1,
          activity: clip.title,
          locked: false,
          description: clip.description,
          clipDuration: 'Short',
          clipDescription: JSON.stringify({ media: [{ url: clip.url, type: 'video' }] }),
          highlights: `${clip.title} is a must-see when visiting ${spotName}.`,
          tips: `Watch this short clip by @${author.handle} to get a preview of what to expect.`,
          mediaUrl: clip.url,
          mediaType: 'video',
        },
      })

      createdVlogs += 1
      createdDays += 1
      console.log(`      ✓ ${clip.title} by @${author.handle}`)
    }
  }

  console.log(`\n✅ Step 5 Complete: Created ${createdVlogs} vlogs and ${createdDays} itinerary days`)

  // STEP 6: Verify the cleanup
  console.log('\n🔍 Step 6: Verifying cleanup...')
  const finalCount = await prisma.vlog.count({
    where: {
      OR: [
        { location: { contains: 'El Nido' } },
        { location: { contains: 'Kyoto' } },
        { location: { contains: 'Bangkok' } },
        { location: { contains: 'Bali' } },
        { location: { contains: 'Paris' } },
        { location: { contains: 'Rome' } },
        { location: { contains: 'Santorini' } },
        { location: { contains: 'New York' } },
        { location: { contains: 'Banff' } },
        { location: { contains: 'Cape Town' } },
      ],
    },
  })

  console.log(`   Total Tour Me vlogs in database: ${finalCount}`)
  console.log(`   Expected: 50 (5 clips × 10 destinations)`)

  if (finalCount === 50) {
    console.log('   ✅ PERFECT! Exactly 50 vlogs as expected')
  } else {
    console.log(`   ⚠️  WARNING: Expected 50 but found ${finalCount}`)
  }

  console.log('\n🎉 Cleanup and re-seed complete!')
  console.log('\n📊 Summary:')
  console.log(`   - Deleted: ${deleteResult.count} old vlogs`)
  console.log(`   - Created: ${createdVlogs} new vlogs`)
  console.log(`   - Created: ${createdDays} itinerary days`)
  console.log(`   - Final count: ${finalCount} vlogs`)
  console.log('\n✅ Database now contains ONLY the exact clips you specified!')
}

main()
  .catch(error => {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
