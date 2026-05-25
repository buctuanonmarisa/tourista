import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SHORT_CLIP_URLS = [
  'https://www.youtube.com/shorts/xwxVLYISc5g',
  'https://www.youtube.com/shorts/aqz-KE-bpKQ',
  'https://www.youtube.com/shorts/ScMzIvxBSi4',
  'https://www.youtube.com/shorts/YE7VzlLtp-4',
]

async function main() {
  const days = await prisma.itineraryDay.findMany({
    orderBy: [{ vlogId: 'asc' }, { day: 'asc' }],
    select: { id: true, day: true, activity: true },
  })

  for (let index = 0; index < days.length; index++) {
    const day = days[index]
    await prisma.itineraryDay.update({
      where: { id: day.id },
      data: {
        mediaUrl: SHORT_CLIP_URLS[index % SHORT_CLIP_URLS.length],
        mediaType: 'video',
        clipDuration: '0:45',
        clipDescription: `Short itinerary clip for Day ${day.day}: ${day.activity}`,
      },
    })
  }

  console.log(`Seeded short video clips for ${days.length} itinerary days.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
