import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.vlog.count()
  if (existing > 0) {
    console.log('Database already seeded — skipping.')
    return
  }

  const marisol = await prisma.user.create({
    data: {
      handle: 'MarisolRoams',
      name: 'MarisolRoams',
      bio: 'Real trips, real costs — no sponsorships. 48 vlogs and counting.',
      tagline: 'Budget travel, island life & authentic food finds',
      initials: 'MR',
      avatarColor: 'ag',
      country: 'Philippines',
      travelStyle: 'Budget',
      verified: true,
      followers: 12400,
      vlogCount: 48,
      avgRating: 4.8,
      totalViews: 38000,
      credits: 432,
      earnings: 4320,
    },
  })

  const kai = await prisma.user.create({
    data: {
      handle: 'TravelWithKai',
      name: 'TravelWithKai',
      initials: 'TK',
      avatarColor: 'ac',
      country: 'Japan',
      verified: true,
      followers: 8200,
      vlogCount: 31,
    },
  })

  const eloise = await prisma.user.create({
    data: {
      handle: 'EloiseVoyage',
      name: 'EloiseVoyage',
      initials: 'EV',
      avatarColor: 'ab',
      country: 'Philippines',
      verified: true,
      followers: 15600,
      vlogCount: 62,
    },
  })

  const solo = await prisma.user.create({
    data: {
      handle: 'SoloLensTrails',
      name: 'SoloLensTrails',
      initials: 'SL',
      avatarColor: 'ap',
      country: 'Vietnam',
      followers: 5300,
      vlogCount: 18,
    },
  })

  const siargao = await prisma.vlog.create({
    data: {
      title: 'Siargao in 7 days — surfing, lagoons & hidden local eats',
      location: 'Siargao, PH',
      country: 'Philippines',
      region: 'Philippines',
      vibe: 'Beach & islands',
      cost: 12500,
      currency: 'PHP',
      duration: 7,
      rating: 4.9,
      ratingCount: 128,
      views: 3200,
      likes: 348,
      credits: 2,
      description:
        "A complete 7-day guide covering Cloud 9 surf breaks at sunrise, Sugba Lagoon, Naked Island, and local warungs that don't appear on any tourist map. Real budget, real tips, zero sponsorships.",
      thumbnailColor: 't1',
      trending: true,
      status: 'live',
      authorId: marisol.id,
      itinerary: {
        create: [
          {
            day: 1,
            activity: 'Arrival + General Luna exploration',
            cost: 1800,
            description: 'Rent scooter ₱400/day, hostel ₱600, market dinner at Kermit. Sunset walk at Union Beach.',
            clipDuration: '1:42',
            clipDescription: 'arrival day highlights',
            locked: false,
          },
          {
            day: 2,
            activity: 'Cloud 9 surf + Magpupungko tide pools',
            cost: 2100,
            description: 'Sunrise at Cloud 9 boardwalk. Surf lesson ₱800 inc. board. Tide pools 7–9am low tide only.',
            clipDuration: '2:14',
            clipDescription: 'surfing & tide pools',
            locked: false,
          },
          {
            day: 3,
            activity: 'Sugba Lagoon full day tour',
            cost: 1500,
            description: 'Boat hire ₱900 for 4 pax. Snorkeling gear rental ₱200. Pack your own lunch.',
            locked: true,
          },
          {
            day: 4,
            activity: 'Naked Island + Daku Island hopping',
            cost: 1200,
            description: 'Island hopping to 3 islands. Bring reef-safe sunscreen.',
            locked: true,
          },
          {
            day: 5,
            activity: 'Pacifico Beach + hidden food spots',
            cost: 900,
            description: 'Drive to Pacifico. Hidden warung lunch near the lighthouse.',
            locked: true,
          },
          {
            day: 6,
            activity: 'Sunrise surf + souvenir shopping',
            cost: 600,
            description: 'Early morning surf session. Afternoon shopping at local market.',
            locked: true,
          },
          {
            day: 7,
            activity: 'Departure',
            cost: 400,
            description: 'Check out and fly home. Tips for airport food.',
            locked: false,
          },
        ],
      },
    },
  })

  await prisma.vlog.create({
    data: {
      title: 'Kyoto weekend under ¥30,000 — budget temple guide',
      location: 'Kyoto, Japan',
      country: 'Japan',
      region: 'Japan',
      vibe: 'Budget travel',
      cost: 28000,
      currency: 'JPY',
      duration: 3,
      rating: 4.7,
      ratingCount: 94,
      views: 2800,
      likes: 203,
      credits: 0,
      description:
        'A budget-friendly 3-day weekend in Kyoto. Fushimi Inari at sunrise, Kinkakuji without the crowds, and Arashiyama bamboo grove on a Tuesday.',
      thumbnailColor: 't2',
      trending: true,
      status: 'live',
      authorId: kai.id,
    },
  })

  await prisma.vlog.create({
    data: {
      title: 'Palawan island hopping — El Nido ultimate guide 2025',
      location: 'Palawan, PH',
      country: 'Philippines',
      region: 'Philippines',
      vibe: 'Beach & islands',
      cost: 18000,
      currency: 'PHP',
      duration: 5,
      rating: 5.0,
      ratingCount: 211,
      views: 6100,
      likes: 892,
      credits: 3,
      description:
        'The definitive 2025 guide to El Nido. Tours A, B, C with actual costs, best boatman contacts, and where to eat without the tourist markup.',
      thumbnailColor: 't3',
      trending: true,
      status: 'live',
      authorId: eloise.id,
    },
  })

  await prisma.vlog.create({
    data: {
      title: "5 days in Hanoi & Ha Long Bay — first timer's complete guide",
      location: 'Hanoi, Vietnam',
      country: 'Vietnam',
      region: 'Southeast Asia',
      vibe: 'Food & culture',
      cost: 15000,
      currency: 'PHP',
      duration: 5,
      rating: 4.8,
      ratingCount: 156,
      views: 4400,
      likes: 521,
      credits: 0,
      description:
        '5 days covering Old Quarter food tours, Ha Long Bay overnight cruise, and Hoan Kiem Lake. Complete with packing list and e-visa guide.',
      thumbnailColor: 't4',
      trending: true,
      status: 'live',
      authorId: solo.id,
    },
  })

  await prisma.review.createMany({
    data: [
      {
        vlogId: siargao.id,
        authorName: 'Janna P.',
        rating: 5,
        text: 'Cost estimates were spot-on. The hidden food spots were incredible. Worth every credit!',
      },
      {
        vlogId: siargao.id,
        authorName: 'Rico G.',
        rating: 4,
        text: '100% authentic, no sponsorships. The clips per day helped me visualize the trip before going.',
      },
    ],
  })

  console.log('✅ Seed complete — 4 vlogs, 4 users, 2 reviews created.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
