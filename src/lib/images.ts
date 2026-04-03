const YUPOO_HOSTS = ['photo.yupoo.com', 'x.yupoo.com', 'y.yupoo.com']
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim().replace(/\/+$/, '') || ''
const IMAGEKIT_DEFAULT_TRANSFORM = process.env.NEXT_PUBLIC_IMAGEKIT_DEFAULT_TRANSFORM?.trim() || 'f-auto,q-75'

export function isYupooImage(url: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return YUPOO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export function hasImageKitConfigured(): boolean {
  return Boolean(IMAGEKIT_URL_ENDPOINT)
}

function buildImageKitPath(url: string): string {
  return `${IMAGEKIT_URL_ENDPOINT}/${url}?tr=${encodeURIComponent(IMAGEKIT_DEFAULT_TRANSFORM)}`
}

export function getImageKitUrl(url: string): string {
  if (!url || !hasImageKitConfigured()) return url
  if (!isYupooImage(url)) return url
  return buildImageKitPath(url)
}

export function getDirectImageUrl(url: string): string {
  if (hasImageKitConfigured()) {
    return getImageKitUrl(url)
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
