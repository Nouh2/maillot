import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const OPS_SESSION_COOKIE = 'maillot_ops_session'
const OPS_SESSION_MAX_AGE = 60 * 60 * 24 * 14

type OpsSessionPayload = {
  username: string
  expiresAt: number
}

function getOpsSecret(): string {
  const secret = process.env.OPS_SESSION_SECRET?.trim()
  if (!secret) {
    throw new Error('OPS_SESSION_SECRET is not set')
  }

  return secret
}

function getExpectedUsername(): string {
  return process.env.OPS_DASHBOARD_USERNAME?.trim() || 'ops'
}

export function getOpsExpectedUsername(): string {
  return getExpectedUsername()
}

export function validateOpsCredentials(username: string, password: string): boolean {
  const expectedPassword = process.env.OPS_DASHBOARD_PASSWORD?.trim()
  if (!expectedPassword) {
    console.error('OPS_DASHBOARD_PASSWORD is not set')
    return false
  }

  return username.trim() === getExpectedUsername() && password === expectedPassword
}

function signPayload(payload: OpsSessionPayload): string {
  const base = `${payload.username}:${payload.expiresAt}`
  const signature = crypto
    .createHmac('sha256', getOpsSecret())
    .update(base)
    .digest('hex')

  return Buffer.from(`${base}:${signature}`, 'utf8').toString('base64url')
}

function parseSignedPayload(value: string): OpsSessionPayload | null {
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8')
    const [username, expiresAtRaw, signature] = decoded.split(':')
    if (!username || !expiresAtRaw || !signature) return null

    const expiresAt = Number(expiresAtRaw)
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

    const expectedSignature = crypto
      .createHmac('sha256', getOpsSecret())
      .update(`${username}:${expiresAt}`)
      .digest('hex')

    if (signature !== expectedSignature) return null

    return { username, expiresAt }
  } catch {
    return null
  }
}

export async function createOpsSession(username: string) {
  const cookieStore = await cookies()
  const value = signPayload({
    username,
    expiresAt: Date.now() + OPS_SESSION_MAX_AGE * 1000,
  })

  cookieStore.set(OPS_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OPS_SESSION_MAX_AGE,
  })
}

export async function clearOpsSession() {
  const cookieStore = await cookies()
  cookieStore.set(OPS_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getOpsSession(): Promise<OpsSessionPayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(OPS_SESSION_COOKIE)?.value
  if (!raw) return null

  return parseSignedPayload(raw)
}

export async function requireOpsSession() {
  const session = await getOpsSession()
  if (!session) {
    throw new Error('OPS_UNAUTHORIZED')
  }

  return session
}
