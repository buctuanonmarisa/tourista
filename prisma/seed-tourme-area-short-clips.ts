import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const lockFor = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const coverPhotoUrl = (spot: string, country: string, theme: string) =>
  `https://loremflickr.com/1200/800/${encodeURIComponent(`${spot} ${country} ${theme}`)},travel/all?lock=${lockFor(`${spot}-${country}-${theme}`)}`

const shortSearchUrl = (spot: string, country: string, theme: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${spot} ${country} ${theme} travel shorts vlog`)}`

const clipVloggers = [
  {
    handle: 'MarisolRoams',
    name: 'Marisol Santos',
    initials: 'MS',
    country: 'Philippines',
    avatarColor: 'ag',
    travelStyle: 'Budget backpacking',
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
    handle: 'EloiseVoyage',
    name: 'Eloise Cruz',
    initials: 'EC',
    country: 'Philippines',
    avatarColor: 'ab',
    travelStyle: 'Beach & islands',
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
    handle: 'NomadNina',
    name: 'Nina Dubois',
    initials: 'ND',
    country: 'France',
    avatarColor: 'ap',
    travelStyle: 'City breaks',
  },
]

const tourMeStops = [
  {
    spot: 'El Nido',
    country: 'Philippines',
    region: 'Philippines',
    vibe: 'Beach & islands',
    clips: ['Big Lagoon kayak route', 'Nacpan Beach sunset', 'island hopping lunch stop', 'Taraw cliff viewpoint', 'El Nido town food crawl'],
  },
  {
    spot: 'Kyoto',
    country: 'Japan',
    region: 'Japan',
    vibe: 'Cultural immersion',
    clips: ['Fushimi Inari gates', 'Arashiyama bamboo walk', 'Gion evening streets', 'Kiyomizu-dera temple route', 'Nishiki Market snacks'],
  },
  {
    spot: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    vibe: 'Food & culture',
    clips: ['Yaowarat street food', 'Wat Arun river view', 'Chatuchak market finds', 'longtail canal ride', 'rooftop night skyline'],
  },
  {
    spot: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    vibe: 'Beach & islands',
    clips: ['Tegalalang rice terrace', 'Uluwatu sunset surf', 'Ubud waterfall route', 'Canggu cafe morning', 'Tanah Lot temple walk'],
  },
  {
    spot: 'Paris',
    country: 'France',
    region: 'Europe',
    vibe: 'City break',
    clips: ['Eiffel Tower sunrise', 'Louvre courtyard walk', 'Montmartre cafe lane', 'Seine picnic route', 'Le Marais pastry stop'],
  },
  {
    spot: 'Rome',
    country: 'Italy',
    region: 'Europe',
    vibe: 'Historical sites',
    clips: ['Colosseum exterior loop', 'Trastevere pasta night', 'Trevi Fountain early walk', 'Pantheon piazza route', 'Vatican museum morning'],
  },
  {
    spot: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    vibe: 'Beach & islands',
    clips: ['Oia sunset steps', 'Fira caldera walk', 'Red Beach viewpoint', 'Pyrgos village lane', 'Ammoudi Bay seafood stop'],
  },
  {
    spot: 'New York City',
    country: 'USA',
    region: 'Americas',
    vibe: 'City break',
    clips: ['Times Square night walk', 'Central Park picnic route', 'Brooklyn Bridge sunrise', 'SoHo street food stop', 'Top of the Rock skyline'],
  },
  {
    spot: 'Banff',
    country: 'Canada',
    region: 'Americas',
    vibe: 'Wildlife & nature',
    clips: ['Lake Louise lakeshore', 'Moraine Lake viewpoint', 'Banff Avenue walk', 'Johnston Canyon trail', 'Icefields Parkway pullout'],
  },
  {
    spot: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    vibe: 'Wildlife & nature',
    clips: ['Table Mountain cableway', 'Boulders Beach penguins', 'Chapmans Peak drive', 'Bo-Kaap color walk', 'V&A Waterfront food market'],
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
        followers: 2400,
        vlogCount: 12,
        credits: 100,
      },
    }),
  ))
}

async function main() {
  const authors = await upsertClipVloggers()
  let upsertedVlogs = 0
  let upsertedDays = 0

  for (const stop of tourMeStops) {
    for (let index = 0; index < stop.clips.length; index += 1) {
      const theme = stop.clips[index]
      const author = authors[index % authors.length]
      const title = `${stop.spot}: ${theme} short`
      const mediaUrl = shortSearchUrl(stop.spot, stop.country, theme)
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
        views: 3600 - index * 220,
        likes: 460 - index * 28,
        trending: index < 3,
        description: `${theme} in ${stop.spot}, captured as a quick thing-to-do clip by @${author.handle}.`,
        coverImage: coverPhotoUrl(stop.spot, stop.country, theme),
        thumbnailColor: `t${(index % 5) + 1}`,
        status: 'live',
        authorId: author.id,
      }

      const vlog = existing
        ? await prisma.vlog.update({ where: { id: existing.id }, data: vlogData, include: { itinerary: true } })
        : await prisma.vlog.create({ data: vlogData, include: { itinerary: true } })

      const dayData = {
        day: 1,
        activity: theme,
        locked: false,
        description: `${theme} in ${stop.spot}.`,
        clipDuration: 'Short',
        clipDescription: JSON.stringify({ media: [{ url: mediaUrl, type: 'video' }] }),
        highlights: `${theme} is one of the most useful short stops to preview before visiting ${stop.spot}.`,
        tips: `Watch @${author.handle}'s clip before adding this stop to your ${stop.spot} route.`,
        mediaUrl,
        mediaType: 'video',
      }

      const existingDay = vlog.itinerary[0]
      if (existingDay) {
        await prisma.itineraryDay.update({ where: { id: existingDay.id }, data: dayData })
      } else {
        await prisma.itineraryDay.create({ data: { ...dayData, vlogId: vlog.id } })
      }

      upsertedVlogs += 1
      upsertedDays += 1
    }
  }

  console.log(`Seeded TourMe clips: ${upsertedVlogs} vlogs and ${upsertedDays} clip itinerary days.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
