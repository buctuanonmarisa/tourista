import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/auth-session'

const DEFAULT_PROFILE_HANDLE = 'MarisolRoams'

export async function getCurrentUser(options: { allowDemoFallback?: boolean } = {}) {
  const sessionUserId = getSessionUserId()
  if (sessionUserId) {
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } })
    if (user) return user
  }

  if (!options.allowDemoFallback) return null

  const configuredHandle = process.env.CURRENT_USER_HANDLE?.trim()
  const handles = [configuredHandle, DEFAULT_PROFILE_HANDLE].filter(Boolean) as string[]

  for (const handle of handles) {
    const user = await prisma.user.findUnique({ where: { handle } })
    if (user) return user
  }

  return prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
}
