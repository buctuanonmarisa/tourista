import crypto from 'crypto'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

const SESSION_COOKIE = 'tourista_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

const sessionSecret = () =>
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL || 'tourista-dev-session-secret'

const sign = (userId: string) =>
  crypto.createHmac('sha256', sessionSecret()).update(userId).digest('base64url')

const verify = (userId: string, signature: string) => {
  const expected = sign(userId)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export const getSessionUserId = () => {
  const value = cookies().get(SESSION_COOKIE)?.value
  if (!value) return null

  const [userId, signature] = value.split('.')
  if (!userId || !signature || !verify(userId, signature)) return null
  return userId
}

export const setSessionCookie = (response: NextResponse, userId: string) => {
  response.cookies.set(SESSION_COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  })
}
