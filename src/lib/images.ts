const YUPOO_HOSTS = ['photo.yupoo.com', 'x.yupoo.com', 'y.yupoo.com']
const BUNNY_CDN_BASE_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_BASE_URL?.trim().replace(/\/+$/, '') || 'https://maillotaddict.b-cdn.net'
const BUNNY_OPTIMIZER_ENABLED = process.env.NEXT_PUBLIC_BUNNY_OPTIMIZER_ENABLED === 'true'

const BUNNY_TRANSFORMS = {
  cart: { width: 96, quality: 60, format: 'webp' },
  thumb: { width: 180, quality: 62, format: 'webp' },
  card: { width: 520, quality: 68, format: 'webp' },
  grid: { width: 640, quality: 70, format: 'webp' },
  hero: { width: 900, quality: 72, format: 'webp' },
  gallery: { width: 1400, quality: 78, format: 'webp' },
} as const

export type BunnyTransformPreset = keyof typeof BUNNY_TRANSFORMS

export function isYupooImage(url: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return YUPOO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export function isBunnyImage(url: string): boolean {
  if (!url) return false
  return url.startsWith(BUNNY_CDN_BASE_URL)
}

function withBunnyTransform(url: string, preset: BunnyTransformPreset): string {
  const transform = BUNNY_TRANSFORMS[preset]
  const parsed = new URL(url)
  parsed.searchParams.set('width', String(transform.width))
  parsed.searchParams.set('quality', String(transform.quality))
  parsed.searchParams.set('format', transform.format)
  return parsed.toString()
}

export function getDirectImageUrl(url: string, preset?: BunnyTransformPreset): string {
  if (preset && BUNNY_OPTIMIZER_ENABLED && isBunnyImage(url)) {
    return withBunnyTransform(url, preset)
  }
  return url
}

export function getProxyImageUrl(url: string): string {
  if (!url) return url
  if (!isYupooImage(url)) return url
  return `/api/img?url=${encodeURIComponent(url)}`
}

export function proxyImage(url: string): string {
  return getDirectImageUrl(url)
}
